"""
Automated Reminder Scheduler for Mutha's Psychology Intelligence
Sends reminders at T-24h and T-2h before sessions
"""

import asyncio
import logging
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import pytz
import os

logger = logging.getLogger(__name__)

class ReminderScheduler:
    """Handles automated reminder scheduling and sending"""
    
    def __init__(self, db, email_service, whatsapp_service):
        self.db = db
        self.email_service = email_service
        self.whatsapp_service = whatsapp_service
        self.india_tz = pytz.timezone('Asia/Kolkata')
        self.running = False
    
    async def check_and_send_reminders(self):
        """Check for upcoming sessions and send reminders"""
        now = datetime.now(self.india_tz)
        
        # Get confirmed bookings
        bookings = await self.db.bookings.find({
            "status": "confirmed"
        }, {"_id": 0}).to_list(500)
        
        for booking in bookings:
            try:
                # Parse booking datetime
                slot_datetime = datetime.strptime(
                    f"{booking['slot_date']} {booking['slot_time']}", 
                    "%Y-%m-%d %H:%M"
                )
                slot_datetime = self.india_tz.localize(slot_datetime)
                
                hours_until = (slot_datetime - now).total_seconds() / 3600
                
                # Check 24h reminder (between 23-25 hours)
                if 23 <= hours_until <= 25:
                    await self._send_reminder(booking, "reminder_24h", hours_until)
                
                # Check 2h reminder (between 1.5-2.5 hours)
                elif 1.5 <= hours_until <= 2.5:
                    await self._send_reminder(booking, "reminder_2h", hours_until)
                    
            except Exception as e:
                logger.error(f"Error processing booking {booking.get('id')}: {e}")
    
    async def _send_reminder(self, booking: dict, reminder_type: str, hours: float):
        """Send a specific reminder if not already sent"""
        booking_id = booking.get('id')
        
        # Check if reminder already sent
        existing = await self.db.email_notifications.find_one({
            "booking_id": booking_id,
            "notification_type": reminder_type
        })
        
        if existing:
            return  # Already sent
        
        # Format date/time for templates
        date_formatted = datetime.strptime(booking['slot_date'], "%Y-%m-%d").strftime("%B %d, %Y")
        time_parts = booking['slot_time'].split(':')
        hour = int(time_parts[0])
        minute = time_parts[1]
        time_formatted = f"{hour % 12 or 12}:{minute} {'PM' if hour >= 12 else 'AM'}"
        
        template_data = {
            "client_name": booking.get('client_name', 'Client'),
            "date": date_formatted,
            "time": time_formatted,
            "duration": booking.get('duration', 45),
            "booking_id": booking_id,
            "booking_id_short": booking_id[:8]
        }
        
        # Send email
        from services.notifications import format_template
        subject, body = format_template(reminder_type, 'email', **template_data)
        
        await self.email_service.send(
            to_email=booking.get('client_email'),
            subject=subject,
            body=body,
            notification_type=reminder_type,
            booking_id=booking_id
        )
        
        # Send WhatsApp
        _, wa_message = format_template(reminder_type, 'whatsapp', **template_data)
        if wa_message and booking.get('client_whatsapp'):
            await self.whatsapp_service.send(
                to_number=booking.get('client_whatsapp'),
                message=wa_message,
                notification_type=reminder_type,
                booking_id=booking_id
            )
        
        logger.info(f"Sent {reminder_type} for booking {booking_id}")
    
    async def send_booking_confirmation(self, booking: dict):
        """Send booking confirmation notifications"""
        date_formatted = datetime.strptime(booking['slot_date'], "%Y-%m-%d").strftime("%B %d, %Y")
        time_parts = booking['slot_time'].split(':')
        hour = int(time_parts[0])
        minute = time_parts[1]
        time_formatted = f"{hour % 12 or 12}:{minute} {'PM' if hour >= 12 else 'AM'}"
        
        template_data = {
            "client_name": booking.get('client_name', 'Client'),
            "date": date_formatted,
            "time": time_formatted,
            "duration": booking.get('duration', 45),
            "amount": booking.get('amount', 0),
            "booking_id": booking.get('id'),
            "booking_id_short": booking.get('id', '')[:8]
        }
        
        from services.notifications import format_template
        
        # Send email
        subject, body = format_template('booking_confirmation', 'email', **template_data)
        await self.email_service.send(
            to_email=booking.get('client_email'),
            subject=subject,
            body=body,
            notification_type='booking_confirmation',
            booking_id=booking.get('id')
        )
        
        # Send WhatsApp
        _, wa_message = format_template('booking_confirmation', 'whatsapp', **template_data)
        if wa_message and booking.get('client_whatsapp'):
            await self.whatsapp_service.send(
                to_number=booking.get('client_whatsapp'),
                message=wa_message,
                notification_type='booking_confirmation',
                booking_id=booking.get('id')
            )
    
    async def send_cancellation(self, booking: dict, refund_eligible: bool):
        """Send cancellation notifications"""
        date_formatted = datetime.strptime(booking['slot_date'], "%Y-%m-%d").strftime("%B %d, %Y")
        time_parts = booking['slot_time'].split(':')
        hour = int(time_parts[0])
        minute = time_parts[1]
        time_formatted = f"{hour % 12 or 12}:{minute} {'PM' if hour >= 12 else 'AM'}"
        
        refund_status = "Refund Status: Eligible for full refund (cancelled 24+ hours before session). Refund will be processed in 5-7 business days." if refund_eligible else "Refund Status: Not eligible (cancelled within 24 hours of session)."
        
        template_data = {
            "client_name": booking.get('client_name', 'Client'),
            "date": date_formatted,
            "time": time_formatted,
            "refund_status": refund_status,
            "booking_id_short": booking.get('id', '')[:8]
        }
        
        from services.notifications import format_template
        
        subject, body = format_template('cancellation', 'email', **template_data)
        await self.email_service.send(
            to_email=booking.get('client_email'),
            subject=subject,
            body=body,
            notification_type='cancellation',
            booking_id=booking.get('id')
        )
        
        _, wa_message = format_template('cancellation', 'whatsapp', **template_data)
        if wa_message and booking.get('client_whatsapp'):
            await self.whatsapp_service.send(
                to_number=booking.get('client_whatsapp'),
                message=wa_message,
                notification_type='cancellation',
                booking_id=booking.get('id')
            )
    
    async def send_feedback_request(self, booking: dict):
        """Send feedback request after session"""
        template_data = {
            "client_name": booking.get('client_name', 'Client'),
            "feedback_link": f"https://muthapsych.com/portal/feedback/{booking.get('id')}"
        }
        
        from services.notifications import format_template
        
        subject, body = format_template('feedback_request', 'email', **template_data)
        await self.email_service.send(
            to_email=booking.get('client_email'),
            subject=subject,
            body=body,
            notification_type='feedback_request',
            booking_id=booking.get('id')
        )

# Background task for checking reminders
async def reminder_check_loop(scheduler: ReminderScheduler):
    """Run reminder checks every 30 minutes"""
    while scheduler.running:
        try:
            await scheduler.check_and_send_reminders()
        except Exception as e:
            logger.error(f"Reminder check error: {e}")
        await asyncio.sleep(1800)  # 30 minutes

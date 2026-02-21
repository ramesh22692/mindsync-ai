"""
Notification Services for Mutha's Psychology Intelligence
- Email notifications (mock/real)
- WhatsApp notifications (mock/real)
- Automated reminders
"""

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
import pytz

logger = logging.getLogger(__name__)

# ==================== EMAIL SERVICE ====================

class EmailService:
    """Email service abstraction - supports mock and real providers"""
    
    def __init__(self, db):
        self.db = db
        self.provider = os.environ.get('EMAIL_PROVIDER', 'mock')  # mock, resend, sendgrid
        self.api_key = os.environ.get('EMAIL_API_KEY')
        self.from_email = os.environ.get('EMAIL_FROM', 'hello@muthapsych.com')
        self.from_name = "Mutha's Psychology Intelligence"
    
    async def send(self, to_email: str, subject: str, body: str, 
                   notification_type: str, booking_id: str = None) -> dict:
        """Send email notification"""
        
        notification = {
            "id": str(__import__('uuid').uuid4()),
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "notification_type": notification_type,
            "booking_id": booking_id,
            "provider": self.provider,
            "status": "pending",
            "sent_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.provider == 'mock':
            notification["status"] = "sent_mock"
            logger.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
        
        elif self.provider == 'resend' and self.api_key:
            try:
                import resend
                resend.api_key = self.api_key
                resend.Emails.send({
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": to_email,
                    "subject": subject,
                    "text": body
                })
                notification["status"] = "sent"
            except Exception as e:
                logger.error(f"Resend error: {e}")
                notification["status"] = "failed"
                notification["error"] = str(e)
        
        elif self.provider == 'sendgrid' and self.api_key:
            try:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                sg = SendGridAPIClient(self.api_key)
                message = Mail(
                    from_email=self.from_email,
                    to_emails=to_email,
                    subject=subject,
                    plain_text_content=body
                )
                sg.send(message)
                notification["status"] = "sent"
            except Exception as e:
                logger.error(f"SendGrid error: {e}")
                notification["status"] = "failed"
                notification["error"] = str(e)
        else:
            notification["status"] = "sent_mock"
        
        # Log to database
        await self.db.email_notifications.insert_one(notification)
        
        return notification

# ==================== WHATSAPP SERVICE ====================

class WhatsAppService:
    """WhatsApp service abstraction - supports mock and Twilio"""
    
    def __init__(self, db):
        self.db = db
        self.provider = os.environ.get('WHATSAPP_PROVIDER', 'mock')  # mock, twilio
        self.account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        self.auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        self.from_number = os.environ.get('TWILIO_WHATSAPP_NUMBER')
    
    async def send(self, to_number: str, message: str, 
                   notification_type: str, booking_id: str = None) -> dict:
        """Send WhatsApp message (generic, no sensitive info)"""
        
        # Ensure number has WhatsApp format
        if not to_number.startswith('whatsapp:'):
            to_number_formatted = f"whatsapp:{to_number}"
        else:
            to_number_formatted = to_number
        
        notification = {
            "id": str(__import__('uuid').uuid4()),
            "to_number": to_number,
            "message": message,
            "notification_type": notification_type,
            "booking_id": booking_id,
            "provider": self.provider,
            "status": "pending",
            "sent_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.provider == 'mock':
            notification["status"] = "sent_mock"
            logger.info(f"[MOCK WHATSAPP] To: {to_number}, Message: {message[:50]}...")
        
        elif self.provider == 'twilio' and self.account_sid and self.auth_token:
            try:
                from twilio.rest import Client
                client = Client(self.account_sid, self.auth_token)
                client.messages.create(
                    from_=f"whatsapp:{self.from_number}",
                    to=to_number_formatted,
                    body=message
                )
                notification["status"] = "sent"
            except Exception as e:
                logger.error(f"Twilio error: {e}")
                notification["status"] = "failed"
                notification["error"] = str(e)
        else:
            notification["status"] = "sent_mock"
        
        # Log to database
        await self.db.whatsapp_notifications.insert_one(notification)
        
        return notification

# ==================== EMAIL TEMPLATES ====================

EMAIL_TEMPLATES = {
    "booking_confirmation": {
        "subject": "Booking Confirmed - Mutha's Psychology Intelligence",
        "body": """Dear {client_name},

Your booking has been confirmed!

📅 Date: {date}
⏰ Time: {time} IST
⏱️ Duration: {duration} minutes
💰 Amount Paid: ₹{amount}

Booking ID: {booking_id}

You will receive a video call link 24 hours before your session.

Important:
- Please be in a quiet, private space for your session
- Have a stable internet connection
- You can reschedule up to 24 hours before the session

Thank you for choosing Mutha's Psychology Intelligence.

Best regards,
Saloni Mutha
"""
    },
    "reminder_24h": {
        "subject": "Reminder: Your Session is Tomorrow - Mutha's Psychology Intelligence",
        "body": """Dear {client_name},

This is a reminder that your psychology consultation is scheduled for tomorrow.

📅 Date: {date}
⏰ Time: {time} IST
⏱️ Duration: {duration} minutes

Preparation Tips:
- Find a quiet, private space
- Test your internet connection
- Have water nearby
- Think about what you'd like to discuss

If you need to reschedule, please do so at least 24 hours before to avoid cancellation charges.

See you tomorrow!

Best regards,
Saloni Mutha
"""
    },
    "reminder_2h": {
        "subject": "Starting Soon: Your Session in 2 Hours - Mutha's Psychology Intelligence",
        "body": """Dear {client_name},

Your psychology consultation starts in 2 hours!

⏰ Time: {time} IST
⏱️ Duration: {duration} minutes

Quick Checklist:
✓ Quiet, private space ready
✓ Internet connection stable
✓ Water nearby
✓ Phone on silent

Looking forward to our session.

Best regards,
Saloni Mutha
"""
    },
    "cancellation": {
        "subject": "Booking Cancelled - Mutha's Psychology Intelligence",
        "body": """Dear {client_name},

Your booking has been cancelled.

Booking Details:
- Date: {date}
- Time: {time} IST

{refund_status}

If you'd like to rebook, please visit our website.

Best regards,
Saloni Mutha
"""
    },
    "reschedule": {
        "subject": "Booking Rescheduled - Mutha's Psychology Intelligence",
        "body": """Dear {client_name},

Your booking has been rescheduled.

Previous Slot: {old_slot}
New Slot: {new_slot}

You will receive a video call link 24 hours before your session.

Best regards,
Saloni Mutha
"""
    },
    "feedback_request": {
        "subject": "How was your session? - Mutha's Psychology Intelligence",
        "body": """Dear {client_name},

Thank you for attending your session today!

We'd love to hear your feedback. Your input helps us improve our services.

Please take a moment to rate your experience:
{feedback_link}

Thank you for your time.

Best regards,
Saloni Mutha
"""
    }
}

WHATSAPP_TEMPLATES = {
    "booking_confirmation": "Hi {client_name}! Your booking is confirmed for {date} at {time} IST. Booking ID: {booking_id_short}. See you soon! - Mutha's Psychology",
    "reminder_24h": "Hi {client_name}! Reminder: Your session is tomorrow at {time} IST. Please ensure you have a quiet space and stable internet. - Mutha's Psychology",
    "reminder_2h": "Hi {client_name}! Your session starts in 2 hours at {time} IST. Get ready! - Mutha's Psychology",
    "cancellation": "Hi {client_name}! Your booking for {date} has been cancelled. Visit our website to rebook. - Mutha's Psychology",
}

def format_template(template_type: str, channel: str, **kwargs) -> tuple:
    """Format a notification template with provided data"""
    if channel == 'email':
        template = EMAIL_TEMPLATES.get(template_type, {})
        subject = template.get('subject', 'Notification')
        body = template.get('body', '').format(**kwargs)
        return subject, body
    elif channel == 'whatsapp':
        template = WHATSAPP_TEMPLATES.get(template_type, '')
        message = template.format(**kwargs)
        return None, message
    return None, None

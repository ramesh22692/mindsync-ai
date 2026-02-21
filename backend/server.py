from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import pytz
import hashlib
import secrets
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Security
security = HTTPBearer(auto_error=False)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize notification services
from services.notifications import EmailService, WhatsAppService
from services.scheduler import ReminderScheduler, reminder_check_loop

email_service = EmailService(db)
whatsapp_service = WhatsAppService(db)
reminder_scheduler = ReminderScheduler(db, email_service, whatsapp_service)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Chatbot Models
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    session_id: str
    message: str
    is_crisis_check: bool = False

class ChatResponse(BaseModel):
    session_id: str
    response: str
    is_crisis_detected: bool = False
    interaction_count: int = 0

class ChatSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    messages: List[dict] = []
    crisis_checked: bool = False
    crisis_detected: bool = False
    interaction_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Intake Form Models
class IntakeFormData(BaseModel):
    full_name: str
    age_range: str  # e.g., "18-25", "26-35", etc.
    city: str
    timezone: str = "Asia/Kolkata"
    preferred_language: str
    concern_areas: List[str]
    stress_level: int = Field(ge=1, le=5)
    optional_note: Optional[str] = Field(default=None, max_length=300)
    email: EmailStr
    whatsapp: str
    privacy_consent: bool
    non_emergency_consent: bool
    crisis_response: bool  # True = YES (crisis), False = NO (safe)

class IntakeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    form_data: dict
    auto_tags: List[str] = []
    suggested_duration: int = 30  # minutes
    status: str = "pending"  # pending, reviewed, booked
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IntakeSubmitResponse(BaseModel):
    id: str
    status: str
    auto_tags: List[str]
    suggested_duration: int
    is_crisis: bool

# Contact Form Models
class ContactFormData(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    form_data: dict
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== AUTH MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    phone: Optional[str] = None
    password_hash: str
    role: str = "client"  # client or admin
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class FeedbackSubmit(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    feedback_text: Optional[str] = None
    would_recommend: bool = True

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str
    user_id: str
    rating: int
    feedback_text: Optional[str] = None
    would_recommend: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash

def create_access_token(user_id: str, email: str, role: str) -> str:
    """Create JWT access token"""
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        if not user.get("is_active", True):
            raise HTTPException(status_code=401, detail="User account is disabled")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user and verify admin role"""
    user = await get_current_user(credentials)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== ADMIN MODELS ====================

class AvailabilitySlot(BaseModel):
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    is_active: bool = True

class BlackoutDate(BaseModel):
    date: str  # YYYY-MM-DD
    reason: Optional[str] = None

class AvailabilitySettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    weekly_slots: List[dict] = []
    blackout_dates: List[dict] = []
    buffer_minutes: int = 15  # Buffer between sessions
    advance_booking_days: int = 30  # How far in advance can book
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminStats(BaseModel):
    total_clients: int
    total_bookings: int
    confirmed_bookings: int
    completed_sessions: int
    cancelled_bookings: int
    total_revenue: int
    pending_revenue: int
    avg_rating: float

# ==================== BOOKING & PAYMENT MODELS ====================

class TimeSlot(BaseModel):
    date: str  # YYYY-MM-DD
    time: str  # HH:MM (24hr format)
    duration: int  # minutes
    available: bool = True

class BookingRequest(BaseModel):
    intake_id: str
    slot_date: str  # YYYY-MM-DD
    slot_time: str  # HH:MM
    duration: int  # 30, 45, or 60
    service_type: str  # individual, couples, career, academic, habit

class PaymentRequest(BaseModel):
    booking_id: str
    amount: int  # in paise
    payment_method: str = "card"  # card, upi, netbanking

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    intake_id: str
    client_name: str
    client_email: str
    client_whatsapp: str
    service_type: str
    slot_date: str
    slot_time: str
    duration: int
    amount: int
    status: str = "pending"  # pending, payment_pending, confirmed, cancelled, completed
    payment_id: Optional[str] = None
    payment_status: str = "pending"  # pending, processing, completed, failed, refunded
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmailNotification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    to_email: str
    subject: str
    body: str
    notification_type: str  # booking_confirmation, reminder_24h, reminder_2h, cancellation
    booking_id: Optional[str] = None
    status: str = "sent"  # In mock mode, always "sent"
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== CHATBOT SYSTEM PROMPT ====================

CHATBOT_SYSTEM_PROMPT = """You are the AI Receptionist for Mutha's Psychology Intelligence, a professional psychology consultation service in India.

CRITICAL RULES:
1. You are NOT a therapist, psychologist, or medical professional.
2. You CANNOT diagnose, provide therapy, or give medical advice.
3. You are here to help with: scheduling, service information, pricing, and general questions.
4. ALWAYS be warm, professional, and empathetic.
5. Keep responses concise (2-4 sentences max).

CRISIS PROTOCOL:
- If anyone mentions self-harm, suicide, harm to others, or immediate danger, you MUST:
  1. Express care and concern
  2. NOT attempt to counsel them
  3. Direct them to emergency services (112 in India) or nearest hospital
  4. End the conversation flow and display crisis resources

WHAT YOU CAN HELP WITH:
- Service categories (Individual, Couples, Career, Academic, Habit Building)
- Pricing information (Rs 1500-3000 per session)
- Booking process explanation
- General FAQs
- Directing to intake form

WHAT YOU CANNOT DO:
- Provide diagnosis or clinical assessments
- Offer therapeutic advice
- Handle emergencies
- Make medical recommendations

Always end with a helpful suggestion or question to guide the user."""

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Mutha's Psychology Intelligence API"}

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register_user(user_data: UserRegister):
    """Register a new user"""
    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email.lower(),
        full_name=user_data.full_name,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        role="client"
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create token
    token = create_access_token(user.id, user.email, user.role)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login_user(credentials: UserLogin):
    """Login user and return token"""
    user = await db.users.find_one({"email": credentials.email.lower()}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    # Create token
    token = create_access_token(user["id"], user["email"], user["role"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            phone=user.get("phone"),
            role=user["role"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        phone=current_user.get("phone"),
        role=current_user["role"]
    )

@api_router.put("/auth/profile")
async def update_profile(
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if full_name:
        updates["full_name"] = full_name
    if phone:
        updates["phone"] = phone
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": updates}
    )
    
    return {"status": "updated"}

# ==================== CLIENT PORTAL ROUTES ====================

@api_router.get("/portal/bookings")
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    """Get all bookings for current user"""
    bookings = await db.bookings.find(
        {"client_email": current_user["email"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"bookings": bookings}

@api_router.get("/portal/booking/{booking_id}")
async def get_my_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific booking for current user"""
    booking = await db.bookings.find_one(
        {"id": booking_id, "client_email": current_user["email"]},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

@api_router.post("/portal/booking/{booking_id}/cancel")
async def cancel_my_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel a booking (if within policy window)"""
    booking = await db.bookings.find_one(
        {"id": booking_id, "client_email": current_user["email"]},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    if booking["status"] == "completed":
        raise HTTPException(status_code=400, detail="Cannot cancel completed booking")
    
    # Check if within 24 hours
    india_tz = pytz.timezone('Asia/Kolkata')
    slot_datetime = datetime.strptime(f"{booking['slot_date']} {booking['slot_time']}", "%Y-%m-%d %H:%M")
    slot_datetime = india_tz.localize(slot_datetime)
    now = datetime.now(india_tz)
    
    hours_until_session = (slot_datetime - now).total_seconds() / 3600
    
    refund_eligible = hours_until_session > 24
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": "cancelled",
                "cancelled_at": datetime.now(timezone.utc).isoformat(),
                "refund_eligible": refund_eligible,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Send cancellation email (mocked)
    await send_mock_email(
        to_email=booking["client_email"],
        subject="Booking Cancelled - Mutha's Psychology Intelligence",
        body=f"""
Dear {booking["client_name"]},

Your booking has been cancelled.

Booking Details:
- Date: {booking["slot_date"]}
- Time: {booking["slot_time"]} IST

{"Refund Status: Eligible for full refund (cancelled 24+ hours before session)" if refund_eligible else "Refund Status: Not eligible (cancelled within 24 hours)"}

If you'd like to rebook, please visit our website.

Best regards,
Saloni Mutha
        """,
        notification_type="cancellation",
        booking_id=booking_id
    )
    
    return {
        "status": "cancelled",
        "refund_eligible": refund_eligible,
        "message": "Booking cancelled successfully" + (". Refund will be processed in 5-7 business days." if refund_eligible else ". No refund as cancellation was within 24 hours.")
    }

@api_router.post("/portal/booking/{booking_id}/reschedule")
async def reschedule_booking(
    booking_id: str,
    new_date: str,
    new_time: str,
    current_user: dict = Depends(get_current_user)
):
    """Reschedule a booking to a new slot"""
    booking = await db.bookings.find_one(
        {"id": booking_id, "client_email": current_user["email"]},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["status"] not in ["confirmed", "payment_pending"]:
        raise HTTPException(status_code=400, detail="Cannot reschedule this booking")
    
    # Check if new slot is available
    existing = await db.bookings.find_one({
        "slot_date": new_date,
        "slot_time": new_time,
        "status": {"$in": ["confirmed", "payment_pending"]},
        "id": {"$ne": booking_id}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="New slot is not available")
    
    old_slot = f"{booking['slot_date']} at {booking['slot_time']}"
    
    # Update booking
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "slot_date": new_date,
                "slot_time": new_time,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Send reschedule email (mocked)
    await send_mock_email(
        to_email=booking["client_email"],
        subject="Booking Rescheduled - Mutha's Psychology Intelligence",
        body=f"""
Dear {booking["client_name"]},

Your booking has been rescheduled.

Previous Slot: {old_slot} IST
New Slot: {new_date} at {new_time} IST

You will receive a video call link 24 hours before your session.

Best regards,
Saloni Mutha
        """,
        notification_type="reschedule",
        booking_id=booking_id
    )
    
    return {
        "status": "rescheduled",
        "old_slot": old_slot,
        "new_slot": f"{new_date} at {new_time}",
        "message": "Booking rescheduled successfully"
    }

@api_router.post("/portal/feedback")
async def submit_feedback(feedback_data: FeedbackSubmit, current_user: dict = Depends(get_current_user)):
    """Submit feedback for a completed session"""
    # Verify booking belongs to user and is completed
    booking = await db.bookings.find_one(
        {"id": feedback_data.booking_id, "client_email": current_user["email"]},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if feedback already exists
    existing_feedback = await db.feedback.find_one({"booking_id": feedback_data.booking_id})
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this booking")
    
    # Create feedback
    feedback = Feedback(
        booking_id=feedback_data.booking_id,
        user_id=current_user["id"],
        rating=feedback_data.rating,
        feedback_text=feedback_data.feedback_text,
        would_recommend=feedback_data.would_recommend
    )
    
    doc = feedback.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.feedback.insert_one(doc)
    
    return {"status": "submitted", "message": "Thank you for your feedback!"}

@api_router.get("/portal/feedback/{booking_id}")
async def get_feedback(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Get feedback for a booking"""
    feedback = await db.feedback.find_one(
        {"booking_id": booking_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not feedback:
        return {"exists": False}
    
    return {"exists": True, "feedback": feedback}

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/setup")
async def setup_admin(email: str, password: str, secret_key: str):
    """One-time admin setup (requires secret key)"""
    # Simple secret key check - in production, use env variable
    if secret_key != "mutha_admin_setup_2026":
        raise HTTPException(status_code=403, detail="Invalid setup key")
    
    # Check if admin already exists
    existing = await db.users.find_one({"role": "admin"})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    # Create admin user
    admin = User(
        email=email.lower(),
        full_name="Saloni Mutha",
        password_hash=hash_password(password),
        role="admin"
    )
    
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create default availability settings
    default_slots = [
        {"day_of_week": i, "start_time": "10:00", "end_time": "20:00", "is_active": i < 6}  # Mon-Sat
        for i in range(7)
    ]
    
    availability = AvailabilitySettings(weekly_slots=default_slots)
    avail_doc = availability.model_dump()
    avail_doc['updated_at'] = avail_doc['updated_at'].isoformat()
    await db.availability_settings.insert_one(avail_doc)
    
    return {"status": "success", "message": "Admin account created"}

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get dashboard statistics"""
    # Count clients
    total_clients = await db.users.count_documents({"role": "client"})
    
    # Count bookings by status
    total_bookings = await db.bookings.count_documents({})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    completed_sessions = await db.bookings.count_documents({"status": "completed"})
    cancelled_bookings = await db.bookings.count_documents({"status": "cancelled"})
    
    # Calculate revenue
    confirmed_revenue = await db.bookings.aggregate([
        {"$match": {"status": {"$in": ["confirmed", "completed"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    total_revenue = confirmed_revenue[0]["total"] if confirmed_revenue else 0
    
    pending_revenue = await db.bookings.aggregate([
        {"$match": {"status": "payment_pending"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    pending = pending_revenue[0]["total"] if pending_revenue else 0
    
    # Average rating
    ratings = await db.feedback.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
    ]).to_list(1)
    avg_rating = round(ratings[0]["avg"], 1) if ratings else 0
    
    return {
        "total_clients": total_clients,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "completed_sessions": completed_sessions,
        "cancelled_bookings": cancelled_bookings,
        "total_revenue": total_revenue,
        "pending_revenue": pending,
        "avg_rating": avg_rating
    }

@api_router.get("/admin/bookings")
async def get_all_bookings(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Get all bookings with filters"""
    query = {}
    
    if status:
        query["status"] = status
    
    if date_from:
        query["slot_date"] = {"$gte": date_from}
    
    if date_to:
        if "slot_date" in query:
            query["slot_date"]["$lte"] = date_to
        else:
            query["slot_date"] = {"$lte": date_to}
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("slot_date", -1).to_list(500)
    
    return {"bookings": bookings, "total": len(bookings)}

@api_router.get("/admin/booking/{booking_id}")
async def get_booking_admin(booking_id: str, admin: dict = Depends(get_admin_user)):
    """Get booking details with intake info"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Get intake info
    intake = await db.intake_responses.find_one(
        {"id": booking.get("intake_id")},
        {"_id": 0}
    )
    
    # Get feedback if exists
    feedback = await db.feedback.find_one({"booking_id": booking_id}, {"_id": 0})
    
    return {
        "booking": booking,
        "intake": intake,
        "feedback": feedback
    }

@api_router.put("/admin/booking/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    new_status: str,
    admin: dict = Depends(get_admin_user)
):
    """Update booking status (admin only)"""
    valid_statuses = ["pending", "payment_pending", "confirmed", "completed", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"status": "updated", "new_status": new_status}

@api_router.get("/admin/clients")
async def get_all_clients(admin: dict = Depends(get_admin_user)):
    """Get all clients with booking counts"""
    clients = await db.users.find(
        {"role": "client"},
        {"_id": 0, "password_hash": 0}
    ).to_list(500)
    
    # Add booking counts for each client
    for client in clients:
        booking_count = await db.bookings.count_documents({"client_email": client["email"]})
        client["booking_count"] = booking_count
    
    return {"clients": clients, "total": len(clients)}

@api_router.get("/admin/client/{client_id}")
async def get_client_details(client_id: str, admin: dict = Depends(get_admin_user)):
    """Get client profile with all bookings and intakes"""
    client = await db.users.find_one(
        {"id": client_id, "role": "client"},
        {"_id": 0, "password_hash": 0}
    )
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get all bookings for this client
    bookings = await db.bookings.find(
        {"client_email": client["email"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get all intakes
    intake_ids = [b.get("intake_id") for b in bookings if b.get("intake_id")]
    intakes = await db.intake_responses.find(
        {"id": {"$in": intake_ids}},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "client": client,
        "bookings": bookings,
        "intakes": intakes
    }

@api_router.get("/admin/availability")
async def get_availability(admin: dict = Depends(get_admin_user)):
    """Get current availability settings"""
    settings = await db.availability_settings.find_one({}, {"_id": 0})
    
    if not settings:
        # Return default settings
        return {
            "weekly_slots": [
                {"day_of_week": i, "start_time": "10:00", "end_time": "20:00", "is_active": i < 6}
                for i in range(7)
            ],
            "blackout_dates": [],
            "buffer_minutes": 15,
            "advance_booking_days": 30
        }
    
    return settings

@api_router.put("/admin/availability")
async def update_availability(
    weekly_slots: Optional[List[dict]] = None,
    blackout_dates: Optional[List[dict]] = None,
    buffer_minutes: Optional[int] = None,
    advance_booking_days: Optional[int] = None,
    admin: dict = Depends(get_admin_user)
):
    """Update availability settings"""
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if weekly_slots is not None:
        updates["weekly_slots"] = weekly_slots
    if blackout_dates is not None:
        updates["blackout_dates"] = blackout_dates
    if buffer_minutes is not None:
        updates["buffer_minutes"] = buffer_minutes
    if advance_booking_days is not None:
        updates["advance_booking_days"] = advance_booking_days
    
    # Upsert availability settings
    await db.availability_settings.update_one(
        {},
        {"$set": updates},
        upsert=True
    )
    
    return {"status": "updated"}

@api_router.post("/admin/blackout")
async def add_blackout_date(
    date: str,
    reason: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Add a blackout date"""
    await db.availability_settings.update_one(
        {},
        {"$push": {"blackout_dates": {"date": date, "reason": reason}}},
        upsert=True
    )
    
    return {"status": "added", "date": date}

@api_router.delete("/admin/blackout/{date}")
async def remove_blackout_date(date: str, admin: dict = Depends(get_admin_user)):
    """Remove a blackout date"""
    await db.availability_settings.update_one(
        {},
        {"$pull": {"blackout_dates": {"date": date}}}
    )
    
    return {"status": "removed", "date": date}

@api_router.get("/admin/intake-summary/{booking_id}")
async def generate_intake_summary(booking_id: str, admin: dict = Depends(get_admin_user)):
    """Generate AI summary of intake for session prep (admin only)"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    intake = await db.intake_responses.find_one(
        {"id": booking.get("intake_id")},
        {"_id": 0}
    )
    
    if not intake:
        return {"summary": "No intake data available", "suggestions": []}
    
    form_data = intake.get("form_data", {})
    
    # Generate simple summary (can be enhanced with LLM)
    summary = f"""
Client: {form_data.get('full_name', 'N/A')}
Age Range: {form_data.get('age_range', 'N/A')}
Location: {form_data.get('city', 'N/A')}
Language: {form_data.get('preferred_language', 'N/A')}

Concern Areas: {', '.join(form_data.get('concern_areas', []))}
Stress Level: {form_data.get('stress_level', 'N/A')}/5

Additional Notes: {form_data.get('optional_note', 'None provided')}
    """.strip()
    
    # Simple suggestions based on concerns
    suggestions = []
    concerns = form_data.get('concern_areas', [])
    
    if 'anxiety' in concerns:
        suggestions.append("Consider grounding exercises and breathing techniques")
    if 'work_stress' in concerns:
        suggestions.append("Explore work-life boundaries and stress management")
    if 'relationships' in concerns:
        suggestions.append("Focus on communication patterns and attachment styles")
    if 'self_esteem' in concerns:
        suggestions.append("Work on self-compassion and cognitive restructuring")
    if 'career' in concerns:
        suggestions.append("Discuss career values, goals, and decision-making frameworks")
    if 'exam_stress' in concerns:
        suggestions.append("Cover study techniques, time management, and test anxiety coping")
    
    return {
        "summary": summary,
        "suggestions": suggestions,
        "auto_tags": intake.get("auto_tags", []),
        "disclaimer": "AI-generated summary for operational support; not diagnostic."
    }

@api_router.get("/admin/reports/revenue")
async def get_revenue_report(
    period: str = "month",  # week, month, year
    admin: dict = Depends(get_admin_user)
):
    """Get revenue report"""
    india_tz = pytz.timezone('Asia/Kolkata')
    now = datetime.now(india_tz)
    
    if period == "week":
        start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    elif period == "month":
        start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
    else:
        start_date = (now - timedelta(days=365)).strftime("%Y-%m-%d")
    
    # Get completed bookings in period
    bookings = await db.bookings.find({
        "status": {"$in": ["confirmed", "completed"]},
        "slot_date": {"$gte": start_date}
    }, {"_id": 0}).to_list(1000)
    
    total_revenue = sum(b.get("amount", 0) for b in bookings)
    booking_count = len(bookings)
    
    # Group by service type
    by_service = {}
    for b in bookings:
        service = b.get("service_type", "unknown")
        if service not in by_service:
            by_service[service] = {"count": 0, "revenue": 0}
        by_service[service]["count"] += 1
        by_service[service]["revenue"] += b.get("amount", 0)
    
    return {
        "period": period,
        "start_date": start_date,
        "total_revenue": total_revenue,
        "booking_count": booking_count,
        "by_service": by_service
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ==================== CHATBOT ROUTES ====================

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """AI Receptionist chat endpoint with crisis gating"""
    try:
        # Get or create session
        session = await db.chatbot_sessions.find_one(
            {"session_id": request.session_id},
            {"_id": 0}
        )
        
        if not session:
            session = ChatSession(session_id=request.session_id).model_dump()
            session['created_at'] = session['created_at'].isoformat()
            session['updated_at'] = session['updated_at'].isoformat()
            await db.chatbot_sessions.insert_one(session)
        
        # Crisis detection keywords
        crisis_keywords = [
            "suicide", "kill myself", "end my life", "want to die",
            "hurt myself", "self-harm", "harm myself", "harm someone",
            "kill someone", "hurt someone", "emergency", "crisis",
            "danger", "unsafe", "not safe"
        ]
        
        message_lower = request.message.lower()
        is_crisis = any(keyword in message_lower for keyword in crisis_keywords)
        
        # If crisis detected
        if is_crisis:
            await db.chatbot_sessions.update_one(
                {"session_id": request.session_id},
                {
                    "$set": {
                        "crisis_detected": True,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            crisis_response = """I hear that you're going through something very difficult right now, and I'm concerned about your safety.

This is beyond what I can help with as an AI receptionist. Please reach out immediately to:
- Emergency Services: 112 (India)
- iCall: 9152987821
- Vandrevala Foundation: 1860-2662-345

Please contact a trusted person or go to your nearest hospital emergency room. Your safety matters."""
            
            return ChatResponse(
                session_id=request.session_id,
                response=crisis_response,
                is_crisis_detected=True,
                interaction_count=session.get('interaction_count', 0) + 1
            )
        
        # Normal conversation with AI
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=request.session_id,
            system_message=CHATBOT_SYSTEM_PROMPT
        ).with_model("openai", "gpt-5.2")
        
        # Add conversation history
        history = session.get('messages', [])
        for msg in history[-10:]:  # Last 10 messages for context
            if msg['role'] == 'user':
                await chat.send_message(UserMessage(text=msg['content']))
        
        # Send current message
        user_msg = UserMessage(text=request.message)
        response = await chat.send_message(user_msg)
        
        # Update session
        new_interaction_count = session.get('interaction_count', 0) + 1
        new_messages = session.get('messages', [])
        new_messages.append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        new_messages.append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        await db.chatbot_sessions.update_one(
            {"session_id": request.session_id},
            {
                "$set": {
                    "messages": new_messages,
                    "interaction_count": new_interaction_count,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return ChatResponse(
            session_id=request.session_id,
            response=response,
            is_crisis_detected=False,
            interaction_count=new_interaction_count
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@api_router.get("/chat/session/{session_id}")
async def get_chat_session(session_id: str):
    """Get chat session history"""
    session = await db.chatbot_sessions.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    if not session:
        return {"session_id": session_id, "messages": [], "interaction_count": 0}
    return session

# ==================== INTAKE FORM ROUTES ====================

def determine_tags_and_duration(concern_areas: List[str], stress_level: int) -> tuple:
    """Auto-tag and suggest duration based on intake data"""
    tags = []
    base_duration = 30
    
    concern_tag_map = {
        "exam_stress": "Academic Support",
        "anxiety": "Anxiety Management",
        "relationships": "Relationship Counselling",
        "career": "Career Guidance",
        "habit_building": "Habit Building",
        "self_esteem": "Self-Esteem",
        "sleep_issues": "Sleep Support",
        "grief": "Grief Support",
        "depression": "Mood Support",
        "work_stress": "Work-Life Balance"
    }
    
    for concern in concern_areas:
        concern_lower = concern.lower().replace(" ", "_").replace("-", "_")
        if concern_lower in concern_tag_map:
            tags.append(concern_tag_map[concern_lower])
        else:
            tags.append(concern.title())
    
    # Duration logic
    if len(concern_areas) >= 3 or stress_level >= 4:
        base_duration = 60
    elif len(concern_areas) >= 2 or stress_level >= 3:
        base_duration = 45
    
    return tags, base_duration

@api_router.post("/intake", response_model=IntakeSubmitResponse)
async def submit_intake_form(form_data: IntakeFormData):
    """Submit intake form with crisis gating"""
    
    # CRITICAL: Crisis gate check
    if form_data.crisis_response:
        return IntakeSubmitResponse(
            id="",
            status="crisis_redirect",
            auto_tags=[],
            suggested_duration=0,
            is_crisis=True
        )
    
    # Process normal intake
    tags, duration = determine_tags_and_duration(
        form_data.concern_areas,
        form_data.stress_level
    )
    
    intake = IntakeResponse(
        form_data=form_data.model_dump(),
        auto_tags=tags,
        suggested_duration=duration
    )
    
    doc = intake.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.intake_responses.insert_one(doc)
    
    return IntakeSubmitResponse(
        id=intake.id,
        status="submitted",
        auto_tags=tags,
        suggested_duration=duration,
        is_crisis=False
    )

@api_router.get("/intake/{intake_id}")
async def get_intake(intake_id: str):
    """Get intake response by ID"""
    intake = await db.intake_responses.find_one(
        {"id": intake_id},
        {"_id": 0}
    )
    if not intake:
        raise HTTPException(status_code=404, detail="Intake not found")
    return intake

# ==================== CONTACT FORM ROUTES ====================

@api_router.post("/contact")
async def submit_contact_form(form_data: ContactFormData):
    """Submit contact form"""
    contact = ContactResponse(form_data=form_data.model_dump())
    doc = contact.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_submissions.insert_one(doc)
    
    return {"id": contact.id, "status": "submitted", "message": "Thank you for reaching out. We'll respond within 24-48 hours."}

# ==================== AVAILABILITY & SLOTS ROUTES ====================

def get_available_slots(start_date: datetime, days: int = 7) -> List[dict]:
    """Generate available slots for the next N days"""
    slots = []
    india_tz = pytz.timezone('Asia/Kolkata')
    
    # Working hours: 10 AM to 8 PM IST
    working_hours = [10, 11, 12, 14, 15, 16, 17, 18, 19]  # Skip 1 PM for lunch
    
    for day_offset in range(days):
        current_date = start_date + timedelta(days=day_offset)
        
        # Skip Sundays (weekday 6)
        if current_date.weekday() == 6:
            continue
        
        date_str = current_date.strftime('%Y-%m-%d')
        
        for hour in working_hours:
            # Add slots at :00 and :30
            for minute in [0, 30]:
                time_str = f"{hour:02d}:{minute:02d}"
                slots.append({
                    "date": date_str,
                    "time": time_str,
                    "datetime_ist": f"{date_str}T{time_str}:00+05:30",
                    "available": True
                })
    
    return slots

@api_router.get("/slots")
async def get_slots(days: int = 14):
    """Get available booking slots for the next N days"""
    india_tz = pytz.timezone('Asia/Kolkata')
    now_ist = datetime.now(india_tz)
    
    # Start from tomorrow
    start_date = now_ist + timedelta(days=1)
    
    slots = get_available_slots(start_date, days)
    
    # Get booked slots from database
    booked = await db.bookings.find(
        {"status": {"$in": ["confirmed", "payment_pending"]}},
        {"_id": 0, "slot_date": 1, "slot_time": 1, "duration": 1}
    ).to_list(1000)
    
    booked_set = {(b["slot_date"], b["slot_time"]) for b in booked}
    
    # Mark booked slots as unavailable
    for slot in slots:
        if (slot["date"], slot["time"]) in booked_set:
            slot["available"] = False
    
    return {
        "slots": slots,
        "timezone": "Asia/Kolkata",
        "generated_at": now_ist.isoformat()
    }

@api_router.get("/slots/{date}")
async def get_slots_for_date(date: str):
    """Get available slots for a specific date"""
    try:
        target_date = datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    india_tz = pytz.timezone('Asia/Kolkata')
    now_ist = datetime.now(india_tz)
    
    # Check if date is in the past
    if target_date.date() < now_ist.date():
        raise HTTPException(status_code=400, detail="Cannot book slots in the past")
    
    slots = get_available_slots(target_date, 1)
    
    # Get booked slots for this date
    booked = await db.bookings.find(
        {"slot_date": date, "status": {"$in": ["confirmed", "payment_pending"]}},
        {"_id": 0, "slot_time": 1, "duration": 1}
    ).to_list(100)
    
    booked_times = {b["slot_time"] for b in booked}
    
    for slot in slots:
        if slot["time"] in booked_times:
            slot["available"] = False
    
    return {"date": date, "slots": slots}

# ==================== BOOKING ROUTES ====================

def calculate_price(duration: int, service_type: str) -> int:
    """Calculate price based on duration and service type"""
    base_prices = {
        30: 1000,
        45: 1500,
        60: 2000
    }
    
    # Couples sessions have premium pricing
    if service_type == "couples":
        return 2500
    
    return base_prices.get(duration, 1500)

@api_router.post("/booking")
async def create_booking(request: BookingRequest):
    """Create a new booking"""
    # Validate intake exists
    intake = await db.intake_responses.find_one(
        {"id": request.intake_id},
        {"_id": 0}
    )
    
    if not intake:
        raise HTTPException(status_code=404, detail="Intake not found")
    
    # Check if slot is available
    existing = await db.bookings.find_one({
        "slot_date": request.slot_date,
        "slot_time": request.slot_time,
        "status": {"$in": ["confirmed", "payment_pending"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="This slot is no longer available")
    
    # Calculate price
    amount = calculate_price(request.duration, request.service_type)
    
    # Create booking
    booking = Booking(
        intake_id=request.intake_id,
        client_name=intake["form_data"]["full_name"],
        client_email=intake["form_data"]["email"],
        client_whatsapp=intake["form_data"]["whatsapp"],
        service_type=request.service_type,
        slot_date=request.slot_date,
        slot_time=request.slot_time,
        duration=request.duration,
        amount=amount,
        status="payment_pending"
    )
    
    doc = booking.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.bookings.insert_one(doc)
    
    return {
        "id": booking.id,
        "amount": amount,
        "amount_display": f"₹{amount}",
        "slot": f"{request.slot_date} at {request.slot_time} IST",
        "duration": f"{request.duration} minutes",
        "service_type": request.service_type,
        "status": "payment_pending"
    }

@api_router.get("/booking/{booking_id}")
async def get_booking(booking_id: str):
    """Get booking details"""
    booking = await db.bookings.find_one(
        {"id": booking_id},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

# ==================== PAYMENT ROUTES (MOCKED) ====================

@api_router.post("/payment/create-order")
async def create_payment_order(request: PaymentRequest):
    """Create a payment order (MOCKED - no actual Razorpay integration)"""
    # Verify booking exists
    booking = await db.bookings.find_one(
        {"id": request.booking_id},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["status"] == "confirmed":
        raise HTTPException(status_code=400, detail="Booking already confirmed")
    
    # Generate mock order ID (simulating Razorpay)
    mock_order_id = f"order_mock_{uuid.uuid4().hex[:16]}"
    
    return {
        "order_id": mock_order_id,
        "booking_id": request.booking_id,
        "amount": request.amount,
        "currency": "INR",
        "status": "created",
        "notes": {
            "mode": "MOCK - No actual payment processed",
            "booking_id": request.booking_id
        }
    }

@api_router.post("/payment/verify")
async def verify_payment(
    booking_id: str,
    payment_id: str = None,
    order_id: str = None,
    signature: str = None
):
    """Verify payment and confirm booking (MOCKED - always succeeds)"""
    # Get booking
    booking = await db.bookings.find_one(
        {"id": booking_id},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Generate mock payment ID
    mock_payment_id = payment_id or f"pay_mock_{uuid.uuid4().hex[:16]}"
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": "confirmed",
                "payment_id": mock_payment_id,
                "payment_status": "completed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Send confirmation email (mocked)
    await send_mock_email(
        to_email=booking["client_email"],
        subject="Booking Confirmed - Mutha's Psychology Intelligence",
        body=f"""
Dear {booking["client_name"]},

Your booking has been confirmed!

📅 Date: {booking["slot_date"]}
⏰ Time: {booking["slot_time"]} IST
⏱️ Duration: {booking["duration"]} minutes
💰 Amount Paid: ₹{booking["amount"]}

Booking ID: {booking_id}

You will receive a video call link 24 hours before your session.

Important:
- Please be in a quiet, private space for your session
- Have a stable internet connection
- You can reschedule up to 24 hours before the session

Thank you for choosing Mutha's Psychology Intelligence.

Best regards,
Saloni Mutha
        """,
        notification_type="booking_confirmation",
        booking_id=booking_id
    )
    
    return {
        "status": "success",
        "booking_id": booking_id,
        "payment_id": mock_payment_id,
        "message": "Payment verified and booking confirmed (MOCKED)"
    }

# ==================== EMAIL NOTIFICATIONS (MOCKED) ====================

async def send_mock_email(
    to_email: str,
    subject: str,
    body: str,
    notification_type: str,
    booking_id: str = None
):
    """Send email notification (MOCKED - logs to database)"""
    notification = EmailNotification(
        to_email=to_email,
        subject=subject,
        body=body,
        notification_type=notification_type,
        booking_id=booking_id,
        status="sent"  # Always "sent" in mock mode
    )
    
    doc = notification.model_dump()
    doc['sent_at'] = doc['sent_at'].isoformat()
    
    await db.email_notifications.insert_one(doc)
    
    logger.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
    
    return notification.id

@api_router.get("/notifications/{booking_id}")
async def get_notifications(booking_id: str):
    """Get all notifications for a booking"""
    notifications = await db.email_notifications.find(
        {"booking_id": booking_id},
        {"_id": 0}
    ).to_list(100)
    
    return {"booking_id": booking_id, "notifications": notifications}

# ==================== ICS CALENDAR GENERATION ====================

def generate_ics(booking: dict) -> str:
    """Generate ICS calendar file content"""
    # Parse date and time
    date_str = booking["slot_date"]
    time_str = booking["slot_time"]
    duration = booking["duration"]
    
    # Create datetime in IST
    india_tz = pytz.timezone('Asia/Kolkata')
    start_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    start_dt = india_tz.localize(start_dt)
    end_dt = start_dt + timedelta(minutes=duration)
    
    # Convert to UTC for ICS
    start_utc = start_dt.astimezone(pytz.UTC)
    end_utc = end_dt.astimezone(pytz.UTC)
    
    # Format for ICS
    start_ics = start_utc.strftime("%Y%m%dT%H%M%SZ")
    end_ics = end_utc.strftime("%Y%m%dT%H%M%SZ")
    now_ics = datetime.now(pytz.UTC).strftime("%Y%m%dT%H%M%SZ")
    
    uid = f"{booking['id']}@muthapsych.com"
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mutha's Psychology Intelligence//Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{uid}
DTSTART:{start_ics}
DTEND:{end_ics}
DTSTAMP:{now_ics}
SUMMARY:Psychology Consultation with Saloni Mutha
DESCRIPTION:Your {duration}-minute psychology consultation session.\\n\\nBooking ID: {booking['id']}\\n\\nPlease be ready 5 minutes before the session.\\nEnsure you have a stable internet connection and a private space.
LOCATION:Online (Video Call)
STATUS:CONFIRMED
ORGANIZER;CN=Mutha's Psychology Intelligence:mailto:hello@muthapsych.com
ATTENDEE;CN={booking['client_name']};RSVP=TRUE:mailto:{booking['client_email']}
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: Your psychology consultation is tomorrow
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: Your psychology consultation is in 2 hours
END:VALARM
END:VEVENT
END:VCALENDAR"""
    
    return ics_content

@api_router.get("/booking/{booking_id}/ics")
async def download_ics(booking_id: str):
    """Download ICS calendar file for booking"""
    booking = await db.bookings.find_one(
        {"id": booking_id},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["status"] != "confirmed":
        raise HTTPException(status_code=400, detail="Booking not yet confirmed")
    
    ics_content = generate_ics(booking)
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=booking_{booking_id}.ics"
        }
    )

# ==================== STATIC DATA ROUTES ====================

@api_router.get("/services")
async def get_services():
    """Get all services"""
    services = [
        {
            "id": "individual",
            "title": "Individual Counselling",
            "description": "One-on-one sessions focused on your personal growth, emotional wellbeing, and coping strategies.",
            "duration": "45-60 min",
            "price_range": "Rs 1500-2500",
            "concerns": ["Anxiety", "Depression", "Self-esteem", "Life transitions", "Grief"]
        },
        {
            "id": "couples",
            "title": "Relationship Counselling",
            "description": "Structured sessions for couples to improve communication, resolve conflicts, and strengthen bonds.",
            "duration": "60 min",
            "price_range": "Rs 2500-3000",
            "concerns": ["Communication issues", "Trust", "Conflict resolution", "Pre-marital counselling"]
        },
        {
            "id": "career",
            "title": "Career Guidance",
            "description": "Navigate career decisions, workplace stress, and professional growth with structured support.",
            "duration": "45 min",
            "price_range": "Rs 1500-2000",
            "concerns": ["Career confusion", "Work-life balance", "Job stress", "Career transitions"]
        },
        {
            "id": "academic",
            "title": "Academic Support",
            "description": "Support for students dealing with exam stress, study habits, and academic pressure.",
            "duration": "30-45 min",
            "price_range": "Rs 1000-1500",
            "concerns": ["Exam anxiety", "Study techniques", "Procrastination", "Academic pressure"]
        },
        {
            "id": "habit",
            "title": "Habit Building",
            "description": "Develop sustainable routines, break unhelpful patterns, and build positive habits.",
            "duration": "30-45 min",
            "price_range": "Rs 1000-1500",
            "concerns": ["Sleep hygiene", "Time management", "Healthy routines", "Breaking bad habits"]
        }
    ]
    return services

@api_router.get("/faqs")
async def get_faqs():
    """Get FAQs"""
    faqs = [
        {
            "question": "Is this therapy or diagnosis?",
            "answer": "No. This is structured psychology consultation focused on coping strategies, self-awareness, and personal development. We do not diagnose mental health conditions or provide medical treatment."
        },
        {
            "question": "How do online sessions work?",
            "answer": "Sessions are conducted via secure video call. You'll receive a link 24 hours before your appointment. All you need is a stable internet connection and a private space."
        },
        {
            "question": "What if I'm in crisis or emergency?",
            "answer": "We are NOT an emergency service. If you're in immediate danger or having thoughts of self-harm, please contact emergency services (112) or go to your nearest hospital immediately."
        },
        {
            "question": "How long are sessions?",
            "answer": "Sessions range from 30-60 minutes depending on the service type. Individual sessions are typically 45-60 minutes, while quick check-ins can be 30 minutes."
        },
        {
            "question": "What's the cancellation policy?",
            "answer": "You can reschedule or cancel up to 24 hours before your appointment for a full refund. Cancellations within 24 hours are non-refundable but can be rescheduled once."
        },
        {
            "question": "Is my information confidential?",
            "answer": "Yes. All session content and personal information is kept strictly confidential. We follow privacy best practices and never share your data without explicit consent."
        },
        {
            "question": "What does the AI do?",
            "answer": "Our AI helps with scheduling, answering common questions, and organizing intake information. It does NOT provide therapy, diagnosis, or clinical advice. All sessions are with a qualified human professional."
        },
        {
            "question": "How do I prepare for my first session?",
            "answer": "Find a quiet, private space. Have water nearby. Think about what you'd like to discuss, but don't worry about having everything figured out - that's what the session is for."
        }
    ]
    return faqs

@api_router.get("/pricing")
async def get_pricing():
    """Get pricing information"""
    pricing = {
        "sessions": [
            {"duration": "30 min", "price": 1000, "type": "Quick Check-in"},
            {"duration": "45 min", "price": 1500, "type": "Standard Session"},
            {"duration": "60 min", "price": 2000, "type": "Extended Session"},
            {"duration": "60 min", "price": 2500, "type": "Couples Session"}
        ],
        "packages": [
            {"sessions": 4, "discount": "10%", "description": "Monthly support package"},
            {"sessions": 8, "discount": "15%", "description": "Bi-monthly package"}
        ],
        "policies": {
            "cancellation": "Free cancellation up to 24 hours before. Within 24 hours - reschedule once allowed.",
            "refund": "Full refund for cancellations made 24+ hours in advance. No refunds for no-shows.",
            "payment_methods": ["UPI", "Credit Card", "Debit Card", "Net Banking"]
        }
    }
    return pricing

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

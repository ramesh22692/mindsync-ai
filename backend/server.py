from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import pytz

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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

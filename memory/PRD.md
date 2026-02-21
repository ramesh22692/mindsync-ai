# Mutha's Psychology Intelligence - PRD

## Project Overview
A premium psychology consultation website with AI-assisted booking and safety-first intake workflow for the India market.

## Original Problem Statement
Build a premium, production-ready website + web app for Mutha's Psychology Intelligence - Phase 1A focusing on AI-assisted booking and safety-first intake with deep AI integration and automation.

## Architecture
- **Frontend**: React.js with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key
- **Market**: India (Asia/Kolkata timezone)
- **Modality**: Online sessions only

## User Personas

### 1. Primary User - Client
- Adults in India (18-55) seeking psychology support
- Urban professionals and students
- Looking for online counselling
- Values privacy and safety

### 2. Secondary User - Admin (Future Phase)
- Saloni (Psychologist)
- Needs appointment management
- Requires client intake summaries

## Core Requirements (Static)

### Safety & Compliance
- NOT a diagnosis engine
- NOT emergency/crisis support
- Mandatory crisis gating in all flows
- No medical claims or cure promises
- Privacy-first data handling

### Design System
- Background: Warm off-white (#FDFCF8)
- Primary: Deep teal (#0F766E)
- Typography: Manrope (headings), Inter (body)
- Premium institutional feel with subtle AI cues

---

## What's Been Implemented

### Phase 1A - January 2026
**Public Pages (10 pages)**
1. Home - Hero, trust strip, how it works, services overview, about snippet, fees, FAQ, CTA
2. Services - 5 service categories with pricing
3. About Saloni - Professional bio, credentials, approach
4. AI & Safety - Transparency about AI capabilities
5. Fees & Policies - Pricing tiers, cancellation, refund policies
6. Crisis & Urgent Help - Emergency numbers, helpline info
7. FAQ - Searchable questions from API
8. Contact - Functional contact form
9. Privacy Policy - Legal page
10. Terms & Conditions - Legal page

**Core Features**
- AI Receptionist Chatbot: GPT-5.2 powered with crisis detection
- Smart Intake Form: 4-step flow with mandatory safety check
- Crisis Gating: Blocks booking if user indicates crisis
- Auto-tagging of concerns

### Phase 1B - January 2026
**Booking & Payment Flow**
- 7-step booking wizard: Safety → About → Concerns → Contact → Slot → Payment → Confirmation
- Timezone-aware slot selection (Asia/Kolkata)
- Service type selection: Individual, Couples, Career, Academic, Habit Building
- Duration options: 30, 45, 60 minutes with dynamic pricing
- MOCKED Razorpay payment flow (simulated - no actual charges)
- Booking confirmation with details display
- ICS calendar download for appointments
- MOCKED email notifications (logged to database)

**Backend APIs Added**
- `/api/slots` - Get available booking slots
- `/api/slots/{date}` - Get slots for specific date
- `/api/booking` - Create new booking
- `/api/booking/{id}` - Get booking details
- `/api/booking/{id}/ics` - Download calendar invite
- `/api/payment/create-order` - Create payment order (mocked)
- `/api/payment/verify` - Verify payment (mocked)
- `/api/notifications/{booking_id}` - Get notification logs

### Phase 1C - January 2026
**Client Authentication & Portal**
- JWT-based authentication (email/password)
- User registration and login
- Client portal dashboard
- View all bookings (upcoming and past)
- Cancel booking (with refund policy display)
- Reschedule booking to new slot
- Post-session feedback with star rating
- Protected routes with auth redirect

**Content Updates**
- Fixed homepage hero image (mindfulness/meditation instead of dentist chair)
- Updated Saloni's credentials throughout:
  - MA in Psychology
  - BFA in Arts
  - B.Ed in Education
  - 9 Years Teaching Experience
- New "The Unique Blend" section on About page
- Tagline: "Where psychology meets creativity and education"

**Backend APIs Added**
- `/api/auth/register` - User registration
- `/api/auth/login` - User login with JWT
- `/api/auth/me` - Get current user
- `/api/auth/profile` - Update profile
- `/api/portal/bookings` - Get user's bookings
- `/api/portal/booking/{id}` - Get specific booking
- `/api/portal/booking/{id}/cancel` - Cancel booking
- `/api/portal/booking/{id}/reschedule` - Reschedule booking
- `/api/portal/feedback` - Submit feedback
- `/api/portal/feedback/{booking_id}` - Get feedback

---

## Prioritized Backlog

### P0 - Critical (Phase 1C - Client Portal)
- [ ] Client authentication (login/signup)
- [ ] Client portal dashboard
- [ ] Appointment management (view/reschedule/cancel)
- [ ] Consent forms
- [ ] Post-session feedback

### P1 - High Priority (Phase 1D - Admin Dashboard)
- [ ] Admin authentication
- [ ] Admin dashboard
- [ ] Availability manager
- [ ] Client profiles with intake summaries
- [ ] Payment tracking

### P2 - Medium Priority (Phase 1E - Automation)
- [ ] Real Razorpay integration (replace mock)
- [ ] Real email sending (Resend/SendGrid)
- [ ] WhatsApp reminders (generic)
- [ ] Automated pre/post session workflows
- [ ] Analytics events

### P3 - Nice to Have
- [ ] SEO optimization
- [ ] Multi-language support
- [ ] Package booking discounts

---

## Next Tasks (Immediate)

1. **Phase 1C**: Client authentication system
2. **Phase 1C**: Client portal with booking history
3. **Phase 1C**: Reschedule/cancel functionality
4. **Phase 1C**: Post-session feedback form

---

## Technical Debt
- Razorpay integration is MOCKED
- Email notifications are MOCKED (logged to DB)

## Known Limitations
- No client/admin authentication yet (Phase 1C/1D)
- No real payment processing (MOCKED)
- No real email sending (MOCKED)
- WhatsApp integration pending (Phase 1E)

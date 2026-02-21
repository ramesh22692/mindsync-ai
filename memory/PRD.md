# Mutha's Psychology Intelligence - PRD

## Project Overview
**UPDATED: Platform Pivot to School Ecosystem Model**

A premium School Emotional Intelligence Infrastructure Platform targeting educational institutions (K-12) with psychoeducational services integrating Psychology + Education + Applied Arts.

**New Positioning:** Mutha Educational Psychology Systems (MEPS)

See `/app/memory/MEPS_STRATEGIC_FOUNDATION.md` for complete strategic documentation.

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

### P0 - Critical (Phase 1D - Admin Dashboard)
- [ ] Admin authentication (separate role)
- [ ] Admin dashboard overview
- [ ] Availability manager (set working hours, blackouts)
- [ ] Client profiles with intake summaries
- [ ] View all bookings and appointments
- [ ] AI-generated intake summaries (admin-only)
- [ ] Payment tracking and reports

### P1 - High Priority (Phase 1E - Real Integrations)
- [ ] Real Razorpay integration (replace mock)
- [ ] Real email sending (Resend/SendGrid)
- [ ] WhatsApp reminders (generic messages)
- [ ] Automated pre/post session workflows

### P2 - Medium Priority
- [ ] Analytics dashboard
- [ ] SEO optimization
- [ ] Multi-language support (Hindi)
- [ ] Package booking discounts
- [ ] Referral system

### P3 - Nice to Have
- [ ] Video call integration
- [ ] Resource library for clients
- [ ] Blog/articles section
- [ ] Testimonials management

### Phase 1E - January 2026
**Automated Notifications & Workflows**
- Email service abstraction (mock/Resend/SendGrid ready)
- WhatsApp service abstraction (mock/Twilio ready)
- Automated reminder scheduler (runs every 30 min)
- T-24h and T-2h session reminders
- Email templates for: booking confirmation, reminders, cancellation, reschedule, feedback request
- WhatsApp templates (generic, no sensitive info)
- Admin notifications dashboard with stats
- Manual reminder trigger capability
- Notification logs with status tracking

**Backend APIs Added**
- `/api/admin/notifications` - View all notifications
- `/api/admin/notification-stats` - Notification statistics
- `/api/admin/send-reminder/{id}` - Manual reminder trigger

**Ready for Real Integration**
To enable real notifications, add to backend/.env:
- EMAIL_PROVIDER=resend (or sendgrid)
- EMAIL_API_KEY=your_key
- WHATSAPP_PROVIDER=twilio
- TWILIO_ACCOUNT_SID=your_sid
- TWILIO_AUTH_TOKEN=your_token
- TWILIO_WHATSAPP_NUMBER=your_number

---

## Phases Complete Summary
- **Phase 1A**: Public pages, AI chatbot, intake form
- **Phase 1B**: Booking flow, slot selection, mocked payments
- **Phase 1C**: Client auth, portal, reschedule/cancel/feedback
- **Phase 1D**: Admin dashboard, availability, client management
- **Phase 1E**: Automated notifications, reminder scheduler

---

## Technical Notes
- All integrations use abstraction layers for easy provider switching
- Scheduler runs in background, checks bookings every 30 minutes
- Notifications logged to DB regardless of provider (mock or real)

## Known Limitations
- Payments still mocked (Razorpay keys needed)
- Notifications still mocked (provider keys needed)
- Video call link generation not implemented

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

## What's Been Implemented (Phase 1A)

### Date: January 2026

### Public Pages (10 pages)
1. **Home** - Hero, trust strip, how it works, services overview, about snippet, fees, FAQ, CTA
2. **Services** - 5 service categories with pricing
3. **About Saloni** - Professional bio, credentials, approach
4. **AI & Safety** - Transparency about AI capabilities
5. **Fees & Policies** - Pricing tiers, cancellation, refund policies
6. **Crisis & Urgent Help** - Emergency numbers, helpline info
7. **FAQ** - Searchable questions from API
8. **Contact** - Functional contact form
9. **Privacy Policy** - Legal page
10. **Terms & Conditions** - Legal page

### Core Features
- **AI Receptionist Chatbot**: GPT-5.2 powered, with crisis detection
- **Smart Intake Form**: 4-step flow with mandatory safety check
- **Crisis Gating**: Blocks booking if user indicates crisis
- **Auto-tagging**: Concerns mapped to service categories
- **Session Duration Suggestion**: Based on complexity

### Backend APIs
- `/api/services` - Service categories
- `/api/faqs` - FAQ content
- `/api/pricing` - Pricing tiers
- `/api/chat` - AI chatbot with crisis detection
- `/api/intake` - Intake form submission
- `/api/contact` - Contact form

### Design Implementation
- Mobile responsive
- Crisis banner on all pages
- Chat widget (bottom-right)
- Warm, professional aesthetic

---

## Prioritized Backlog

### P0 - Critical (Phase 1B)
- [ ] Slot selection (timezone-aware calendar)
- [ ] Razorpay payment integration
- [ ] Booking confirmation + ICS calendar invite
- [ ] Email notifications (transactional)

### P1 - High Priority (Phase 1C)
- [ ] Client authentication (login/signup)
- [ ] Client portal dashboard
- [ ] Appointment management (view/reschedule/cancel)
- [ ] Consent forms
- [ ] Post-session feedback

### P2 - Medium Priority (Phase 1D)
- [ ] Admin authentication
- [ ] Admin dashboard
- [ ] Availability manager
- [ ] Client profiles with intake summaries
- [ ] Payment tracking

### P3 - Nice to Have (Phase 1E)
- [ ] WhatsApp reminders (generic)
- [ ] Automated pre/post session workflows
- [ ] Analytics events
- [ ] SEO optimization

---

## Next Tasks (Immediate)

1. **Phase 1B**: Implement slot selection calendar
2. **Phase 1B**: Integrate Razorpay test payments
3. **Phase 1B**: Generate booking confirmation with ICS
4. **Phase 1B**: Basic email notifications

---

## Technical Debt
- None currently

## Known Limitations
- Slot selection & payment pending (Phase 1B)
- No client/admin authentication yet (Phase 1C/1D)
- WhatsApp integration pending (Phase 1E)

import requests
import sys
import json
from datetime import datetime

class PsychologyAPITester:
    def __init__(self, base_url="https://mutha-psych.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.auth_token = None
        self.test_user_email = f"test_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response preview: {str(response_data)[:200]}...")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "api/", 200)

    def test_services_endpoint(self):
        """Test services endpoint"""
        success, data = self.run_test("Services API", "GET", "api/services", 200)
        if success and isinstance(data, list) and len(data) > 0:
            print(f"   Found {len(data)} services")
            return True
        return False

    def test_faqs_endpoint(self):
        """Test FAQs endpoint"""
        success, data = self.run_test("FAQs API", "GET", "api/faqs", 200)
        if success and isinstance(data, list) and len(data) > 0:
            print(f"   Found {len(data)} FAQs")
            return True
        return False

    def test_pricing_endpoint(self):
        """Test pricing endpoint"""
        success, data = self.run_test("Pricing API", "GET", "api/pricing", 200)
        if success and isinstance(data, dict) and 'sessions' in data:
            print(f"   Found {len(data['sessions'])} pricing tiers")
            return True
        return False

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test POST status
        test_data = {"client_name": "test_client"}
        success, data = self.run_test("Create Status Check", "POST", "api/status", 200, test_data)
        
        if success:
            # Test GET status
            success2, _ = self.run_test("Get Status Checks", "GET", "api/status", 200)
            return success2
        return False

    def test_chat_endpoint(self):
        """Test AI chat endpoint"""
        test_message = {
            "session_id": self.session_id,
            "message": "Hello, I want to know about your services",
            "is_crisis_check": False
        }
        success, data = self.run_test("AI Chat", "POST", "api/chat", 200, test_message)
        
        if success and isinstance(data, dict) and 'response' in data:
            print(f"   AI Response: {data['response'][:100]}...")
            return True
        return False

    def test_chat_crisis_detection(self):
        """Test crisis detection in chat"""
        crisis_message = {
            "session_id": f"{self.session_id}_crisis",
            "message": "I want to hurt myself",
            "is_crisis_check": False
        }
        success, data = self.run_test("Crisis Detection", "POST", "api/chat", 200, crisis_message)
        
        if success and isinstance(data, dict) and data.get('is_crisis_detected'):
            print(f"   ✅ Crisis correctly detected")
            return True
        else:
            print(f"   ❌ Crisis detection failed")
            return False

    def test_chat_session_retrieval(self):
        """Test chat session retrieval"""
        return self.run_test("Get Chat Session", "GET", f"api/chat/session/{self.session_id}", 200)

    def test_intake_form_normal(self):
        """Test normal intake form submission"""
        intake_data = {
            "full_name": "Test User",
            "age_range": "26-35",
            "city": "Mumbai",
            "timezone": "Asia/Kolkata",
            "preferred_language": "English",
            "concern_areas": ["anxiety", "work_stress"],
            "stress_level": 3,
            "optional_note": "Test note",
            "email": "test@example.com",
            "whatsapp": "+91 9876543210",
            "privacy_consent": True,
            "non_emergency_consent": True,
            "crisis_response": False
        }
        success, data = self.run_test("Normal Intake Form", "POST", "api/intake", 200, intake_data)
        
        if success and isinstance(data, dict) and data.get('status') == 'submitted':
            print(f"   ✅ Intake processed with tags: {data.get('auto_tags', [])}")
            return True, data.get('id')
        return False, None

    def test_intake_form_crisis(self):
        """Test crisis intake form submission"""
        crisis_intake_data = {
            "full_name": "Crisis User",
            "age_range": "26-35",
            "city": "Delhi",
            "timezone": "Asia/Kolkata",
            "preferred_language": "English",
            "concern_areas": ["anxiety"],
            "stress_level": 5,
            "optional_note": "",
            "email": "crisis@example.com",
            "whatsapp": "+91 9876543211",
            "privacy_consent": True,
            "non_emergency_consent": True,
            "crisis_response": True
        }
        success, data = self.run_test("Crisis Intake Form", "POST", "api/intake", 200, crisis_intake_data)
        
        if success and isinstance(data, dict) and data.get('is_crisis'):
            print(f"   ✅ Crisis intake correctly redirected")
            return True
        else:
            print(f"   ❌ Crisis intake handling failed")
            return False

    def test_intake_retrieval(self, intake_id):
        """Test intake retrieval by ID"""
        if not intake_id:
            print("   ⚠️  Skipping intake retrieval - no valid intake ID")
            return False
        
        return self.run_test("Get Intake", "GET", f"api/intake/{intake_id}", 200)

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test Contact",
            "email": "contact@example.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        }
        success, data = self.run_test("Contact Form", "POST", "api/contact", 200, contact_data)
        
        if success and isinstance(data, dict) and data.get('status') == 'submitted':
            print(f"   ✅ Contact form submitted successfully")
            return True
        return False

    # ==================== PHASE 1C: AUTHENTICATION TESTS ====================

    def test_user_registration(self):
        """Test user registration"""
        register_data = {
            "email": self.test_user_email,
            "password": "testpass123",
            "full_name": "Test User",
            "phone": "+91 9876543210"
        }
        
        success, data = self.run_test("User Registration", "POST", "api/auth/register", 200, register_data)
        
        if success and isinstance(data, dict) and data.get('access_token'):
            self.auth_token = data['access_token']
            print(f"   ✅ User registered: {data['user']['full_name']} ({data['user']['email']})")
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user_email,
            "password": "testpass123"
        }
        
        success, data = self.run_test("User Login", "POST", "api/auth/login", 200, login_data)
        
        if success and isinstance(data, dict) and data.get('access_token'):
            self.auth_token = data['access_token']
            print(f"   ✅ User logged in: {data['user']['full_name']}")
            return True
        return False

    def test_get_user_profile(self):
        """Test get current user profile"""
        if not self.auth_token:
            print("   ⚠️  Skipping profile test - no auth token")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        success, data = self.run_test("Get User Profile", "GET", "api/auth/me", 200, headers=headers)
        
        if success and isinstance(data, dict) and data.get('email') == self.test_user_email:
            print(f"   ✅ Profile retrieved: {data['full_name']} - {data['role']}")
            return True
        return False

    def test_update_profile(self):
        """Test profile update"""
        if not self.auth_token:
            print("   ⚠️  Skipping profile update - no auth token")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        # Update profile using query parameters
        success, data = self.run_test("Update Profile", "PUT", "api/auth/profile?full_name=Updated Test User&phone=+91 9876543211", 200, headers=headers)
        
        if success and isinstance(data, dict) and data.get('status') == 'updated':
            print(f"   ✅ Profile updated successfully")
            return True
        return False

    # ==================== PHASE 1C: CLIENT PORTAL TESTS ====================

    def test_get_my_bookings(self):
        """Test get user's bookings"""
        if not self.auth_token:
            print("   ⚠️  Skipping bookings test - no auth token")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        success, data = self.run_test("Get My Bookings", "GET", "api/portal/bookings", 200, headers=headers)
        
        if success and isinstance(data, dict) and 'bookings' in data:
            bookings = data['bookings']
            print(f"   ✅ Found {len(bookings)} bookings for user")
            return True, bookings
        return False, []

    def test_cancel_booking(self, booking_id):
        """Test booking cancellation"""
        if not self.auth_token or not booking_id:
            print("   ⚠️  Skipping cancel test - no auth token or booking ID")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        success, data = self.run_test("Cancel Booking", "POST", f"api/portal/booking/{booking_id}/cancel", 200, headers=headers)
        
        if success and isinstance(data, dict) and data.get('status') == 'cancelled':
            print(f"   ✅ Booking cancelled: {data.get('message')}")
            return True
        return False

    def test_reschedule_booking(self, booking_id):
        """Test booking rescheduling"""
        if not self.auth_token or not booking_id:
            print("   ⚠️  Skipping reschedule test - no auth token or booking ID")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        # Try to reschedule to a future date
        from datetime import datetime, timedelta
        future_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        success, data = self.run_test("Reschedule Booking", "POST", f"api/portal/booking/{booking_id}/reschedule?new_date={future_date}&new_time=14:00", 200, headers=headers)
        
        if success and isinstance(data, dict) and data.get('status') == 'rescheduled':
            print(f"   ✅ Booking rescheduled: {data.get('message')}")
            return True
        return False

    def test_submit_feedback(self, booking_id):
        """Test feedback submission"""
        if not self.auth_token or not booking_id:
            print("   ⚠️  Skipping feedback test - no auth token or booking ID")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        feedback_data = {
            "booking_id": booking_id,
            "rating": 5,
            "feedback_text": "Excellent session, very helpful!",
            "would_recommend": True
        }
        
        success, data = self.run_test("Submit Feedback", "POST", "api/portal/feedback", 200, feedback_data, headers=headers)
        
        if success and isinstance(data, dict) and data.get('status') == 'submitted':
            print(f"   ✅ Feedback submitted: {data.get('message')}")
            return True
        return False

    def test_get_feedback(self, booking_id):
        """Test feedback retrieval"""
        if not self.auth_token or not booking_id:
            print("   ⚠️  Skipping feedback retrieval - no auth token or booking ID")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        
        success, data = self.run_test("Get Feedback", "GET", f"api/portal/feedback/{booking_id}", 200, headers=headers)
        
        if success and isinstance(data, dict):
            if data.get('exists'):
                print(f"   ✅ Feedback found for booking")
            else:
                print(f"   ✅ No feedback exists (expected for new booking)")
            return True
        return False

    # ==================== PHASE 1B: BOOKING & PAYMENT TESTS ====================
        """Test available slots endpoint"""
        success, data = self.run_test("Available Slots", "GET", "api/slots?days=7", 200)
        
        if success and isinstance(data, dict) and 'slots' in data:
            slots = data['slots']
            available_slots = [s for s in slots if s.get('available', False)]
            print(f"   Found {len(slots)} total slots, {len(available_slots)} available")
            return True, available_slots
        return False, []

    def test_slots_for_date(self, date="2025-01-20"):
        """Test slots for specific date"""
        success, data = self.run_test("Slots for Date", "GET", f"api/slots/{date}", 200)
        
        if success and isinstance(data, dict) and 'slots' in data:
            print(f"   Found {len(data['slots'])} slots for {date}")
            return True
        return False

    def test_booking_creation(self, intake_id):
        """Test booking creation"""
        if not intake_id:
            print("   ⚠️  Skipping booking creation - no valid intake ID")
            return False, None
        
        # Get available slots first
        slots_success, available_slots = self.test_slots_endpoint()
        if not slots_success or not available_slots:
            print("   ⚠️  No available slots for booking test")
            return False, None
        
        # Use first available slot
        slot = available_slots[0]
        booking_data = {
            "intake_id": intake_id,
            "slot_date": slot["date"],
            "slot_time": slot["time"],
            "duration": 45,
            "service_type": "individual"
        }
        
        success, data = self.run_test("Create Booking", "POST", "api/booking", 200, booking_data)
        
        if success and isinstance(data, dict) and data.get('id'):
            print(f"   ✅ Booking created: {data['id'][:8]}... Amount: {data.get('amount_display')}")
            return True, data['id']
        return False, None

    def test_booking_retrieval(self, booking_id):
        """Test booking retrieval by ID"""
        if not booking_id:
            print("   ⚠️  Skipping booking retrieval - no valid booking ID")
            return False
        
        success, data = self.run_test("Get Booking", "GET", f"api/booking/{booking_id}", 200)
        
        if success and isinstance(data, dict) and data.get('id') == booking_id:
            print(f"   ✅ Booking retrieved: Status {data.get('status')}")
            return True
        return False

    def test_payment_create_order(self, booking_id):
        """Test payment order creation (mocked)"""
        if not booking_id:
            print("   ⚠️  Skipping payment order - no valid booking ID")
            return False, None
        
        payment_data = {
            "booking_id": booking_id,
            "amount": 150000,  # 1500 in paise
            "payment_method": "card"
        }
        
        success, data = self.run_test("Create Payment Order", "POST", "api/payment/create-order", 200, payment_data)
        
        if success and isinstance(data, dict) and data.get('order_id'):
            print(f"   ✅ Payment order created: {data['order_id']}")
            return True, data['order_id']
        return False, None

    def test_payment_verify(self, booking_id, order_id):
        """Test payment verification (mocked)"""
        if not booking_id:
            print("   ⚠️  Skipping payment verification - no valid booking ID")
            return False
        
        success, data = self.run_test("Verify Payment", "POST", f"api/payment/verify?booking_id={booking_id}", 200)
        
        if success and isinstance(data, dict) and data.get('status') == 'success':
            print(f"   ✅ Payment verified: {data.get('payment_id')}")
            return True
        return False

    def test_ics_download(self, booking_id):
        """Test ICS calendar download"""
        if not booking_id:
            print("   ⚠️  Skipping ICS download - no valid booking ID")
            return False
        
        # Use different headers for ICS download
        headers = {'Accept': 'text/calendar'}
        success, data = self.run_test("ICS Calendar Download", "GET", f"api/booking/{booking_id}/ics", 200, headers=headers)
        
        if success and isinstance(data, str) and 'BEGIN:VCALENDAR' in data:
            print(f"   ✅ ICS file generated successfully")
            return True
        return False

    def test_email_notifications(self, booking_id):
        """Test email notifications retrieval"""
        if not booking_id:
            print("   ⚠️  Skipping email notifications - no valid booking ID")
            return False
        
        success, data = self.run_test("Email Notifications", "GET", f"api/notifications/{booking_id}", 200)
        
        if success and isinstance(data, dict) and 'notifications' in data:
            notifications = data['notifications']
            print(f"   ✅ Found {len(notifications)} email notifications")
            return True
        return False

def main():
    print("🚀 Starting Psychology Intelligence API Tests (Phase 1C)")
    print("=" * 60)
    
    tester = PsychologyAPITester()
    
    # Test Phase 1A endpoints
    phase_1a_tests = [
        ("Root API", tester.test_root_endpoint),
        ("Services", tester.test_services_endpoint),
        ("FAQs", tester.test_faqs_endpoint),
        ("Pricing", tester.test_pricing_endpoint),
        ("Status Endpoints", tester.test_status_endpoints),
        ("AI Chat", tester.test_chat_endpoint),
        ("Crisis Detection", tester.test_chat_crisis_detection),
        ("Chat Session", tester.test_chat_session_retrieval),
        ("Contact Form", tester.test_contact_form),
    ]
    
    print("\n📋 Phase 1A Tests:")
    print("-" * 40)
    
    # Run Phase 1A tests
    for test_name, test_func in phase_1a_tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Test intake form and get ID for booking tests
    intake_id = None
    try:
        success, intake_id = tester.test_intake_form_normal()
        if success and intake_id:
            tester.test_intake_retrieval(intake_id)
    except Exception as e:
        print(f"❌ Normal intake test failed: {str(e)}")
    
    try:
        tester.test_intake_form_crisis()
    except Exception as e:
        print(f"❌ Crisis intake test failed: {str(e)}")
    
    # Phase 1C: Authentication Tests
    print("\n📋 Phase 1C Tests (Authentication & Portal):")
    print("-" * 40)
    
    auth_tests = [
        ("User Registration", tester.test_user_registration),
        ("User Login", tester.test_user_login),
        ("Get User Profile", tester.test_get_user_profile),
        ("Update Profile", tester.test_update_profile),
    ]
    
    # Run authentication tests
    for test_name, test_func in auth_tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Test client portal features
    try:
        success, bookings = tester.test_get_my_bookings()
        if success:
            # Test feedback functionality
            for booking in bookings:
                booking_id = booking.get('id')
                if booking_id:
                    tester.test_get_feedback(booking_id)
                    # Only test feedback submission for completed bookings
                    if booking.get('status') == 'completed':
                        tester.test_submit_feedback(booking_id)
                    break  # Test with first booking only
    except Exception as e:
        print(f"❌ Portal tests failed: {str(e)}")
    
    # Phase 1B: Booking & Payment Tests
    print("\n📋 Phase 1B Tests (Booking & Payment):")
    print("-" * 40)
    
    booking_id = None
    order_id = None
    
    # Test booking flow
    try:
        # Test slots
        tester.test_slots_endpoint()
        tester.test_slots_for_date()
        
        # Test booking creation
        if intake_id:
            success, booking_id = tester.test_booking_creation(intake_id)
            if success and booking_id:
                # Test booking retrieval
                tester.test_booking_retrieval(booking_id)
                
                # Test payment flow
                success, order_id = tester.test_payment_create_order(booking_id)
                if success:
                    tester.test_payment_verify(booking_id, order_id)
                    
                    # Test post-payment features
                    tester.test_ics_download(booking_id)
                    tester.test_email_notifications(booking_id)
                    
                    # Test portal features with new booking (if user is authenticated)
                    if tester.auth_token:
                        try:
                            # Test cancellation (will work since booking was just created)
                            tester.test_cancel_booking(booking_id)
                        except Exception as e:
                            print(f"⚠️  Cancel test failed: {str(e)}")
        else:
            print("⚠️  Skipping booking tests - no valid intake ID")
            
    except Exception as e:
        print(f"❌ Booking flow tests failed: {str(e)}")
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
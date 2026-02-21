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

def main():
    print("🚀 Starting Psychology Intelligence API Tests")
    print("=" * 60)
    
    tester = PsychologyAPITester()
    
    # Test all endpoints
    tests = [
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
    
    # Run basic tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Test intake form (normal and crisis)
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
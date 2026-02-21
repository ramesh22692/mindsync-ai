import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

// Layout
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

// Public Pages
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import AboutSaloni from "@/pages/AboutSaloni";
import AISafety from "@/pages/AISafety";
import FeesAndPolicies from "@/pages/FeesAndPolicies";
import Crisis from "@/pages/Crisis";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import BookAppointment from "@/pages/BookAppointment";
import Auth from "@/pages/Auth";

// Portal Pages
import Portal from "@/pages/portal/Portal";
import Reschedule from "@/pages/portal/Reschedule";
import Feedback from "@/pages/portal/Feedback";

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen flex flex-col">
        <BrowserRouter>
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<AboutSaloni />} />
              <Route path="/ai-safety" element={<AISafety />} />
              <Route path="/fees" element={<FeesAndPolicies />} />
              <Route path="/crisis" element={<Crisis />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Portal Routes */}
              <Route path="/portal" element={<Portal />} />
              <Route path="/portal/reschedule/:bookingId" element={<Reschedule />} />
              <Route path="/portal/feedback/:bookingId" element={<Feedback />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
          <Toaster position="top-right" />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;

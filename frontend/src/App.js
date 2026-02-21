import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

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

import Portal from "@/pages/portal/Portal";
import Reschedule from "@/pages/portal/Reschedule";
import Feedback from "@/pages/portal/Feedback";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminBookingDetail from "@/pages/admin/AdminBookingDetail";
import AdminClients from "@/pages/admin/AdminClients";
import AdminAvailability from "@/pages/admin/AdminAvailability";
import AdminNotifications from "@/pages/admin/AdminNotifications";

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen flex flex-col">
        <BrowserRouter>
          <Routes>
            {/* Admin Routes - No Navbar/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/booking/:bookingId" element={<AdminBookingDetail />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/client/:clientId" element={<AdminClients />} />
            <Route path="/admin/availability" element={<AdminAvailability />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            
            {/* Public Routes with Navbar/Footer */}
            <Route path="/*" element={
              <>
                <Navbar />
                <main className="flex-1">
                  <Routes>
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
                    <Route path="/portal" element={<Portal />} />
                    <Route path="/portal/reschedule/:bookingId" element={<Reschedule />} />
                    <Route path="/portal/feedback/:bookingId" element={<Feedback />} />
                  </Routes>
                </main>
                <Footer />
                <ChatWidget />
              </>
            } />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;

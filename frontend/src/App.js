import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Layout
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

// Pages
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

function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      <BrowserRouter>
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
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;

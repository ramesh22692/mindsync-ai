import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export const Terms = () => {
  return (
    <div className="bg-background min-h-screen" data-testid="terms-page">
      {/* Hero */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-6">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground mb-6">
              By accessing or using the services provided by Mutha's Psychology Intelligence 
              ("we," "our," or "us"), you agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Nature of Services</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">Important Notice</h3>
              <p className="text-muted-foreground">
                Our services constitute psychology consultation, NOT medical treatment, 
                diagnosis, or emergency services. We provide:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Structured counselling support</li>
                <li>Coping strategies and tools</li>
                <li>Self-awareness development</li>
                <li>Practical life support</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>We do NOT provide:</strong> Clinical diagnosis, medical treatment, 
                psychiatric care, emergency intervention, or prescription services.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Not an Emergency Service</h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-foreground font-medium">
                We are NOT an emergency service. If you are in crisis, experiencing 
                thoughts of self-harm, or in immediate danger, please contact:
              </p>
              <ul className="list-disc list-inside text-foreground mt-2 space-y-1">
                <li>Emergency Services: 112</li>
                <li>iCall: 9152987821</li>
                <li>Vandrevala Foundation: 1860-2662-345</li>
                <li>Your nearest hospital emergency room</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Eligibility</h2>
            <p className="text-muted-foreground mb-6">
              You must be at least 18 years of age to use our services. If you are under 18, 
              you must have parental or guardian consent and supervision. By using our services, 
              you represent that you meet these requirements.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Booking and Payment</h2>
            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
              <li>All sessions must be booked and paid for in advance</li>
              <li>Payment is processed securely through Razorpay</li>
              <li>Prices are displayed in Indian Rupees (INR)</li>
              <li>Session packages are non-transferable</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Cancellation & Refund Policy</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Cancellation more than 24 hours before session:</strong><br />
              Full refund or free reschedule to any available slot.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Cancellation within 24 hours:</strong><br />
              No refund. One-time reschedule permitted within 7 days.
            </p>
            <p className="text-muted-foreground mb-6">
              <strong>No-show:</strong><br />
              No refund and no reschedule. Session is forfeited.
            </p>
            <p className="text-muted-foreground mb-6">
              Refunds are processed within 5-7 business days to the original payment method.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Session Conduct</h2>
            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
              <li>Sessions are conducted online via secure video call</li>
              <li>You are responsible for ensuring a private, quiet space</li>
              <li>Recording of sessions is prohibited without written consent</li>
              <li>The practitioner reserves the right to terminate sessions if conduct is inappropriate</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Confidentiality</h2>
            <p className="text-muted-foreground mb-6">
              Session content is confidential except where disclosure is required by law 
              (e.g., imminent risk of harm to self or others, suspected abuse, court orders). 
              For more information, see our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">AI Chatbot</h2>
            <p className="text-muted-foreground mb-6">
              Our AI receptionist is for scheduling and general information only. It cannot 
              and does not provide counselling, diagnosis, or clinical advice. By using the 
              AI chatbot, you acknowledge that it is a tool for administrative convenience 
              and not a substitute for professional consultation. See our{" "}
              <Link to="/ai-safety" className="text-primary hover:underline">
                AI & Safety page
              </Link>{" "}
              for details.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Limitation of Liability</h2>
            <p className="text-muted-foreground mb-6">
              Our services are provided "as is" without warranties of any kind. We are not 
              liable for any outcomes, decisions, or actions you take based on our services. 
              Our total liability shall not exceed the amount you paid for the specific 
              service in question.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Intellectual Property</h2>
            <p className="text-muted-foreground mb-6">
              All content on our website, including text, graphics, logos, and materials 
              provided during sessions, is our intellectual property or licensed to us. 
              You may not reproduce, distribute, or create derivative works without our 
              written consent.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Governing Law</h2>
            <p className="text-muted-foreground mb-6">
              These Terms are governed by the laws of India. Any disputes shall be subject 
              to the exclusive jurisdiction of the courts in [City], India.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Changes to Terms</h2>
            <p className="text-muted-foreground mb-6">
              We reserve the right to modify these Terms at any time. Continued use of our 
              services after changes constitutes acceptance of the revised Terms.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Contact</h2>
            <p className="text-muted-foreground mb-6">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:hello@muthapsych.com" className="text-primary hover:underline">
                hello@muthapsych.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;

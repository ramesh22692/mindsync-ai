import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export const PrivacyPolicy = () => {
  return (
    <div className="bg-background min-h-screen" data-testid="privacy-page">
      {/* Hero */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-6">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
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
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground mb-6">
              Mutha's Psychology Intelligence ("we," "our," or "us") respects your privacy 
              and is committed to protecting your personal information. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when 
              you use our website and services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Information We Collect</h2>
            <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              When you use our services, we may collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
              <li>Name and contact information (email, phone number)</li>
              <li>Age range and city/location</li>
              <li>Concern areas you wish to discuss</li>
              <li>Intake form responses</li>
              <li>Payment information (processed by Razorpay)</li>
              <li>Session booking details</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-2">Automatically Collected Information</h3>
            <p className="text-muted-foreground mb-6">
              We may automatically collect certain information including your IP address, 
              browser type, device information, and usage data to improve our services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
              <li>Provide and manage our consultation services</li>
              <li>Process appointments and payments</li>
              <li>Send appointment reminders and service communications</li>
              <li>Improve our website and services</li>
              <li>Respond to your inquiries</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">AI and Data Processing</h2>
            <p className="text-muted-foreground mb-6">
              Our AI receptionist assists with scheduling and answering general questions. 
              AI-processed information is used solely for operational purposes (organizing 
              intake responses, generating administrative summaries). AI does not diagnose, 
              provide treatment, or make clinical decisions. For more details, see our{" "}
              <Link to="/ai-safety" className="text-primary hover:underline">
                AI & Safety page
              </Link>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Data Security</h2>
            <p className="text-muted-foreground mb-6">
              We implement appropriate technical and organizational measures to protect 
              your personal information, including encryption in transit and at rest, 
              access controls, and secure data storage practices.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Data Retention</h2>
            <p className="text-muted-foreground mb-6">
              We retain your personal information only as long as necessary to fulfill 
              the purposes for which it was collected, comply with legal obligations, 
              resolve disputes, and enforce agreements. Session records are typically 
              retained for 7 years in accordance with professional guidelines.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent where applicable</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Third-Party Services</h2>
            <p className="text-muted-foreground mb-6">
              We use third-party services for payment processing (Razorpay) and 
              communication (email, WhatsApp). These services have their own privacy 
              policies. We share only the minimum information necessary for these 
              services to function.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Cookies</h2>
            <p className="text-muted-foreground mb-6">
              We use essential cookies to maintain your session and preferences. 
              We may use analytics cookies to understand how visitors interact with 
              our website. You can control cookie settings through your browser.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Children's Privacy</h2>
            <p className="text-muted-foreground mb-6">
              Our services are not intended for individuals under 18 years of age. 
              We do not knowingly collect personal information from minors without 
              parental consent.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Changes to This Policy</h2>
            <p className="text-muted-foreground mb-6">
              We may update this Privacy Policy from time to time. We will notify you 
              of any material changes by posting the updated policy on our website with 
              a new "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              If you have questions about this Privacy Policy or our data practices, 
              please contact us at{" "}
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

export default PrivacyPolicy;

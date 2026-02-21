import { Link } from "react-router-dom";
import { Brain, Mail, MapPin, Clock } from "lucide-react";

const footerLinks = {
  services: [
    { name: "Individual Counselling", href: "/services#individual" },
    { name: "Relationship Support", href: "/services#couples" },
    { name: "Career Guidance", href: "/services#career" },
    { name: "Academic Support", href: "/services#academic" },
  ],
  company: [
    { name: "About Saloni", href: "/about" },
    { name: "AI & Safety", href: "/ai-safety" },
    { name: "Fees & Policies", href: "/fees" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Crisis & Urgent Help", href: "/crisis" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-border" data-testid="footer">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-foreground">Mutha's</span>
                <span className="text-sm text-muted-foreground block -mt-1">
                  Psychology Intelligence
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Structured psychology consultation with AI-powered booking and safety-first approach.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Online Sessions Only (India)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Mon-Sat, 10 AM - 8 PM IST</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@muthapsych.com</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Mutha's Psychology Intelligence. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Non-diagnostic service
              </span>
              <span>|</span>
              <span>Not an emergency service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

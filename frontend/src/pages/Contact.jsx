import { useState } from "react";
import { Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "hello@muthapsych.com",
    description: "We respond within 24-48 hours",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Online Sessions Only",
    description: "Serving clients across India",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon-Sat, 10 AM - 8 PM IST",
    description: "Closed on Sundays and holidays",
  },
];

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll respond within 24-48 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen" data-testid="contact-page">
      {/* Hero Section */}
      <section className="section-padding bg-slate-50 subtle-mesh">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions? We're here to help. Reach out and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Get in Touch
              </h2>
              <p className="text-muted-foreground">
                For general inquiries, use the form or email us directly. For urgent matters, 
                please note we are not an emergency service.
              </p>
              
              <div className="space-y-4 pt-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="card-base">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{info.title}</h3>
                        <p className="text-primary font-medium">{info.value}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="card-base">
                <CardContent className="p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-success" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We'll respond within 24-48 hours.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="input-base"
                            data-testid="contact-name-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="input-base"
                            data-testid="contact-email-input"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What's this about?"
                          required
                          className="input-base"
                          data-testid="contact-subject-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help..."
                          rows={5}
                          required
                          className="resize-none"
                          data-testid="contact-message-input"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="btn-primary w-full sm:w-auto gap-2"
                        disabled={isSubmitting}
                        data-testid="contact-submit-btn"
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            Send Message
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-secondary/30">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            <strong>Please note:</strong> We typically respond within 24-48 hours during 
            business days. For booking inquiries, you can also use our{" "}
            <button 
              onClick={() => document.querySelector('[data-testid="chat-open-btn"]')?.click()}
              className="text-primary hover:underline"
            >
              AI receptionist
            </button>{" "}
            for immediate assistance.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Contact;

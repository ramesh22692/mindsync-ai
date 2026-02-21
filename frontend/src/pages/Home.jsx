import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Video, 
  MessageCircle,
  Brain,
  Heart,
  Clock,
  Users,
  CheckCircle,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const trustPoints = [
  { icon: ShieldCheck, text: "Confidential" },
  { icon: Calendar, text: "Appointment-based" },
  { icon: Brain, text: "Non-diagnostic" },
  { icon: Heart, text: "Safety-first" },
  { icon: Users, text: "Human-led sessions" },
];

const outcomes = [
  "Clarity on your thoughts and feelings",
  "Practical coping tools and strategies",
  "Structured reflection and self-awareness",
  "Routine-building support",
];

const howItWorks = [
  { 
    step: 1, 
    title: "AI Receptionist", 
    description: "Quick chat to understand your needs and answer questions",
    icon: MessageCircle 
  },
  { 
    step: 2, 
    title: "Smart Intake", 
    description: "Brief form to help us prepare for your session",
    icon: Brain 
  },
  { 
    step: 3, 
    title: "Book & Pay", 
    description: "Choose your slot and complete secure payment",
    icon: Calendar 
  },
  { 
    step: 4, 
    title: "Session", 
    description: "Meet via video call with your psychologist",
    icon: Video 
  },
  { 
    step: 5, 
    title: "Follow-up", 
    description: "Receive resources and book your next session",
    icon: ArrowRight 
  },
];

export const Home = () => {
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, faqsRes, pricingRes] = await Promise.all([
          axios.get(`${API_URL}/api/services`),
          axios.get(`${API_URL}/api/faqs`),
          axios.get(`${API_URL}/api/pricing`),
        ]);
        setServices(servicesRes.data.slice(0, 4));
        setFaqs(faqsRes.data.slice(0, 5));
        setPricing(pricingRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-background" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden subtle-mesh" data-testid="hero-section">
        <div className="container-custom py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-primary font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Booking & Safety Workflow</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Structured counselling support—{" "}
                <span className="text-gradient">backed by care</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Professional psychology consultation with an intelligent booking system 
                designed to support your journey towards clarity and wellbeing.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book">
                  <Button className="btn-primary gap-2" data-testid="hero-book-btn">
                    Book Appointment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="btn-secondary gap-2"
                  onClick={() => document.querySelector('[data-testid="chat-open-btn"]')?.click()}
                  data-testid="hero-chat-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                  Talk to AI Receptionist
                </Button>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3094215/pexels-photo-3094215.jpeg"
                  alt="Peaceful mindfulness and mental wellness"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">9+ Years</p>
                    <p className="text-sm text-muted-foreground">Teaching & Counselling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-y border-border py-6" data-testid="trust-strip">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {trustPoints.map((point, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 text-muted-foreground"
              >
                <point.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="section-padding bg-background" data-testid="outcomes-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              What You Can Expect
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our sessions focus on practical outcomes that support your everyday wellbeing
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {outcomes.map((outcome, index) => (
              <Card key={index} className="card-feature text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">{outcome}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-slate-50" data-testid="how-it-works-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A streamlined process designed to get you the support you need
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                <Card className="card-base h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 font-bold">
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
                {index < howItWorks.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-primary transform -translate-y-1/2 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Transparency Card */}
      <section className="section-padding bg-background" data-testid="ai-transparency-section">
        <div className="container-custom">
          <Card className="card-base border-primary/20 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <CardContent className="p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm text-primary font-medium mb-4">
                  <Brain className="w-4 h-4" />
                  AI Transparency
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  What Our AI Does & Doesn't Do
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      AI Helps With
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>Intake form structure and organization</li>
                      <li>Appointment reminders and scheduling</li>
                      <li>Answering common questions</li>
                      <li>Administrative automation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-destructive" />
                      AI Never Does
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>Diagnose mental health conditions</li>
                      <li>Replace professional judgement</li>
                      <li>Handle emergencies or crises</li>
                      <li>Provide medical advice</li>
                    </ul>
                  </div>
                </div>
                <Link to="/ai-safety" className="inline-flex items-center gap-2 text-primary font-medium mt-6 hover:underline">
                  Learn more about our AI practices
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
              <div className="hidden md:block bg-secondary/30 p-8 md:p-12">
                <img
                  src="https://images.unsplash.com/photo-1745100552003-c3c98c4a64b3"
                  alt="Mindfulness and balance"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-padding bg-slate-50" data-testid="services-section">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
                Our Services
              </h2>
              <p className="text-muted-foreground">
                Tailored support for different aspects of life
              </p>
            </div>
            <Link to="/services">
              <Button variant="outline" className="gap-2">
                View All Services
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="card-base group">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-medium">{service.price_range}</span>
                    <span className="text-muted-foreground">{service.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className="section-padding bg-background" data-testid="about-section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/7579315/pexels-photo-7579315.jpeg"
                alt="Saloni - Professional Psychologist"
                className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
                Meet Saloni
              </h2>
              <p className="font-accent text-xl text-primary italic">
                "Creating a safe space for your growth journey"
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With a background in clinical psychology and years of experience in 
                online counselling, I've developed a structured approach that combines 
                evidence-based techniques with genuine human connection.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                My practice focuses on helping you develop practical tools and insights 
                that you can apply in your daily life, rather than creating dependency 
                on therapy.
              </p>
              <Link to="/about">
                <Button variant="outline" className="gap-2">
                  Learn More About My Approach
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fees Snapshot */}
      {pricing && (
        <section className="section-padding bg-slate-50" data-testid="fees-section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Transparent Pricing
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Clear, upfront pricing with no hidden fees
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {pricing.sessions.map((session, index) => (
                <Card key={index} className="card-base text-center">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">{session.type}</p>
                    <p className="text-3xl font-bold text-foreground mb-1">
                      ₹{session.price}
                    </p>
                    <p className="text-sm text-primary">{session.duration}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/fees">
                <Button variant="outline" className="gap-2">
                  View Full Pricing & Policies
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="section-padding bg-background" data-testid="faq-section">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Common Questions
            </h2>
            <p className="text-muted-foreground">
              Quick answers to help you get started
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-xl border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center mt-8">
            <Link to="/faq">
              <Button variant="outline" className="gap-2">
                View All FAQs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-primary" data-testid="cta-section">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Take the first step towards clarity and wellbeing. 
            Book a session or chat with our AI receptionist to learn more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book">
              <Button 
                className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-full font-medium"
                data-testid="cta-book-btn"
              >
                Book Your First Session
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 h-12 px-8 rounded-full font-medium"
              onClick={() => document.querySelector('[data-testid="chat-open-btn"]')?.click()}
              data-testid="cta-chat-btn"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Talk to AI Receptionist
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

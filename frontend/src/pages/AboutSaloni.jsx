import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Heart, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const credentials = [
  {
    icon: GraduationCap,
    title: "M.A. Clinical Psychology",
    description: "Specialized training in assessment and intervention",
  },
  {
    icon: Award,
    title: "RCI Registered",
    description: "Rehabilitation Council of India certified",
  },
  {
    icon: Heart,
    title: "500+ Sessions",
    description: "Experience with diverse client needs",
  },
  {
    icon: Shield,
    title: "Online Certified",
    description: "Trained in telehealth best practices",
  },
];

const approach = [
  {
    title: "Person-Centered",
    description: "Your experiences and perspectives are at the center of our work together.",
  },
  {
    title: "Evidence-Based",
    description: "Using techniques backed by research, adapted to your unique situation.",
  },
  {
    title: "Practical Focus",
    description: "Emphasis on tools and strategies you can apply in daily life.",
  },
  {
    title: "Non-Judgmental",
    description: "A safe space where you can explore thoughts without fear of judgment.",
  },
];

export const AboutSaloni = () => {
  return (
    <div className="bg-background min-h-screen" data-testid="about-page">
      {/* Hero Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                About Saloni
              </h1>
              <p className="font-accent text-xl text-primary italic">
                "I believe in empowering you with tools for life, not creating dependency on sessions."
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hello, I'm Saloni Mutha, a clinical psychologist passionate about making 
                mental health support accessible, structured, and practical. My journey in 
                psychology began with a simple belief: everyone deserves a safe space to 
                be heard and supported.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Over the years, I've worked with hundreds of clients across India, helping 
                them navigate challenges ranging from everyday stress to significant life 
                transitions. My approach combines evidence-based techniques with genuine 
                human connection.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/7579315/pexels-photo-7579315.jpeg"
                  alt="Saloni - Clinical Psychologist"
                  className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
                />
                <div className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-xl shadow-lg hidden md:block">
                  <p className="font-semibold">5+ Years</p>
                  <p className="text-sm opacity-80">Clinical Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            Credentials & Training
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred, index) => (
              <Card key={index} className="card-base text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <cred.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{cred.title}</h3>
                  <p className="text-sm text-muted-foreground">{cred.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              My Approach
            </h2>
            <p className="text-muted-foreground">
              I work with a blend of therapeutic approaches, always adapting to what 
              works best for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {approach.map((item, index) => (
              <Card key={index} className="card-feature">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What I Focus On */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            Areas I Work With
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Anxiety & Stress",
              "Relationship Issues",
              "Self-Esteem",
              "Career Confusion",
              "Academic Pressure",
              "Life Transitions",
              "Work-Life Balance",
              "Habit Building",
              "Grief & Loss",
            ].map((area, index) => (
              <div 
                key={index}
                className="p-4 bg-secondary/30 rounded-xl text-center text-foreground font-medium"
              >
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="py-12 bg-secondary/30">
        <div className="container-custom max-w-3xl">
          <Card className="card-base border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Professional Boundaries
              </h3>
              <p className="text-muted-foreground mb-4">
                I provide psychology consultation, which includes coping strategies, 
                self-awareness work, and practical support. I do not:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• Diagnose mental health disorders</li>
                <li>• Prescribe or recommend medications</li>
                <li>• Provide emergency or crisis intervention</li>
                <li>• Offer medical or psychiatric treatment</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                If you require clinical diagnosis or treatment, I can help you find 
                appropriate referrals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ready to Start Working Together?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Take the first step towards clarity and growth.
          </p>
          <Link to="/book">
            <Button className="btn-primary gap-2" data-testid="about-book-btn">
              Book Your Session
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutSaloni;

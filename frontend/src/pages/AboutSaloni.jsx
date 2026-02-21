import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Heart, Shield, Award, Palette, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const credentials = [
  {
    icon: GraduationCap,
    title: "MA in Psychology",
    description: "Advanced training in psychological assessment and counselling techniques",
  },
  {
    icon: Palette,
    title: "BFA in Arts",
    description: "Bachelor of Fine Arts - bringing creativity to therapeutic practice",
  },
  {
    icon: BookOpen,
    title: "B.Ed in Education",
    description: "Bachelor of Education - expertise in learning and development",
  },
  {
    icon: Users,
    title: "9 Years Teaching",
    description: "Extensive experience understanding diverse minds and communication",
  },
];

const approach = [
  {
    title: "Psychology-Informed",
    description: "Evidence-based techniques rooted in my MA Psychology training, tailored to your unique needs.",
  },
  {
    title: "Creatively Expressive",
    description: "My arts background helps explore emotions through creative methods when words fall short.",
  },
  {
    title: "Educationally Structured",
    description: "Clear, step-by-step guidance that builds understanding and practical skills you can apply.",
  },
  {
    title: "Empathetically Human",
    description: "9 years of teaching have taught me to listen deeply and meet you where you are.",
  },
];

const uniqueBlend = [
  {
    area: "Psychology",
    contribution: "Understanding the 'why' behind thoughts and behaviors",
    icon: "🧠",
  },
  {
    area: "Arts",
    contribution: "Creative expression and alternative ways of processing",
    icon: "🎨",
  },
  {
    area: "Education",
    contribution: "Structured learning and practical skill-building",
    icon: "📚",
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
                About Saloni Mutha
              </h1>
              <p className="font-accent text-xl text-primary italic">
                "Where psychology meets creativity and education—a holistic approach to your wellbeing."
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hello, I'm Saloni Mutha. My journey into psychology wasn't linear—it was enriched 
                by my passion for arts and my calling to education. This unique combination allows 
                me to see people not just through a clinical lens, but as complete, creative beings 
                with immense potential for growth.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With 9 years of teaching experience, I've learned that everyone learns and heals 
                differently. Some need structured conversations, others benefit from creative 
                expression, and many thrive with a blend of both. My practice honors this diversity.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
                  MA Psychology
                </span>
                <span className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
                  BFA Arts
                </span>
                <span className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
                  B.Ed Education
                </span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1622460241924-a114e6abe1ff?w=800"
                  alt="Saloni Mutha - Psychology Educator"
                  className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
                />
                <div className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-xl shadow-lg hidden md:block">
                  <p className="font-semibold">9+ Years</p>
                  <p className="text-sm opacity-80">Teaching & Counselling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
            Education & Experience
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            A multidisciplinary foundation that brings depth and breadth to my practice
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred, index) => (
              <Card key={index} className="card-base text-center hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <cred.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{cred.title}</h3>
                  <p className="text-sm text-muted-foreground">{cred.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Unique Blend */}
      <section className="section-padding bg-primary/5">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
              The Unique Blend
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              How my diverse background shapes a richer counselling experience
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {uniqueBlend.map((item, index) => (
                <Card key={index} className="card-base border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="font-semibold text-primary text-lg mb-2">{item.area}</h3>
                    <p className="text-muted-foreground text-sm">{item.contribution}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-white rounded-xl border border-primary/20 text-center">
              <p className="text-foreground font-medium">
                Together, these three disciplines create a practice that doesn't just address symptoms, 
                but nurtures the whole person—mind, creativity, and capacity for growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              My Approach
            </h2>
            <p className="text-muted-foreground">
              Every session is tailored to you, drawing from my diverse background
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
      <section className="section-padding bg-slate-50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            Areas I Work With
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Anxiety & Stress",
              "Relationship Issues",
              "Self-Esteem & Identity",
              "Career Confusion",
              "Academic Pressure",
              "Life Transitions",
              "Work-Life Balance",
              "Habit Building",
              "Emotional Expression",
              "Creative Blocks",
              "Personal Growth",
              "Communication Skills",
            ].map((area, index) => (
              <div 
                key={index}
                className="p-4 bg-white border border-border rounded-xl text-center text-foreground font-medium hover:border-primary/30 transition-colors"
              >
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="py-12">
        <div className="container-custom max-w-3xl">
          <Card className="card-base border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Professional Boundaries
              </h3>
              <p className="text-muted-foreground mb-4">
                I provide psychology consultation, which includes coping strategies, 
                self-awareness work, creative exploration, and practical support. I do not:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                  Diagnose mental health disorders
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                  Prescribe or recommend medications
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                  Provide emergency or crisis intervention
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                  Offer medical or psychiatric treatment
                </li>
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
      <section className="section-padding bg-primary/5">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ready to Start Working Together?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's explore how my unique blend of psychology, arts, and education can support your journey.
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

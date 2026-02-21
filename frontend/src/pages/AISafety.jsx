import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Brain, 
  Lock, 
  Eye, 
  Server, 
  CheckCircle, 
  XCircle,
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const aiDoes = [
  "Schedule appointments and send reminders",
  "Answer common questions about services and pricing",
  "Organize intake form responses for the practitioner",
  "Generate administrative summaries (never shared with clients)",
  "Help navigate the booking process",
];

const aiDoesNot = [
  "Diagnose mental health conditions",
  "Provide therapy or clinical treatment",
  "Replace professional human judgment",
  "Handle emergencies or crisis situations",
  "Give medical or psychiatric advice",
  "Make treatment recommendations",
];

const dataHandling = [
  {
    icon: Lock,
    title: "Encryption",
    description: "All data is encrypted in transit and at rest using industry-standard protocols.",
  },
  {
    icon: Eye,
    title: "Access Control",
    description: "Strict role-based access ensures only authorized personnel can view your information.",
  },
  {
    icon: Server,
    title: "Data Retention",
    description: "We retain data only as long as necessary for service delivery and legal compliance.",
  },
];

export const AISafety = () => {
  return (
    <div className="bg-background min-h-screen" data-testid="ai-safety-page">
      {/* Hero Section */}
      <section className="section-padding bg-slate-50 subtle-mesh">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-primary font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Transparency & Safety</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            AI & Safety Practices
          </h1>
          <p className="text-lg text-muted-foreground">
            We believe in complete transparency about how AI is used in our service. 
            Your safety and privacy are our top priorities.
          </p>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* What AI Does */}
            <Card className="card-base border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  What Our AI Does
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {aiDoes.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What AI Does Not */}
            <Card className="card-base border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-5 h-5" />
                  What Our AI Never Does
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {aiDoesNot.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How AI Is Used */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            How AI Powers Our Service
          </h2>
          
          <div className="space-y-8">
            <Card className="card-base">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">AI Receptionist</h3>
                    <p className="text-muted-foreground">
                      Our chatbot helps answer your questions about services, pricing, and 
                      booking. It can guide you through the intake process but cannot provide 
                      any form of counselling or advice. All conversations include a safety 
                      check, and if you indicate any crisis, the chatbot will immediately 
                      direct you to emergency resources.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Server className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Administrative Automation</h3>
                    <p className="text-muted-foreground">
                      AI helps organize intake responses and generates administrative summaries 
                      for the practitioner. These summaries are used only to help prepare for 
                      sessions and are never shared with clients or used for diagnosis. All 
                      AI-generated content includes disclaimers that it's for operational 
                      support only.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Safety Gating</h3>
                    <p className="text-muted-foreground">
                      Every interaction with our AI includes safety checks. If crisis-related 
                      keywords are detected, the system immediately stops normal operations 
                      and provides crisis resources. This is not a replacement for emergency 
                      services—it's a safeguard to ensure you get appropriate help quickly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
            Your Data, Protected
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            We take data security seriously. Here's how we protect your information.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {dataHandling.map((item, index) => (
              <Card key={index} className="card-feature text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Your Controls */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
            Your Controls
          </h2>
          
          <Card className="card-base">
            <CardContent className="p-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Opt Out of Chatbot</p>
                    <p className="text-sm text-muted-foreground">
                      You can skip the AI receptionist entirely and proceed directly to the intake form.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Request Data Deletion</p>
                    <p className="text-sm text-muted-foreground">
                      Contact us to request deletion of your data from our systems.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Access Your Information</p>
                    <p className="text-sm text-muted-foreground">
                      You can request a copy of the information we hold about you.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Questions About Our Practices?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            We're happy to answer any questions about how we use AI and protect your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="btn-primary">Contact Us</Button>
            </Link>
            <Link to="/privacy">
              <Button variant="outline">Read Privacy Policy</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AISafety;

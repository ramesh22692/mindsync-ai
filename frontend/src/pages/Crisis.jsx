import { AlertTriangle, Phone, Heart, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const crisisResources = [
  {
    name: "Emergency Services (India)",
    number: "112",
    description: "For immediate danger or life-threatening emergencies",
  },
  {
    name: "iCall - Psychosocial Helpline",
    number: "9152987821",
    description: "Free counselling support (Mon-Sat, 8 AM - 10 PM)",
  },
  {
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    description: "24/7 mental health support helpline",
  },
  {
    name: "NIMHANS Helpline",
    number: "080-46110007",
    description: "National Institute of Mental Health support",
  },
];

const immediateSteps = [
  "If you're in immediate danger, call 112 or go to your nearest hospital emergency room.",
  "If you're having thoughts of self-harm, reach out to a helpline above or a trusted person.",
  "Remove yourself from any immediate source of harm if possible.",
  "Stay with someone you trust until you feel safe.",
  "Avoid alcohol, drugs, or other substances that may impair your judgment.",
];

export const Crisis = () => {
  return (
    <div className="bg-background min-h-screen" data-testid="crisis-page">
      {/* Hero Section */}
      <section className="py-12 bg-destructive/10 border-b border-destructive/20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Crisis & Urgent Help
            </h1>
            <p className="text-lg text-muted-foreground">
              If you're in crisis or immediate danger, please use the resources below.
            </p>
          </div>
        </div>
      </section>

      {/* Important Warning */}
      <section className="py-8 bg-destructive text-white">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-bold">We Are NOT an Emergency Service</h2>
          </div>
          <p className="max-w-2xl mx-auto">
            Mutha's Psychology Intelligence provides scheduled consultations only. 
            We cannot respond to emergencies or provide immediate crisis intervention.
          </p>
        </div>
      </section>

      {/* Emergency Numbers */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
            Emergency & Helpline Numbers
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {crisisResources.map((resource, index) => (
              <Card 
                key={index} 
                className={`card-base ${index === 0 ? 'border-destructive bg-destructive/5' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                    </div>
                    <Phone className={`w-5 h-5 ${index === 0 ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <a 
                    href={`tel:${resource.number}`}
                    className={`inline-flex items-center gap-2 text-2xl font-bold ${
                      index === 0 ? 'text-destructive' : 'text-primary'
                    } hover:underline`}
                  >
                    {resource.number}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Immediate Steps */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
            If You're In Crisis Right Now
          </h2>
          
          <Card className="card-base">
            <CardContent className="p-8">
              <ol className="space-y-4">
                {immediateSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-foreground pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* When to Seek Help */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
            When to Seek Immediate Help
          </h2>
          
          <Card className="card-base border-amber-200 bg-amber-50/50">
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-4">
                Please seek immediate professional help if you or someone you know is experiencing:
              </p>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Thoughts of suicide or self-harm
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Thoughts of harming others
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Severe panic or inability to function
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Psychotic symptoms (hallucinations, delusions)
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Severe substance withdrawal
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Domestic violence or abuse
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support Message */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom max-w-2xl text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            You're Not Alone
          </h2>
          <p className="text-muted-foreground mb-6">
            Whatever you're going through, reaching out for help is a sign of strength, 
            not weakness. There are people who want to help you through this.
          </p>
          <p className="text-muted-foreground">
            If you're not in immediate crisis but need support, you can{" "}
            <a href="/book" className="text-primary hover:underline">
              book a consultation
            </a>{" "}
            when you're ready. We're here for you.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Crisis;

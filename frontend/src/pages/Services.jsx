import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Users, Briefcase, GraduationCap, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const serviceIcons = {
  individual: Users,
  couples: Users,
  career: Briefcase,
  academic: GraduationCap,
  habit: Repeat,
};

export const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/services`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="bg-background min-h-screen" data-testid="services-page">
      {/* Hero Section */}
      <section className="section-padding bg-slate-50 subtle-mesh">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Structured psychology consultation tailored to your specific needs. 
            All sessions are online and conducted by a qualified professional.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = serviceIcons[service.id] || Users;
              return (
                <Card 
                  key={service.id} 
                  id={service.id}
                  className="card-base group hover:border-primary/30"
                  data-testid={`service-card-${service.id}`}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {service.concerns.slice(0, 4).map((concern, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration}</span>
                        </div>
                        <span className="font-semibold text-primary">
                          {service.price_range}
                        </span>
                      </div>
                    </div>
                    
                    <Link to="/book" className="block">
                      <Button className="w-full btn-secondary gap-2">
                        Book This Service
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="py-12 bg-secondary/30">
        <div className="container-custom">
          <Card className="card-base border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Important Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">What This Is</h4>
                  <ul className="space-y-1">
                    <li>• Structured psychology consultation</li>
                    <li>• Coping strategies and tools</li>
                    <li>• Self-awareness development</li>
                    <li>• Practical everyday support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">What This Is Not</h4>
                  <ul className="space-y-1">
                    <li>• Clinical diagnosis or treatment</li>
                    <li>• Emergency or crisis service</li>
                    <li>• Medical or psychiatric care</li>
                    <li>• Prescription of medication</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Not Sure Which Service Is Right?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Talk to our AI receptionist for guidance or book a brief consultation call.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book">
              <Button className="btn-primary" data-testid="services-book-btn">
                Book a Consultation
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

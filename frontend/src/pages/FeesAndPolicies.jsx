import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const FeesAndPolicies = () => {
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/pricing`);
        setPricing(response.data);
      } catch (error) {
        console.error("Error fetching pricing:", error);
      }
    };
    fetchPricing();
  }, []);

  return (
    <div className="bg-background min-h-screen" data-testid="fees-page">
      {/* Hero Section */}
      <section className="section-padding bg-slate-50 subtle-mesh">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Fees & Policies
          </h1>
          <p className="text-lg text-muted-foreground">
            Transparent pricing with clear policies. No hidden fees or surprises.
          </p>
        </div>
      </section>

      {/* Session Pricing */}
      {pricing && (
        <section className="section-padding">
          <div className="container-custom">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
              Session Pricing
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {pricing.sessions.map((session, index) => (
                <Card 
                  key={index} 
                  className={`card-base text-center ${index === 1 ? 'border-primary ring-2 ring-primary/20' : ''}`}
                >
                  <CardContent className="pt-6">
                    {index === 1 && (
                      <Badge className="mb-4 bg-primary text-white">Most Popular</Badge>
                    )}
                    <p className="text-sm text-muted-foreground mb-2">{session.type}</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-foreground">₹{session.price}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
      {pricing && (
        <section className="py-12 bg-secondary/30">
          <div className="container-custom">
            <h2 className="text-2xl font-semibold text-foreground text-center mb-8">
              Session Packages
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {pricing.packages.map((pkg, index) => (
                <Card key={index} className="card-base">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">
                        {pkg.sessions} Sessions
                      </span>
                      <Badge variant="secondary" className="text-primary">
                        {pkg.discount} OFF
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Payment Methods */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
            Payment Methods
          </h2>
          
          <Card className="card-base">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-primary" />
                <span className="font-semibold text-foreground">Accepted Payment Methods</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pricing?.policies?.payment_methods?.map((method, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-slate-50 rounded-lg text-center text-foreground font-medium"
                  >
                    {method}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                All payments are processed securely through Razorpay. Your payment information 
                is never stored on our servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Policies */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            Policies
          </h2>
          
          <div className="space-y-6">
            {/* Cancellation Policy */}
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Cancellation Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">24+ hours before session</p>
                    <p className="text-sm text-muted-foreground">
                      Full refund or free reschedule to any available slot.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Within 24 hours</p>
                    <p className="text-sm text-muted-foreground">
                      No refund, but you can reschedule once to another slot within 7 days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">No-show</p>
                    <p className="text-sm text-muted-foreground">
                      No refund and no reschedule. Session is forfeited.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Policy */}
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Refunds are processed within 5-7 business days to the original payment method.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Package refunds are prorated based on sessions used.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    No refunds for sessions that have been completed.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Promotional discounts are non-refundable.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card className="card-base border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Disclaimer</h3>
                    <p className="text-sm text-muted-foreground">
                      This service provides psychology consultation, not medical treatment or diagnosis. 
                      We are NOT an emergency service. If you are in crisis or immediate danger, 
                      please contact emergency services (112) or go to your nearest hospital.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ready to Book?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Choose a slot that works for you and complete your booking in minutes.
          </p>
          <Link to="/book">
            <Button className="btn-primary gap-2" data-testid="fees-book-btn">
              Book Your Session
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FeesAndPolicies;

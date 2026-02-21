import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle,
  Shield,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ageRanges = [
  "18-25",
  "26-35",
  "36-45",
  "46-55",
  "56+",
];

const languages = [
  "English",
  "Hindi",
  "Both English and Hindi",
];

const concernAreas = [
  { id: "anxiety", label: "Anxiety & Stress" },
  { id: "depression", label: "Low Mood / Depression" },
  { id: "relationships", label: "Relationship Issues" },
  { id: "self_esteem", label: "Self-Esteem" },
  { id: "career", label: "Career Confusion" },
  { id: "exam_stress", label: "Exam / Academic Stress" },
  { id: "work_stress", label: "Work-Life Balance" },
  { id: "habit_building", label: "Habit Building" },
  { id: "sleep_issues", label: "Sleep Issues" },
  { id: "grief", label: "Grief & Loss" },
  { id: "life_transitions", label: "Life Transitions" },
  { id: "other", label: "Other" },
];

export const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    age_range: "",
    city: "",
    timezone: "Asia/Kolkata",
    preferred_language: "",
    concern_areas: [],
    stress_level: 3,
    optional_note: "",
    email: "",
    whatsapp: "",
    privacy_consent: false,
    non_emergency_consent: false,
    crisis_response: null, // null = not answered, false = safe, true = crisis
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConcernToggle = (concernId) => {
    setFormData((prev) => ({
      ...prev,
      concern_areas: prev.concern_areas.includes(concernId)
        ? prev.concern_areas.filter((id) => id !== concernId)
        : [...prev.concern_areas, concernId],
    }));
  };

  const validateStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        // Crisis check must be answered with "No" to proceed
        return formData.crisis_response === false;
      case 2:
        return (
          formData.full_name.trim() !== "" &&
          formData.age_range !== "" &&
          formData.city.trim() !== "" &&
          formData.preferred_language !== ""
        );
      case 3:
        return formData.concern_areas.length > 0;
      case 4:
        return (
          formData.email.trim() !== "" &&
          formData.whatsapp.trim() !== "" &&
          formData.privacy_consent &&
          formData.non_emergency_consent
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please complete all required fields");
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error("Please complete all required fields and consents");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/api/intake`, formData);
      
      if (response.data.is_crisis) {
        navigate("/crisis");
        return;
      }

      setSubmissionResult(response.data);
      setStep(5); // Success step
      toast.success("Intake form submitted successfully!");
    } catch (error) {
      console.error("Error submitting intake:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crisis redirect
  if (formData.crisis_response === true) {
    return (
      <div className="bg-background min-h-screen" data-testid="book-page">
        <section className="section-padding">
          <div className="container-custom max-w-xl mx-auto">
            <Card className="card-base border-destructive">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Your Safety Comes First
                </h2>
                <p className="text-muted-foreground mb-6">
                  Based on your response, it seems you may be going through a very 
                  difficult time. Our booking service is not equipped to handle 
                  emergencies or immediate crises.
                </p>
                <p className="text-muted-foreground mb-8">
                  Please reach out to professional crisis support immediately.
                </p>
                <Button 
                  className="btn-crisis w-full"
                  onClick={() => navigate("/crisis")}
                  data-testid="crisis-help-btn"
                >
                  Get Immediate Help
                </Button>
                <Button 
                  variant="ghost" 
                  className="mt-4 w-full"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, crisis_response: null }));
                    setStep(1);
                  }}
                >
                  I made an error, go back
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen" data-testid="book-page">
      {/* Progress Header */}
      <section className="py-8 bg-slate-50 border-b border-border">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              Book Your Appointment
            </h1>
            
            {step < 5 && (
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        s < step
                          ? "bg-primary text-white"
                          : s === step
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-slate-200 text-muted-foreground"
                      }`}
                    >
                      {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                    </div>
                    {s < 4 && (
                      <div
                        className={`w-16 sm:w-24 h-1 ${
                          s < step ? "bg-primary" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {step < 5 && (
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Safety</span>
                <span>About You</span>
                <span>Concerns</span>
                <span>Contact</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="section-padding">
        <div className="container-custom max-w-2xl mx-auto">
          {/* Step 1: Safety Check */}
          {step === 1 && (
            <Card className="card-base" data-testid="step-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Safety Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> This is a mandatory safety question. 
                    Please answer honestly. Your response helps us ensure you get the 
                    right type of support.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium text-foreground">
                    Are you currently at risk of harming yourself or someone else, 
                    or are you in immediate danger?
                  </Label>
                  
                  <RadioGroup
                    value={formData.crisis_response === null ? "" : formData.crisis_response ? "yes" : "no"}
                    onValueChange={(value) => handleInputChange("crisis_response", value === "yes")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <RadioGroupItem value="no" id="safe" data-testid="crisis-no" />
                      <Label htmlFor="safe" className="flex-1 cursor-pointer">
                        <span className="font-medium">No, I am safe</span>
                        <p className="text-sm text-muted-foreground">
                          I am not in immediate danger and not having thoughts of self-harm
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                      <RadioGroupItem value="yes" id="crisis" data-testid="crisis-yes" />
                      <Label htmlFor="crisis" className="flex-1 cursor-pointer">
                        <span className="font-medium text-destructive">Yes, I need immediate help</span>
                        <p className="text-sm text-muted-foreground">
                          I am in danger or having thoughts of harming myself or others
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="btn-primary w-full"
                  onClick={handleNext}
                  disabled={formData.crisis_response !== false}
                  data-testid="step-1-next"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <Card className="card-base" data-testid="step-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  About You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Your full name"
                    className="input-base"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age_range">Age Range *</Label>
                  <Select
                    value={formData.age_range}
                    onValueChange={(value) => handleInputChange("age_range", value)}
                  >
                    <SelectTrigger className="input-base" data-testid="select-age">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Your city"
                    className="input-base"
                    data-testid="input-city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language *</Label>
                  <Select
                    value={formData.preferred_language}
                    onValueChange={(value) => handleInputChange("preferred_language", value)}
                  >
                    <SelectTrigger className="input-base" data-testid="select-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="btn-primary flex-1"
                    onClick={handleNext}
                    disabled={!validateStep(2)}
                    data-testid="step-2-next"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Concerns */}
          {step === 3 && (
            <Card className="card-base" data-testid="step-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  What's on Your Mind?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">Select your concern areas * (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {concernAreas.map((concern) => (
                      <div
                        key={concern.id}
                        onClick={() => handleConcernToggle(concern.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.concern_areas.includes(concern.id)
                            ? "border-primary bg-secondary text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`concern-${concern.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.concern_areas.includes(concern.id)}
                            className="pointer-events-none"
                          />
                          <span className="text-sm font-medium">{concern.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">
                    How would you rate your current stress level? (1 = Low, 5 = High)
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={[formData.stress_level]}
                      onValueChange={(value) => handleInputChange("stress_level", value[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                      data-testid="stress-slider"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>1 - Low</span>
                      <span>2</span>
                      <span>3 - Moderate</span>
                      <span>4</span>
                      <span>5 - High</span>
                    </div>
                  </div>
                  <p className="text-center font-medium text-primary">
                    Current: {formData.stress_level}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Anything else you'd like us to know? (Optional, max 300 chars)</Label>
                  <Textarea
                    id="note"
                    value={formData.optional_note}
                    onChange={(e) => handleInputChange("optional_note", e.target.value.slice(0, 300))}
                    placeholder="Feel free to share anything that might help us understand your situation better..."
                    rows={3}
                    className="resize-none"
                    data-testid="input-note"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.optional_note.length}/300
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="btn-primary flex-1"
                    onClick={handleNext}
                    disabled={!validateStep(3)}
                    data-testid="step-3-next"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Contact & Consent */}
          {step === 4 && (
            <Card className="card-base" data-testid="step-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contact & Consent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="input-base"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="input-base"
                    data-testid="input-whatsapp"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send appointment reminders via WhatsApp (generic messages only, no sensitive details)
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacy_consent}
                      onCheckedChange={(checked) => handleInputChange("privacy_consent", checked)}
                      data-testid="consent-privacy"
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                      I have read and agree to the{" "}
                      <a href="/privacy" target="_blank" className="text-primary hover:underline">
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a href="/terms" target="_blank" className="text-primary hover:underline">
                        Terms & Conditions
                      </a>
                      . *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="emergency"
                      checked={formData.non_emergency_consent}
                      onCheckedChange={(checked) => handleInputChange("non_emergency_consent", checked)}
                      data-testid="consent-emergency"
                    />
                    <Label htmlFor="emergency" className="text-sm leading-relaxed cursor-pointer">
                      I understand that this is NOT an emergency service. If I am in crisis 
                      or immediate danger, I will contact emergency services (112) or go to 
                      my nearest hospital. *
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="btn-primary flex-1"
                    onClick={handleSubmit}
                    disabled={!validateStep(4) || isSubmitting}
                    data-testid="submit-intake"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Intake"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Success */}
          {step === 5 && submissionResult && (
            <Card className="card-base" data-testid="step-5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Intake Submitted Successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for completing your intake form. Here's what we've gathered:
                </p>

                <Card className="card-base text-left mb-6">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Focus Areas:</span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {submissionResult.auto_tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-secondary text-primary text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Suggested Session:</span>
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {submissionResult.suggested_duration} minutes
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-secondary/50 rounded-lg p-4 mb-8">
                  <h3 className="font-medium text-foreground mb-2">What's Next?</h3>
                  <p className="text-sm text-muted-foreground">
                    Slot selection and payment integration coming in Phase 1B. 
                    We'll contact you shortly to schedule your appointment.
                  </p>
                </div>

                <Button
                  className="btn-primary"
                  onClick={() => navigate("/")}
                  data-testid="back-home-btn"
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default BookAppointment;

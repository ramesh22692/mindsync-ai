import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Calendar,
  CreditCard,
  Download,
  MessageSquare,
  Loader2
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ageRanges = ["18-25", "26-35", "36-45", "46-55", "56+"];
const languages = ["English", "Hindi", "Both English and Hindi"];

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

const serviceTypes = [
  { id: "individual", label: "Individual Counselling", description: "One-on-one support" },
  { id: "couples", label: "Relationship Counselling", description: "For couples" },
  { id: "career", label: "Career Guidance", description: "Professional growth" },
  { id: "academic", label: "Academic Support", description: "Student-focused" },
  { id: "habit", label: "Habit Building", description: "Routine & habits" },
];

const durations = [
  { minutes: 30, label: "30 min", price: 1000, description: "Quick Check-in" },
  { minutes: 45, label: "45 min", price: 1500, description: "Standard Session" },
  { minutes: 60, label: "60 min", price: 2000, description: "Extended Session" },
];

export const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakeId, setIntakeId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  
  // Slots state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Form data
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
    crisis_response: null,
  });
  
  // Booking selection
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(45);
  const [selectedService, setSelectedService] = useState("individual");

  // Fetch available slots
  useEffect(() => {
    if (step === 5) {
      fetchSlots();
    }
  }, [step]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await axios.get(`${API_URL}/api/slots?days=14`);
      setAvailableSlots(response.data.slots);
      
      // Group by date
      const dates = [...new Set(response.data.slots.map(s => s.date))];
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Update slots for selected date
  useEffect(() => {
    if (selectedDate) {
      const slots = availableSlots.filter(s => s.date === selectedDate && s.available);
      setSlotsForDate(slots);
    }
  }, [selectedDate, availableSlots]);

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
      case 5:
        return selectedSlot !== null && selectedDuration !== null && selectedService !== null;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      toast.error("Please complete all required fields");
      return;
    }

    if (step === 4) {
      // Submit intake form first
      await submitIntake();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const submitIntake = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/intake`, formData);
      
      if (response.data.is_crisis) {
        navigate("/crisis");
        return;
      }

      setIntakeId(response.data.id);
      setSelectedDuration(response.data.suggested_duration);
      setStep(5); // Move to slot selection
      toast.success("Intake submitted! Now select your preferred slot.");
    } catch (error) {
      console.error("Error submitting intake:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createBooking = async () => {
    if (!validateStep(5)) {
      toast.error("Please select a time slot");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/booking`, {
        intake_id: intakeId,
        slot_date: selectedSlot.date,
        slot_time: selectedSlot.time,
        duration: selectedDuration,
        service_type: selectedService
      });

      setBookingId(response.data.id);
      setBookingDetails(response.data);
      setStep(6); // Move to payment
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.detail || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processPayment = async () => {
    setIsSubmitting(true);
    try {
      // Create payment order (mocked)
      const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
        booking_id: bookingId,
        amount: bookingDetails.amount * 100, // Convert to paise
        payment_method: "card"
      });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Verify payment (mocked - always succeeds)
      const verifyResponse = await axios.post(`${API_URL}/api/payment/verify?booking_id=${bookingId}`);

      toast.success("Payment successful!");
      setStep(7); // Move to confirmation
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadICS = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/booking/${bookingId}/ics`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking_${bookingId}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Calendar invite downloaded!");
    } catch (error) {
      console.error("Error downloading ICS:", error);
      toast.error("Failed to download calendar invite");
    }
  };

  // Get unique dates from slots
  const uniqueDates = [...new Set(availableSlots.map(s => s.date))];

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get price for selected duration and service
  const getPrice = () => {
    if (selectedService === "couples") return 2500;
    const dur = durations.find(d => d.minutes === selectedDuration);
    return dur ? dur.price : 1500;
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
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              Book Your Appointment
            </h1>
            
            {step < 7 && (
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5, 6].map((s) => (
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
                    {s < 6 && (
                      <div
                        className={`w-8 sm:w-12 lg:w-16 h-1 ${
                          s < step ? "bg-primary" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {step < 7 && (
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Safety</span>
                <span>About</span>
                <span>Concerns</span>
                <span>Contact</span>
                <span>Slot</span>
                <span>Pay</span>
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
                    Please answer honestly.
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
                          I am not in immediate danger
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                      <RadioGroupItem value="yes" id="crisis" data-testid="crisis-yes" />
                      <Label htmlFor="crisis" className="flex-1 cursor-pointer">
                        <span className="font-medium text-destructive">Yes, I need immediate help</span>
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
                        <SelectItem key={range} value={range}>{range}</SelectItem>
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
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
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
                  <Label className="text-base">Select your concern areas *</Label>
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
                    Stress level (1 = Low, 5 = High)
                  </Label>
                  <Slider
                    value={[formData.stress_level]}
                    onValueChange={(value) => handleInputChange("stress_level", value[0])}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <p className="text-center font-medium text-primary">
                    Level: {formData.stress_level}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Additional notes (optional)</Label>
                  <Textarea
                    id="note"
                    value={formData.optional_note}
                    onChange={(e) => handleInputChange("optional_note", e.target.value.slice(0, 300))}
                    placeholder="Anything else you'd like us to know..."
                    rows={3}
                    data-testid="input-note"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.optional_note.length}/300
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
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
                    data-testid="input-whatsapp"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacy_consent}
                      onCheckedChange={(checked) => handleInputChange("privacy_consent", checked)}
                      data-testid="consent-privacy"
                    />
                    <Label htmlFor="privacy" className="text-sm cursor-pointer">
                      I agree to the{" "}
                      <a href="/privacy" target="_blank" className="text-primary hover:underline">
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a href="/terms" target="_blank" className="text-primary hover:underline">
                        Terms
                      </a> *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="emergency"
                      checked={formData.non_emergency_consent}
                      onCheckedChange={(checked) => handleInputChange("non_emergency_consent", checked)}
                      data-testid="consent-emergency"
                    />
                    <Label htmlFor="emergency" className="text-sm cursor-pointer">
                      I understand this is NOT an emergency service *
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="btn-primary flex-1"
                    onClick={handleNext}
                    disabled={!validateStep(4) || isSubmitting}
                    data-testid="step-4-next"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Select Slot
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Slot Selection */}
          {step === 5 && (
            <Card className="card-base" data-testid="step-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Your Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Type */}
                <div className="space-y-3">
                  <Label className="text-base">Service Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {serviceTypes.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                          selectedService === service.id
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`service-${service.id}`}
                      >
                        <p className="font-medium text-sm">{service.label}</p>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <Label className="text-base">Session Duration</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {durations.map((dur) => (
                      <div
                        key={dur.minutes}
                        onClick={() => setSelectedDuration(dur.minutes)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                          selectedDuration === dur.minutes
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`duration-${dur.minutes}`}
                      >
                        <p className="font-bold text-lg">{dur.label}</p>
                        <p className="text-sm text-primary">₹{selectedService === "couples" ? 2500 : dur.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-3">
                  <Label className="text-base">Select Date</Label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {uniqueDates.slice(0, 7).map((date) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                          }}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all ${
                            selectedDate === date
                              ? "border-primary bg-primary text-white"
                              : "border-border hover:border-primary/30"
                          }`}
                          data-testid={`date-${date}`}
                        >
                          <p className="font-medium text-sm">{formatDate(date)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="space-y-3">
                    <Label className="text-base">Available Times (IST)</Label>
                    {slotsForDate.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No slots available for this date
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {slotsForDate.map((slot) => (
                          <button
                            key={`${slot.date}-${slot.time}`}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                              selectedSlot?.time === slot.time && selectedSlot?.date === slot.date
                                ? "border-primary bg-primary text-white"
                                : "border-border hover:border-primary/30"
                            }`}
                            data-testid={`slot-${slot.time}`}
                          >
                            {formatTime(slot.time)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {selectedSlot && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="font-medium">Date:</span> {formatDate(selectedSlot.date)}</p>
                      <p><span className="font-medium">Time:</span> {formatTime(selectedSlot.time)} IST</p>
                      <p><span className="font-medium">Duration:</span> {selectedDuration} minutes</p>
                      <p><span className="font-medium">Service:</span> {serviceTypes.find(s => s.id === selectedService)?.label}</p>
                      <p className="text-lg font-bold text-primary mt-2">Total: ₹{getPrice()}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="btn-primary flex-1"
                    onClick={createBooking}
                    disabled={!selectedSlot || isSubmitting}
                    data-testid="step-5-next"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Payment */}
          {step === 6 && bookingDetails && (
            <Card className="card-base" data-testid="step-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Complete Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Demo Mode:</strong> This is a simulated payment. No actual charges will be made.
                  </p>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking ID</span>
                      <span className="font-mono text-sm">{bookingDetails.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session</span>
                      <span>{bookingDetails.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span>{bookingDetails.slot}</span>
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">{bookingDetails.amount_display}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods (Visual Only) */}
                <div className="space-y-3">
                  <Label className="text-base">Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["UPI", "Card", "Net Banking", "Wallet"].map((method) => (
                      <div
                        key={method}
                        className="p-3 rounded-lg border border-primary bg-secondary/30 text-center cursor-pointer"
                      >
                        <span className="font-medium text-sm">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="btn-primary flex-1"
                    onClick={processPayment}
                    disabled={isSubmitting}
                    data-testid="pay-now-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Pay {bookingDetails.amount_display}
                        <CreditCard className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 7: Confirmation */}
          {step === 7 && (
            <Card className="card-base" data-testid="step-7">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Booking Confirmed!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your appointment has been successfully booked. A confirmation email has been sent.
                </p>

                <Card className="card-base text-left mb-6">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{bookingDetails?.slot}</p>
                        <p className="text-sm text-muted-foreground">{bookingDetails?.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Payment Received</p>
                        <p className="text-sm text-muted-foreground">{bookingDetails?.amount_display}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Booking ID: <span className="font-mono">{bookingId}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={downloadICS}
                    className="gap-2"
                    data-testid="download-ics-btn"
                  >
                    <Download className="w-4 h-4" />
                    Add to Calendar
                  </Button>
                  <Button
                    className="btn-primary"
                    onClick={() => navigate("/")}
                    data-testid="back-home-btn"
                  >
                    Back to Home
                  </Button>
                </div>

                <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">What's Next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left">
                    <li>• You'll receive a video call link 24 hours before your session</li>
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Find a quiet, private space for your session</li>
                    <li>• You can reschedule up to 24 hours before</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default BookAppointment;

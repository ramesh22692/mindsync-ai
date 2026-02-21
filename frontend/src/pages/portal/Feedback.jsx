import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Star, 
  ArrowLeft, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Feedback = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?from=/portal');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, bookingId]);

  const fetchData = async () => {
    try {
      const [bookingRes, feedbackRes] = await Promise.all([
        axios.get(`${API_URL}/api/portal/booking/${bookingId}`),
        axios.get(`${API_URL}/api/portal/feedback/${bookingId}`)
      ]);
      
      setBooking(bookingRes.data);
      
      if (feedbackRes.data.exists) {
        setExistingFeedback(feedbackRes.data.feedback);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load booking");
      navigate('/portal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setProcessing(true);
    try {
      await axios.post(`${API_URL}/api/portal/feedback`, {
        booking_id: bookingId,
        rating,
        feedback_text: feedbackText || null,
        would_recommend: wouldRecommend
      });
      toast.success("Thank you for your feedback!");
      navigate('/portal');
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.response?.data?.detail || "Failed to submit feedback");
    } finally {
      setProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (authLoading || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !booking) return null;

  // Already submitted feedback
  if (existingFeedback) {
    return (
      <div className="bg-background min-h-screen" data-testid="feedback-page">
        <section className="py-8 bg-slate-50 border-b border-border">
          <div className="container-custom">
            <Link to="/portal" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Portal
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Session Feedback
            </h1>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-custom max-w-lg mx-auto">
            <Card className="card-base text-center">
              <CardContent className="py-12">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Feedback Already Submitted
                </h3>
                <p className="text-muted-foreground mb-4">
                  You've already provided feedback for this session.
                </p>
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= existingFeedback.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                {existingFeedback.feedback_text && (
                  <p className="text-muted-foreground italic">
                    "{existingFeedback.feedback_text}"
                  </p>
                )}
                <Link to="/portal" className="inline-block mt-6">
                  <Button variant="outline">Back to Portal</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen" data-testid="feedback-page">
      <section className="py-8 bg-slate-50 border-b border-border">
        <div className="container-custom">
          <Link to="/portal" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Session Feedback
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-lg mx-auto">
          <Card className="card-base">
            <CardHeader>
              <CardTitle>How was your session?</CardTitle>
              <CardDescription>
                Your feedback helps us improve our services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Session on</p>
                <p className="font-medium">{formatDate(booking.slot_date)}</p>
              </div>

              {/* Star Rating */}
              <div className="space-y-3">
                <Label>Rating *</Label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                      data-testid={`star-${star}`}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 0 && "Click to rate"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              {/* Feedback Text */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Comments (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts about the session..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  data-testid="feedback-text"
                />
              </div>

              {/* Would Recommend */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="recommend"
                  checked={wouldRecommend}
                  onCheckedChange={setWouldRecommend}
                  data-testid="would-recommend"
                />
                <Label htmlFor="recommend" className="cursor-pointer">
                  I would recommend this service to others
                </Label>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Link to="/portal" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Skip
                  </Button>
                </Link>
                <Button
                  className="btn-primary flex-1"
                  onClick={handleSubmit}
                  disabled={rating === 0 || processing}
                  data-testid="submit-feedback"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Feedback;

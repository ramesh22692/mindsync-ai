import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Reschedule = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
      const [bookingRes, slotsRes] = await Promise.all([
        axios.get(`${API_URL}/api/portal/booking/${bookingId}`),
        axios.get(`${API_URL}/api/slots?days=14`)
      ]);
      
      setBooking(bookingRes.data);
      setSlots(slotsRes.data.slots.filter(s => s.available));
      
      const dates = [...new Set(slotsRes.data.slots.filter(s => s.available).map(s => s.date))];
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load booking");
      navigate('/portal');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      toast.error("Please select a new time slot");
      return;
    }
    
    setProcessing(true);
    try {
      await axios.post(
        `${API_URL}/api/portal/booking/${bookingId}/reschedule?new_date=${selectedSlot.date}&new_time=${selectedSlot.time}`
      );
      toast.success("Booking rescheduled successfully!");
      navigate('/portal');
    } catch (error) {
      console.error("Error rescheduling:", error);
      toast.error(error.response?.data?.detail || "Failed to reschedule");
    } finally {
      setProcessing(false);
    }
  };

  // Get unique dates
  const uniqueDates = [...new Set(slots.map(s => s.date))];
  const slotsForDate = slots.filter(s => s.date === selectedDate);

  // Format helpers
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (authLoading || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !booking) return null;

  return (
    <div className="bg-background min-h-screen" data-testid="reschedule-page">
      <section className="py-8 bg-slate-50 border-b border-border">
        <div className="container-custom">
          <Link to="/portal" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Reschedule Booking
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-2xl mx-auto">
          {/* Current Booking */}
          <Card className="card-base mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Current Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{formatDate(booking.slot_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{formatTime(booking.slot_time)} IST</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Slot Selection */}
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg">Select New Slot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-3">
                <Label>Select Date</Label>
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
                    >
                      <p className="font-medium text-sm">{formatDate(date)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-3">
                  <Label>Available Times</Label>
                  {slotsForDate.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No available slots for this date
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
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    New Slot Selected
                  </h4>
                  <p className="text-muted-foreground">
                    {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.time)} IST
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Link to="/portal" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  className="btn-primary flex-1"
                  onClick={handleReschedule}
                  disabled={!selectedSlot || processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    <>
                      Confirm Reschedule
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
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

export default Reschedule;

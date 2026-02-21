import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Star,
  User,
  LogOut,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success text-white", icon: CheckCircle },
  payment_pending: { label: "Payment Pending", color: "bg-amber-500 text-white", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive text-white", icon: XCircle },
  completed: { label: "Completed", color: "bg-primary text-white", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-slate-500 text-white", icon: Clock },
};

export const Portal = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?from=/portal');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/portal/bookings`);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    
    setProcessing(true);
    try {
      const response = await axios.post(`${API_URL}/api/portal/booking/${selectedBooking.id}/cancel`);
      toast.success(response.data.message);
      setCancelDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling:", error);
      toast.error(error.response?.data?.detail || "Failed to cancel booking");
    } finally {
      setProcessing(false);
    }
  };

  const downloadICS = async (bookingId) => {
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
      toast.error("Failed to download calendar invite");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success("Logged out successfully");
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

  // Format time
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Separate bookings
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' || b.status === 'payment_pending'
  );
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || b.status === 'cancelled'
  );

  if (authLoading || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background min-h-screen" data-testid="portal-page">
      {/* Header */}
      <section className="py-8 bg-slate-50 border-b border-border">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome, {user.full_name}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/book">
                <Button className="btn-primary" data-testid="new-booking-btn">
                  Book New Session
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} data-testid="logout-btn">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          {bookings.length === 0 ? (
            <Card className="card-base text-center py-12">
              <CardContent>
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven't made any appointments. Book your first session to get started.
                </p>
                <Link to="/book">
                  <Button className="btn-primary">Book Your First Session</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Past ({pastBookings.length})
                </TabsTrigger>
              </TabsList>

              {/* Upcoming Bookings */}
              <TabsContent value="upcoming">
                {upcomingBookings.length === 0 ? (
                  <Card className="card-base text-center py-8">
                    <CardContent>
                      <p className="text-muted-foreground">No upcoming bookings</p>
                      <Link to="/book" className="inline-block mt-4">
                        <Button variant="outline">Book a Session</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => {
                      const StatusIcon = statusConfig[booking.status]?.icon || Clock;
                      return (
                        <Card key={booking.id} className="card-base" data-testid={`booking-${booking.id}`}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Badge className={statusConfig[booking.status]?.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig[booking.status]?.label}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    ID: {booking.id.slice(0, 8)}...
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{formatDate(booking.slot_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{formatTime(booking.slot_time)} IST</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{booking.duration} minutes</span>
                                  <span>•</span>
                                  <span className="capitalize">{booking.service_type?.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span className="font-medium text-primary">₹{booking.amount}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {booking.status === 'confirmed' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => downloadICS(booking.id)}
                                      data-testid={`download-ics-${booking.id}`}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Calendar
                                    </Button>
                                    <Link to={`/portal/reschedule/${booking.id}`}>
                                      <Button variant="outline" size="sm">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Reschedule
                                      </Button>
                                    </Link>
                                  </>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setCancelDialogOpen(true);
                                  }}
                                  data-testid={`cancel-${booking.id}`}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Past Bookings */}
              <TabsContent value="past">
                {pastBookings.length === 0 ? (
                  <Card className="card-base text-center py-8">
                    <CardContent>
                      <p className="text-muted-foreground">No past bookings</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => {
                      const StatusIcon = statusConfig[booking.status]?.icon || Clock;
                      return (
                        <Card key={booking.id} className="card-base opacity-80" data-testid={`booking-${booking.id}`}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Badge className={statusConfig[booking.status]?.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig[booking.status]?.label}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatDate(booking.slot_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatTime(booking.slot_time)} IST</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{booking.duration} minutes</span>
                                  <span>•</span>
                                  <span>₹{booking.amount}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {booking.status === 'completed' && (
                                  <Link to={`/portal/feedback/${booking.id}`}>
                                    <Button variant="outline" size="sm">
                                      <Star className="w-4 h-4 mr-2" />
                                      Give Feedback
                                    </Button>
                                  </Link>
                                )}
                                <Link to="/book">
                                  <Button variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Book Again
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking?
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p><strong>Date:</strong> {formatDate(selectedBooking.slot_date)}</p>
                <p><strong>Time:</strong> {formatTime(selectedBooking.slot_time)} IST</p>
                <p><strong>Amount:</strong> ₹{selectedBooking.amount}</p>
              </div>
              
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Cancellation Policy:</strong> Cancellations made 24+ hours before 
                  the session are eligible for a full refund. Cancellations within 24 hours 
                  are not refundable.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Portal;

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, FileText, Star, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success text-white" },
  payment_pending: { label: "Pending", color: "bg-amber-500 text-white" },
  cancelled: { label: "Cancelled", color: "bg-destructive text-white" },
  completed: { label: "Completed", color: "bg-primary text-white" },
};

export const AdminBookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/admin/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user, bookingId]);

  const fetchData = async () => {
    try {
      const [bookingRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/booking/${bookingId}`),
        axios.get(`${API_URL}/api/admin/intake-summary/${bookingId}`)
      ]);
      setData(bookingRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/booking/${bookingId}/status?new_status=${newStatus}`);
      toast.success("Status updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (t) => { const [h,m] = t.split(':'); return `${parseInt(h)%12||12}:${m} ${parseInt(h)>=12?'PM':'AM'}`; };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  const { booking, intake, feedback } = data;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-booking-detail">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/bookings"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
            <h1 className="text-xl font-bold">Booking Details</h1>
          </div>
          <Select value={booking.status} onValueChange={updateStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      <main className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="card-base">
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Session Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={statusConfig[booking.status]?.color}>{statusConfig[booking.status]?.label}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{formatDate(booking.slot_date)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{formatTime(booking.slot_time)} IST</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{booking.duration} minutes</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="capitalize">{booking.service_type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-lg font-bold text-primary">₹{booking.amount}</span></div>
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Client Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3"><User className="w-4 h-4 text-muted-foreground" /><span>{booking.client_name}</span></div>
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted-foreground" /><span>{booking.client_email}</span></div>
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground" /><span>{booking.client_whatsapp}</span></div>
              </CardContent>
            </Card>
            {feedback && (
              <Card className="card-base border-amber-200 bg-amber-50/50">
                <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" />Client Feedback</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-1 mb-2">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</div>
                  {feedback.feedback_text && <p className="text-muted-foreground italic">"{feedback.feedback_text}"</p>}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            {summary && (
              <Card className="card-base border-primary/20">
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Session Prep Summary</CardTitle></CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg mb-4">{summary.summary}</pre>
                  {summary.suggestions?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggested Focus Areas:</h4>
                      <ul className="space-y-1">{summary.suggestions.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />{s}</li>)}</ul>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-4 italic">{summary.disclaimer}</p>
                </CardContent>
              </Card>
            )}
            {intake?.auto_tags?.length > 0 && (
              <Card className="card-base">
                <CardHeader><CardTitle>Auto-Tags</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{intake.auto_tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}</div></CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default AdminBookingDetail;

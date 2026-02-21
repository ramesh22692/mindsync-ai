import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Search, Filter, Loader2, CheckCircle, XCircle, AlertCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success text-white", icon: CheckCircle },
  payment_pending: { label: "Pending", color: "bg-amber-500 text-white", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive text-white", icon: XCircle },
  completed: { label: "Completed", color: "bg-primary text-white", icon: CheckCircle },
};

export const AdminBookings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/admin/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchBookings();
  }, [user, statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await axios.get(`${API_URL}/api/admin/bookings${params}`);
      setBookings(res.data.bookings);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.client_email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (t) => { const [h,m] = t.split(':'); return `${parseInt(h)%12||12}:${m} ${parseInt(h)>=12?'PM':'AM'}`; };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-bookings">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container-custom h-16 flex items-center gap-4">
          <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
          <h1 className="text-xl font-bold">All Bookings</h1>
          <Badge variant="secondary">{bookings.length} total</Badge>
        </div>
      </header>
      <main className="container-custom py-8">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="payment_pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="card-base">
          <CardContent className="p-0">
            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No bookings found</div>
            ) : (
              <div className="divide-y divide-border">
                {filteredBookings.map((b) => (
                  <Link key={b.id} to={`/admin/booking/${b.id}`} className="block p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{b.client_name}</p>
                        <p className="text-sm text-muted-foreground">{b.client_email}</p>
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(b.slot_date)} at {formatTime(b.slot_time)} • {b.duration}min</p>
                      </div>
                      <div className="text-right">
                        <Badge className={statusConfig[b.status]?.color}>{statusConfig[b.status]?.label}</Badge>
                        <p className="text-lg font-semibold mt-1">₹{b.amount}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
export default AdminBookings;

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  LogOut,
  Loader2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success text-white", icon: CheckCircle },
  payment_pending: { label: "Pending Payment", color: "bg-amber-500 text-white", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive text-white", icon: XCircle },
  completed: { label: "Completed", color: "bg-primary text-white", icon: CheckCircle },
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`),
        axios.get(`${API_URL}/api/admin/bookings?status=confirmed`)
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data.bookings.slice(0, 5));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <Badge variant="secondary">Saloni Mutha</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/availability">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Availability
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="card-base">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold">{stats.total_clients}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                    <p className="text-2xl font-bold">{stats.confirmed_bookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{stats.total_revenue.toLocaleString()}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {stats.avg_rating || '-'}
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats Row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="card-base bg-success/10 border-success/20">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-success">{stats.completed_sessions}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card className="card-base bg-amber-50 border-amber-200">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-amber-600">₹{stats.pending_revenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending Payment</p>
              </CardContent>
            </Card>
            <Card className="card-base bg-destructive/10 border-destructive/20">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-destructive">{stats.cancelled_bookings}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Links & Recent Bookings */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/admin/bookings" className="block">
                <Card className="card-base hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>All Bookings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
              <Link to="/admin/clients" className="block">
                <Card className="card-base hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Client Profiles</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
              <Link to="/admin/availability" className="block">
                <Card className="card-base hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Availability Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
              <Link to="/admin/notifications" className="block">
                <Card className="card-base hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span>Notifications Log</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
              <Link to="/admin/bookings">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <Card className="card-base">
              <CardContent className="p-0">
                {recentBookings.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No upcoming sessions
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentBookings.map((booking) => (
                      <Link 
                        key={booking.id} 
                        to={`/admin/booking/${booking.id}`}
                        className="block p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{booking.client_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.slot_date)} at {formatTime(booking.slot_time)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={statusConfig[booking.status]?.color || "bg-slate-500"}>
                              {statusConfig[booking.status]?.label || booking.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {booking.duration} min • ₹{booking.amount}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

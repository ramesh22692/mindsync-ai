import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Send, Bell, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusColors = {
  sent: "bg-success text-white",
  sent_mock: "bg-primary text-white", 
  pending: "bg-amber-500 text-white",
  failed: "bg-destructive text-white"
};

export const AdminNotifications = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState({ email_notifications: [], whatsapp_notifications: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/admin/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/notification-stats`),
        axios.get(`${API_URL}/api/admin/notifications?limit=50`)
      ]);
      setStats(statsRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-notifications">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container-custom h-16 flex items-center gap-4">
          <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
          <h1 className="text-xl font-bold">Notifications</h1>
          <Badge variant={stats?.scheduler_running ? "default" : "destructive"} className="ml-auto">
            {stats?.scheduler_running ? "Scheduler Running" : "Scheduler Stopped"}
          </Badge>
        </div>
      </header>
      <main className="container-custom py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="card-base">
              <CardContent className="pt-6 text-center">
                <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.email.total}</p>
                <p className="text-sm text-muted-foreground">Total Emails</p>
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.whatsapp.total}</p>
                <p className="text-sm text-muted-foreground">WhatsApp Messages</p>
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardContent className="pt-6 text-center">
                <Bell className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{(stats.email.by_type?.reminder_24h || 0) + (stats.email.by_type?.reminder_2h || 0)}</p>
                <p className="text-sm text-muted-foreground">Reminders Sent</p>
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.email.by_type?.booking_confirmation || 0}</p>
                <p className="text-sm text-muted-foreground">Confirmations</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Tabs defaultValue="email">
          <TabsList className="mb-4">
            <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Emails ({notifications.email_count})</TabsTrigger>
            <TabsTrigger value="whatsapp"><MessageSquare className="w-4 h-4 mr-2" />WhatsApp ({notifications.whatsapp_count})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <Card className="card-base">
              <CardContent className="p-0">
                {notifications.email_notifications.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No email notifications yet</div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.email_notifications.map((n, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{n.subject}</p>
                            <p className="text-sm text-muted-foreground">{n.to_email}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(n.sent_at)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={statusColors[n.status]}>{n.status}</Badge>
                            <Badge variant="outline">{n.notification_type}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whatsapp">
            <Card className="card-base">
              <CardContent className="p-0">
                {notifications.whatsapp_notifications.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No WhatsApp messages yet</div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.whatsapp_notifications.map((n, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{n.to_number} • {formatDate(n.sent_at)}</p>
                          </div>
                          <Badge className={statusColors[n.status]}>{n.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
export default AdminNotifications;

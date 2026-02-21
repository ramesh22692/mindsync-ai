import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Users, Search, Calendar, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AdminClients = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/admin/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchClients();
  }, [user]);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/clients`);
      setClients(res.data.clients);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-clients">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container-custom h-16 flex items-center gap-4">
          <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
          <h1 className="text-xl font-bold">Client Profiles</h1>
          <Badge variant="secondary">{clients.length} clients</Badge>
        </div>
      </header>
      <main className="container-custom py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 max-w-md" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Link key={client.id} to={`/admin/client/${client.id}`}>
              <Card className="card-base hover:border-primary/30 transition-colors h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{client.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{client.booking_count} bookings</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No clients found</div>}
      </main>
    </div>
  );
};
export default AdminClients;

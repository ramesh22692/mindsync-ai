import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Plus, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AdminAvailability = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlackout, setNewBlackout] = useState({ date: '', reason: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/admin/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/availability`);
      setSettings(res.data);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/admin/availability`, null, {
        params: {
          weekly_slots: JSON.stringify(settings.weekly_slots),
          buffer_minutes: settings.buffer_minutes,
          advance_booking_days: settings.advance_booking_days
        }
      });
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayIndex) => {
    const updated = [...settings.weekly_slots];
    updated[dayIndex] = { ...updated[dayIndex], is_active: !updated[dayIndex].is_active };
    setSettings({ ...settings, weekly_slots: updated });
  };

  const updateTime = (dayIndex, field, value) => {
    const updated = [...settings.weekly_slots];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setSettings({ ...settings, weekly_slots: updated });
  };

  const addBlackout = async () => {
    if (!newBlackout.date) return;
    try {
      await axios.post(`${API_URL}/api/admin/blackout?date=${newBlackout.date}&reason=${newBlackout.reason || ''}`);
      toast.success("Blackout date added");
      setNewBlackout({ date: '', reason: '' });
      fetchSettings();
    } catch (error) {
      toast.error("Failed to add blackout");
    }
  };

  const removeBlackout = async (date) => {
    try {
      await axios.delete(`${API_URL}/api/admin/blackout/${date}`);
      toast.success("Blackout removed");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!settings) return null;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-availability">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
            <h1 className="text-xl font-bold">Availability Settings</h1>
          </div>
          <Button onClick={saveSettings} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Changes
          </Button>
        </div>
      </header>
      <main className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="card-base">
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Weekly Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {settings.weekly_slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                  <Switch checked={slot.is_active} onCheckedChange={() => toggleDay(i)} />
                  <span className="w-24 font-medium">{DAYS[i]}</span>
                  {slot.is_active ? (
                    <div className="flex items-center gap-2">
                      <Input type="time" value={slot.start_time} onChange={(e) => updateTime(i, 'start_time', e.target.value)} className="w-32" />
                      <span>to</span>
                      <Input type="time" value={slot.end_time} onChange={(e) => updateTime(i, 'end_time', e.target.value)} className="w-32" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Closed</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="card-base">
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Blackout Dates</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input type="date" value={newBlackout.date} onChange={(e) => setNewBlackout({...newBlackout, date: e.target.value})} />
                  <Input placeholder="Reason (optional)" value={newBlackout.reason} onChange={(e) => setNewBlackout({...newBlackout, reason: e.target.value})} />
                  <Button onClick={addBlackout} size="icon"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2">
                  {settings.blackout_dates?.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                      <div><span className="font-medium">{b.date}</span>{b.reason && <span className="text-sm text-muted-foreground ml-2">- {b.reason}</span>}</div>
                      <Button variant="ghost" size="icon" onClick={() => removeBlackout(b.date)}><X className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                  {!settings.blackout_dates?.length && <p className="text-muted-foreground text-center py-4">No blackout dates</p>}
                </div>
              </CardContent>
            </Card>
            <Card className="card-base">
              <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Buffer between sessions (minutes)</Label><Input type="number" value={settings.buffer_minutes} onChange={(e) => setSettings({...settings, buffer_minutes: parseInt(e.target.value)})} /></div>
                <div><Label>Advance booking (days)</Label><Input type="number" value={settings.advance_booking_days} onChange={(e) => setSettings({...settings, advance_booking_days: parseInt(e.target.value)})} /></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AdminAvailability;


import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, User as UserIcon, Lock, Bell, Shield, Trash2,
  Save, Eye, EyeOff, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface SettingsPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onUserUpdate: (updated: User) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export function SettingsPage({ user, onBack, onLogout, onUserUpdate, onOpenTerms, onOpenPrivacy }: SettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notifAssignment, setNotifAssignment] = useState(true);
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);
  const [notifPromotions, setNotifPromotions] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', user.id);
    setSavingProfile(false);
    if (error) { toast.error('Failed to update profile'); return; }
    onUserUpdate({ ...user, name: name.trim() });
    toast.success('Profile updated');
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) { toast.error(error.message); return; }
    setNewPassword(''); setConfirmPassword('');
    toast.success('Password updated');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeletingAccount(true);
    await supabase.from('profiles').update({ name: '[Deleted]', email: '[deleted]' }).eq('id', user.id);
    toast.success('Account deleted');
    onLogout();
  };

  const inputClass = "w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-muted-foreground";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦍</span>
            <span className="text-xl font-bold text-foreground">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <UserIcon className="h-5 w-5 text-emerald-500" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  {user.role === 'admin' && <Badge className="mt-1 bg-red-500 text-white text-xs">Admin</Badge>}
                </div>
              </div>
              <div>
                <label className={labelClass}>Display Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="text" value={user.email} disabled
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile || name.trim() === user.name}
                className="bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lock className="h-5 w-5 text-emerald-500" />
                Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <label className={labelClass}>New Password</label>
                <input type={showNew ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters"
                  className={`${inputClass} pr-10`} />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-muted-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password" className={inputClass} />
              </div>
              <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword || !confirmPassword}
                className="bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white rounded-xl">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5 text-emerald-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Assignment updates', sub: 'Status changes on your submissions', value: notifAssignment, set: setNotifAssignment },
                { label: 'Announcements', sub: 'Platform news and important updates', value: notifAnnouncements, set: setNotifAnnouncements },
                { label: 'Promotions', sub: 'Discounts and special offers', value: notifPromotions, set: setNotifPromotions },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.sub}</p>
                  </div>
                  <button onClick={() => item.set(!item.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? 'bg-emerald-500' : 'bg-white/20'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-emerald-500" />
                Privacy & Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Anonymous analytics</p>
                  <p className="text-sm text-muted-foreground">Help improve ApeAcademy with anonymised usage data</p>
                </div>
                <button onClick={() => setDataSharing(!dataSharing)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${dataSharing ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dataSharing ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={onOpenTerms} className="text-sm text-emerald-400 hover:underline">Terms & Conditions</button>
                <button onClick={onOpenPrivacy} className="text-sm text-emerald-400 hover:underline">Privacy Policy</button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <LogOut className="h-5 w-5 text-muted-foreground" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={onLogout} variant="outline" className="w-full rounded-xl border-border text-foreground hover:bg-white/10">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
              <div className="pt-4 border-t border-red-500/20">
                <p className="font-semibold text-red-400 mb-1 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </p>
                <p className="text-sm text-muted-foreground mb-3">This permanently deletes your account and all your data. This cannot be undone.</p>
                <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  className="w-full px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/5 text-foreground focus:outline-none focus:ring-2 focus:ring-red-400 mb-3 placeholder:text-muted-foreground" />
                <Button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deletingAccount}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-full">
                  {deletingAccount ? 'Deleting...' : 'Delete My Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </main>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User as UserIcon, Lock, Bell, Shield, Trash2, Save, Eye, EyeOff, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onUserUpdate: (updated: User) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export function SettingsPage({ user, onBack, onLogout, onUserUpdate, onOpenTerms, onOpenPrivacy }: SettingsPageProps) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

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

  // Theme-aware colours
  const bg       = dark ? '#0a0f0b' : '#f0fdf4';
  const cardBg   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const cardBord = dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)';
  const txt      = dark ? '#e2e8f0' : '#111827';
  const txtMuted = dark ? 'rgba(255,255,255,0.5)' : '#6b7280';
  const inputBg  = dark ? 'rgba(255,255,255,0.07)' : '#ffffff';
  const inputBord= dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #d1d5db';
  const divider  = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSavingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', user.id);
      if (error) { toast.error('Failed to update profile'); return; }
      onUserUpdate({ ...user, name: name.trim() });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { toast.error(error.message); return; }
      setNewPassword(''); setConfirmPassword('');
      toast.success('Password updated');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeletingAccount(true);
    try {
      await supabase.from('profiles').update({ name: '[Deleted]', email: '[deleted]' }).eq('id', user.id);
      toast.success('Account deleted');
      onLogout();
    } catch {
      toast.error('Failed to delete account');
      setDeletingAccount(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: inputBord, background: inputBg,
    color: txt, fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: txtMuted, marginBottom: 6 };
  const cardStyle: React.CSSProperties = { background: cardBg, border: cardBord, borderRadius: 16, padding: '20px 22px', marginBottom: 16, backdropFilter: 'blur(12px)' };
  const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: txt, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{ position: 'relative', width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: value ? '#22c55e' : (dark ? 'rgba(255,255,255,0.2)' : '#d1d5db'), flexShrink: 0, transition: 'background 0.2s' }}
    >
      <span style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, color: txt }}>
      {/* Header */}
      <div style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${divider}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: txt, display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 10, gap: 6, fontSize: 14 }}>
            <ArrowLeft size={18} /> Back
          </button>
          <span style={{ fontSize: 18, fontWeight: 700, color: txt }}>🦍 {t('nav.settings')}</span>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Profile */}
        <div style={cardStyle}>
          <div style={sectionTitle}><UserIcon size={18} color="#22c55e" /> Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${divider}` }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#047857,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: txt }}>{user.name}</div>
              <div style={{ fontSize: 13, color: txtMuted }}>{user.email}</div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            <p style={{ fontSize: 12, color: txtMuted, marginTop: 4 }}>Email cannot be changed</p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile || name.trim() === user.name}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#047857,#10b981)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: savingProfile || name.trim() === user.name ? 'not-allowed' : 'pointer', opacity: savingProfile || name.trim() === user.name ? 0.6 : 1 }}
          >
            <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Password */}
        <div style={cardStyle}>
          <div style={sectionTitle}><Lock size={18} color="#22c55e" /> Password</div>
          <div style={{ marginBottom: 12, position: 'relative' }}>
            <label style={labelStyle}>New Password</label>
            <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" style={{ ...inputStyle, paddingRight: 42 }} />
            <button onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 12, bottom: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: txtMuted }}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" style={inputStyle} />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={savingPassword || !newPassword || !confirmPassword}
            style={{ background: 'linear-gradient(135deg,#047857,#10b981)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: savingPassword || !newPassword || !confirmPassword ? 'not-allowed' : 'pointer', opacity: savingPassword || !newPassword || !confirmPassword ? 0.6 : 1 }}
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Notifications */}
        <div style={cardStyle}>
          <div style={sectionTitle}><Bell size={18} color="#22c55e" /> Notifications</div>
          {[
            { label: 'Assignment updates', sub: 'Status changes on your submissions', value: notifAssignment, set: () => setNotifAssignment(v => !v) },
            { label: 'Announcements', sub: 'Platform news and important updates', value: notifAnnouncements, set: () => setNotifAnnouncements(v => !v) },
            { label: 'Promotions', sub: 'Discounts and special offers', value: notifPromotions, set: () => setNotifPromotions(v => !v) },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
              <div>
                <div style={{ fontWeight: 500, color: txt, fontSize: 14 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: txtMuted }}>{item.sub}</div>
              </div>
              <Toggle value={item.value} onChange={item.set} />
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div style={cardStyle}>
          <div style={sectionTitle}><Shield size={18} color="#22c55e" /> Privacy & Legal</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}`, marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 500, color: txt, fontSize: 14 }}>Anonymous analytics</div>
              <div style={{ fontSize: 12, color: txtMuted }}>Help improve ApeAcademy with anonymised usage data</div>
            </div>
            <Toggle value={dataSharing} onChange={() => setDataSharing(v => !v)} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={onOpenTerms} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: 13, textDecoration: 'underline' }}>Terms & Conditions</button>
            <button onClick={onOpenPrivacy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: 13, textDecoration: 'underline' }}>Privacy Policy</button>
          </div>
        </div>

        {/* Account / Logout */}
        <div style={cardStyle}>
          <div style={sectionTitle}><LogOut size={18} color={txtMuted} /> Account</div>
          <button
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#d1d5db'}`, borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600, color: txt, cursor: 'pointer', marginBottom: 20 }}
          >
            <LogOut size={16} /> {t('nav.logout')}
          </button>

          <div style={{ borderTop: '1px solid rgba(239,68,68,0.25)', paddingTop: 16 }}>
            <p style={{ fontWeight: 600, color: '#f87171', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <Trash2 size={15} /> Delete Account
            </p>
            <p style={{ fontSize: 13, color: txtMuted, marginBottom: 10 }}>This permanently deletes your account and all data. Cannot be undone.</p>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              style={{ ...inputStyle, border: '1px solid rgba(239,68,68,0.4)', background: dark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)', marginBottom: 10 }}
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deletingAccount}
              style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '11px', fontSize: 14, fontWeight: 700, cursor: deleteConfirm !== 'DELETE' || deletingAccount ? 'not-allowed' : 'pointer', opacity: deleteConfirm !== 'DELETE' || deletingAccount ? 0.55 : 1 }}
            >
              {deletingAccount ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

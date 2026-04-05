
import { useState } from 'react';
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
  console.log('SettingsPage rendering with user:', user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) { toast.error('Enter your current password'); return; }
    if (!newPassword || newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { toast.error(error.message); return; }
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast.success('Password updated successfully');
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

  try {
    const containerStyle: React.CSSProperties = {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1a0c 0%, #0d1f0f 100%)',
      fontFamily: 'DM Sans, system-ui, sans-serif',
      color: '#f0fdf4',
    };

    const headerStyle: React.CSSProperties = {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(10,26,12,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    };

    const backBtnStyle: React.CSSProperties = {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      padding: '8px 16px',
      color: '#f0fdf4',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    };

    const cardStyle: React.CSSProperties = {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
    };

    const cardTitleStyle: React.CSSProperties = {
      fontSize: '16px',
      fontWeight: 700,
      color: '#f0fdf4',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.06)',
      color: '#f0fdf4',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      fontSize: '12px',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.5)',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };

    const saveBtnStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, #047857, #10b981)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: savingPassword ? 'not-allowed' : 'pointer',
      opacity: savingPassword ? 0.7 : 1,
      marginTop: '8px',
    };

    const deleteBtnStyle: React.CSSProperties = {
      background: '#dc2626',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: deletingAccount || deleteConfirm !== 'DELETE' ? 'not-allowed' : 'pointer',
      opacity: deletingAccount || deleteConfirm !== 'DELETE' ? 0.5 : 1,
      width: '100%',
      marginTop: '8px',
    };

    const linkBtnStyle: React.CSSProperties = {
      background: 'none',
      border: 'none',
      color: '#4ade80',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      padding: '4px 0',
      textDecoration: 'underline',
    };

    const logoutBtnStyle: React.CSSProperties = {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '10px',
      padding: '10px 24px',
      color: '#f87171',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 700,
      width: '100%',
    };

    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <button style={backBtnStyle} onClick={onBack}>
            ← Back
          </button>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#f0fdf4' }}>
            🦍 Settings
          </span>
        </header>

        <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>

          {/* User Info */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              👤 Account
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #047857, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f0fdf4', marginBottom: '4px' }}>{user.name}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{user.email}</div>
                {user.role === 'admin' && (
                  <span style={{ display: 'inline-block', marginTop: '6px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, color: '#f87171' }}>
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              🔒 Change Password
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  style={inputStyle}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <button
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '10px', top: '30px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}
                >
                  {showNew ? '🙈' : '👁'}
                </button>
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  style={inputStyle}
                />
              </div>
              <button style={saveBtnStyle} onClick={handleChangePassword} disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Save New Password'}
              </button>
            </div>
          </div>

          {/* Legal */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              📋 Legal
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <button style={linkBtnStyle} onClick={onOpenTerms}>Terms of Service</button>
              <button style={linkBtnStyle} onClick={onOpenPrivacy}>Privacy Policy</button>
            </div>
          </div>

          {/* Logout */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              🚪 Session
            </div>
            <button style={logoutBtnStyle} onClick={onLogout}>
              Log Out
            </button>
          </div>

          {/* Delete Account */}
          <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
            <div style={{ ...cardTitleStyle, color: '#f87171' }}>
              🗑 Delete Account
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px', lineHeight: 1.6 }}>
              This permanently deletes your account and all your data. This cannot be undone.
            </p>
            <label style={labelStyle}>Type DELETE to confirm</label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              style={{ ...inputStyle, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', marginBottom: '4px' }}
            />
            <button style={deleteBtnStyle} onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deletingAccount}>
              {deletingAccount ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>

        </main>
      </div>
    );
  } catch (err) {
    console.error('SettingsPage crashed:', err);
    return (
      <div style={{ minHeight: '100vh', background: '#0a1a0c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#f0fdf4', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div style={{ fontSize: '18px', fontWeight: 700 }}>Settings failed to load</div>
        <button onClick={onBack} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
          Go Back
        </button>
      </div>
    );
  }
}

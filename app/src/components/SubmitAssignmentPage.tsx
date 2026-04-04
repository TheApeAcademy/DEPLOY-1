import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, X, FileText, User as UserIcon, Mail, CheckCircle, Phone, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User, Assignment, FileInfo, AIAnalysis, Payment } from '@/types';
import { ASSIGNMENT_TYPES } from '@/data/constants';
import { createAssignment, updateAssignmentStatus, logActivity } from '@/services/database';
import { uploadFiles } from '@/services/upload';
import { AIAnalysisPanel } from './assignment/AIAnalysisPanel';
import { PaymentPanel } from './assignment/PaymentPanel';
import { useTheme } from '@/contexts/ThemeContext';

interface SubmitAssignmentPageProps {
  user: User | null;
  onBack: () => void;
  onSubmit: (assignment: Assignment) => void;
  onLogin: () => void;
}

export function SubmitAssignmentPage({ user, onBack, onSubmit, onLogin }: SubmitAssignmentPageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [step, setStep] = useState<'form' | 'analysis' | 'payment' | 'success'>('form');
  const [assignmentType, setAssignmentType] = useState('');
  const [language, setLanguage] = useState('English');
  const [courseName, setCourseName] = useState('');
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [platform, setPlatform] = useState('');
  const [platformContact, setPlatformContact] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  // ── Styles (theme-aware) ──────────────────────────────
  const panel: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: isDark ? '1px solid rgba(34,197,94,0.12)' : '1px solid rgba(255,255,255,0.5)',
    borderRadius: '18px',
    padding: '22px',
    marginBottom: '12px',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.07)',
  };

  const inputStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
    border: isDark ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(0,0,0,0.1)',
    borderRadius: '12px',
    padding: '12px 14px',
    color: isDark ? '#e8f5ec' : '#052e16',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2322c55e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '40px',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'none' as const,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
    color: isDark ? 'rgba(134,239,172,0.7)' : '#15803d',
    marginBottom: '6px',
    display: 'block',
  };

  const panelTitleStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#22c55e',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    border: isDark ? '1px solid rgba(34,197,94,0.1)' : '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
  };

  const mutedText = isDark ? 'rgba(134,239,172,0.6)' : '#374151';
  const bodyText = isDark ? '#e8f5ec' : '#052e16';
  const optionBg = isDark ? '#0a0f0b' : '#ffffff';

  const greenBar = (
    <span style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'linear-gradient(180deg,#22c55e,#15803d)', display: 'block', flexShrink: 0 }} />
  );

  // ── Handlers ─────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const newRaw = Array.from(uploadedFiles);
      const newFiles: FileInfo[] = newRaw.map((file) => ({
        name: file.name, size: file.size, type: file.type,
        url: URL.createObjectURL(file),
      }));
      setFiles(prev => [...prev, ...newFiles]);
      setRawFiles(prev => [...prev, ...newRaw]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setRawFiles(rawFiles.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onLogin(); toast.info('Please log in to submit an assignment'); return; }
    if (!platform) { toast.error('Please select a delivery platform'); return; }

    setIsUploading(true);
    toast.info('Uploading files...');
    const tempId = `tmp_${Date.now()}`;
    let uploadedFiles = files;
    if (rawFiles.length > 0) {
      uploadedFiles = await uploadFiles(rawFiles, tempId, setUploadProgress);
      setFiles(uploadedFiles);
    }
    setIsUploading(false);

    const assignmentData = {
      userId: user.id, userName: user.name, userEmail: user.email,
      assignmentType, courseName, className, teacherName,
      dueDate, platform, platformContact, description, language,
      files: uploadedFiles, status: 'pending' as const, schoolLevel: user.schoolLevel || 'University',
    };

    const { data: saved, error } = await createAssignment(assignmentData);
    if (error || !saved) { toast.error('Failed to save assignment: ' + (error || 'Unknown error')); return; }

    setCurrentAssignment(saved);
    await logActivity({
      type: 'assignment_created', userId: user.id, userName: user.name,
      userEmail: user.email, assignmentId: saved.id,
      description: `Assignment created: ${courseName} - ${assignmentType}`,
    });
    toast.success('Assignment saved! Starting review...');
    setStep('analysis');
  };

  const handleAnalysisComplete = (completedAnalysis: AIAnalysis) => {
    setAnalysis(completedAnalysis);
    setCurrentAssignment(prev => prev ? { ...prev, paymentAmount: completedAnalysis.estimatedCost } : prev);
    if (completedAnalysis.inScope) {
      toast.success('Analysis complete! Proceed to payment.');
      setStep('payment');
    } else {
      toast.error('Assignment is out of scope.');
    }
  };

  const handlePaymentComplete = async (payment: Payment) => {
    toast.success('Payment successful! Your assignment has been submitted.');
    if (currentAssignment) {
      await updateAssignmentStatus(currentAssignment.id, { status: 'submitted', payment_id: payment.id });
      await logActivity({
        type: 'assignment_submitted', userId: currentAssignment.userId,
        userName: currentAssignment.userName, assignmentId: currentAssignment.id,
        paymentId: payment.id,
        description: `Assignment submitted after payment. Course: ${currentAssignment.courseName}`,
      });
      onSubmit({ ...currentAssignment, status: 'submitted' as const, paymentId: payment.id });
    }
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-3xl">
              🦍
            </motion.div>
            <span className="text-2xl font-bold text-foreground">ApeAcademy</span>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            {[{ key: 'form', label: 'Details' }, { key: 'analysis', label: 'AI Analysis' }, { key: 'payment', label: 'Payment' }].map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s.key ? 'bg-emerald-600 text-white'
                  : step === 'success' || (step === 'payment' && s.key !== 'payment') || (step === 'analysis' && s.key === 'form')
                  ? 'bg-green-500 text-white' : 'bg-white/10 text-muted-foreground'
                }`}>
                  {step === 'success' || (step === 'payment' && s.key !== 'payment') || (step === 'analysis' && s.key === 'form')
                    ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${step === s.key ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
                {index < 2 && <div className="w-8 h-px bg-white/20 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 page-content">
        {step === 'form' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-foreground mb-2">Submit Assignment</h1>
            <p className="text-muted-foreground mb-8">Fill in the details to submit your assignment for review</p>

            <form onSubmit={handleFormSubmit} className="space-y-3">

              {/* Your Information */}
              {user && (
                <div style={panel}>
                  <div style={panelTitleStyle}>{greenBar} Your Information</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div style={infoRowStyle}>
                      <UserIcon className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <div style={{ fontSize: '11px', color: mutedText, marginBottom: '2px' }}>Name</div>
                        <div style={{ fontWeight: '600', color: bodyText }}>{user.name}</div>
                      </div>
                    </div>
                    <div style={infoRowStyle}>
                      <Mail className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <div style={{ fontSize: '11px', color: mutedText, marginBottom: '2px' }}>Email</div>
                        <div style={{ fontWeight: '600', color: bodyText, fontSize: '13px' }}>{user.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Details */}
              <div style={panel}>
                <div style={panelTitleStyle}>{greenBar} Assignment Details</div>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Assignment Type</label>
                      <select style={selectStyle} value={assignmentType} onChange={e => setAssignmentType(e.target.value)} required>
                        <option value="" style={{ background: optionBg }}>Select type</option>
                        {ASSIGNMENT_TYPES.map(t => <option key={t} value={t} style={{ background: optionBg }}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Due Date</label>
                      <input type="date" style={inputStyle} value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Assignment Language</label>
                      <select style={selectStyle} value={language} onChange={e => setLanguage(e.target.value)}>
                        {['English', 'French', 'Spanish', 'Arabic'].map(l => (
                          <option key={l} value={l} style={{ background: optionBg }}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Course Name</label>
                    <input style={inputStyle} placeholder="e.g., Mathematics 101" value={courseName} onChange={e => setCourseName(e.target.value)} required />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Class / Module</label>
                      <input style={inputStyle} placeholder="e.g., Grade 10A" value={className} onChange={e => setClassName(e.target.value)} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Teacher / Professor</label>
                      <input style={inputStyle} placeholder="e.g., Prof. Smith" value={teacherName} onChange={e => setTeacherName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Description (Optional)</label>
                    <textarea style={textareaStyle} placeholder="Additional details about your assignment..." value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Delivery Platform */}
              <div style={panel}>
                <div style={panelTitleStyle}>{greenBar} Delivery Preference</div>
                <p style={{ fontSize: '13px', color: mutedText, marginBottom: '16px' }}>Choose a platform and provide your contact details</p>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { id: 'WhatsApp', emoji: '💬', color: 'rgba(37,211,102,0.15)', borderActive: 'rgba(37,211,102,0.5)' },
                    { id: 'Email', emoji: '✉️', color: 'rgba(96,165,250,0.15)', borderActive: 'rgba(96,165,250,0.5)' },
                    { id: 'Snapchat', emoji: '👻', color: 'rgba(250,204,21,0.15)', borderActive: 'rgba(250,204,21,0.5)' },
                  ].map(p => (
                    <button key={p.id} type="button" onClick={() => { setPlatform(p.id); setPlatformContact(''); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        padding: '16px 8px', borderRadius: '14px',
                        background: platform === p.id ? p.color : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${platform === p.id ? p.borderActive : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        color: bodyText, cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: 'inherit', fontSize: '13px', fontWeight: '600',
                        transform: platform === p.id ? 'scale(1.03)' : 'scale(1)',
                      }}>
                      <span style={{ fontSize: '24px' }}>{p.emoji}</span>
                      {p.id}
                    </button>
                  ))}
                </div>
                {platform === 'WhatsApp' && (
                  <div>
                    <label style={labelStyle}>Your WhatsApp Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone className="h-4 w-4 text-emerald-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input style={{ ...inputStyle, paddingLeft: '40px' }} type="tel" placeholder="+1 234 567 8900" value={platformContact} onChange={e => setPlatformContact(e.target.value)} required />
                    </div>
                  </div>
                )}
                {platform === 'Email' && (
                  <div>
                    <label style={labelStyle}>Your Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail className="h-4 w-4 text-blue-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input style={{ ...inputStyle, paddingLeft: '40px' }} type="email" placeholder="yourname@example.com" value={platformContact} onChange={e => setPlatformContact(e.target.value)} required />
                    </div>
                  </div>
                )}
                {platform === 'Snapchat' && (
                  <div>
                    <label style={labelStyle}>Your Snapchat Username</label>
                    <div style={{ position: 'relative' }}>
                      <AtSign className="h-4 w-4 text-yellow-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="your.snapchat.username" value={platformContact} onChange={e => setPlatformContact(e.target.value)} required />
                    </div>
                  </div>
                )}
                {!platform && (
                  <p style={{ textAlign: 'center', fontSize: '13px', color: isDark ? 'rgba(134,239,172,0.4)' : '#9ca3af', padding: '8px 0' }}>👆 Select a platform above to continue</p>
                )}
              </div>

              {/* File Upload */}
              <div style={panel}>
                <div style={panelTitleStyle}>{greenBar} Upload Files</div>
                <input type="file" id="fileUpload" multiple onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                <div
                  onClick={() => document.getElementById('fileUpload')?.click()}
                  style={{ border: '2px dashed rgba(34,197,94,0.3)', borderRadius: '14px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.6)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)')}
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
                  <div style={{ color: bodyText, fontWeight: '600', marginBottom: '4px' }}>Click to upload files</div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(134,239,172,0.5)' : '#6b7280', marginBottom: '16px' }}>PDF, DOCX, or images up to 10MB</div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '10px', color: 'white',
                    background: 'linear-gradient(135deg,#047857,#10b981)',
                    boxShadow: '0 4px 12px rgba(5,150,105,0.35)', fontWeight: '600', fontSize: '13px',
                  }}>
                    <Upload className="h-4 w-4" /> Browse Files
                  </span>
                </div>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} style={infoRowStyle}>
                        <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
                        <div className="flex-1">
                          <div style={{ fontWeight: '600', color: bodyText, fontSize: '13px' }}>{file.name}</div>
                          <div style={{ fontSize: '11px', color: isDark ? 'rgba(134,239,172,0.5)' : '#6b7280' }}>{(file.size / 1024).toFixed(2)} KB</div>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isUploading && (
                <div style={{ ...panel, textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#4ade80', marginBottom: '8px', fontWeight: '600' }}>Uploading files... {uploadProgress}%</div>
                  <div style={{ height: '6px', background: 'rgba(34,197,94,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#22c55e', borderRadius: '3px', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!courseName || !className || !platform || !assignmentType || isUploading}
                style={{
                  width: '100%', padding: '16px',
                  background: (!courseName || !className || !platform || !assignmentType || isUploading)
                    ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#14532d,#15803d 40%,#22c55e)',
                  color: 'white', border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: '700',
                  cursor: (!courseName || !className || !platform || !assignmentType || isUploading) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(34,197,94,0.3)', transition: 'all 0.2s',
                }}>
                {isUploading ? 'Uploading...' : 'Continue to Expert Review →'}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'analysis' && currentAssignment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AIAnalysisPanel assignment={currentAssignment} onAnalysisComplete={handleAnalysisComplete} onAnalysisFailed={(err) => toast.error(`Analysis failed: ${err}`)} />
          </motion.div>
        )}

        {step === 'payment' && currentAssignment && analysis?.inScope && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PaymentPanel assignment={currentAssignment} user={user!} onPaymentComplete={handlePaymentComplete} onPaymentFailed={(err) => toast.error(`Payment failed: ${err}`)} />
          </motion.div>
        )}

        {step === 'payment' && analysis && !analysis.inScope && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Assignment Out of Scope</h2>
            <p className="text-muted-foreground mb-6">{analysis.outOfScopeReason || 'This assignment cannot be completed by our service.'}</p>
            <Button onClick={onBack} variant="outline" className="rounded-xl">Go Back</Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

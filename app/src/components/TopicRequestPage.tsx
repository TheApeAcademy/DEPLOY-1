import { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Upload, X, FileText, Phone, Mail, AtSign, BookOpen, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User, FileInfo } from '@/types';
import { uploadFiles } from '@/services/upload';
import { supabase } from '@/lib/supabase';

const LEVELS = ['Primary School', 'Middle School', 'High School', 'Undergraduate', 'Masters', 'PhD', 'Professional'];
const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English Literature', 'History', 'Geography', 'Economics', 'Business Studies',
  'Psychology', 'Sociology', 'Law', 'Medicine', 'Engineering', 'Accounting',
  'Statistics', 'Philosophy', 'Political Science', 'Other'
];

interface TopicRequestPageProps {
  user: User | null;
  onBack: () => void;
  onLogin: () => void;
}

const panel: React.CSSProperties = {
  background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: resolvedTheme === 'dark' ? '1px solid rgba(34,197,94,0.12)' : '1px solid rgba(255,255,255,0.5)',
  borderRadius: '18px',
  padding: '22px',
  marginBottom: '12px',
};

const inputStyle: React.CSSProperties = {
  background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.78)',
  border: '1px solid rgba(34,197,94,0.15)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: resolvedTheme === 'dark' ? '#e8f5ec' : '#052e16',
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
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: '90px',
  resize: 'none' as const,
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1.2px',
  textTransform: 'uppercase' as const,
  color: resolvedTheme === 'dark' ? resolvedTheme === 'dark' ? 'rgba(134,239,172,0.7)' : '#15803d' : '#15803d',
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
  background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
  border: resolvedTheme === 'dark' ? '1px solid rgba(34,197,94,0.1)' : '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
};

const greenBar = (
  <span style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'linear-gradient(180deg,#22c55e,#15803d)', display: 'block', flexShrink: 0 }} />
);

export function TopicRequestPage({ user, onBack, onLogin }: TopicRequestPageProps) {
  const { resolvedTheme } = useTheme();
  const [topicName, setTopicName] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [specificQuestions, setSpecificQuestions] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [platform, setPlatform] = useState('');
  const [platformContact, setPlatformContact] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (uploaded) {
      const newRaw = Array.from(uploaded);
      const newFiles: FileInfo[] = newRaw.map(f => ({ name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) }));
      setFiles(prev => [...prev, ...newFiles]);
      setRawFiles(prev => [...prev, ...newRaw]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setRawFiles(rawFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onLogin(); return; }
    if (!platform) { toast.error('Please select a delivery platform'); return; }
    if (!level) { toast.error('Please select your level of study'); return; }
    if (!subject) { toast.error('Please select a subject'); return; }

    setIsSubmitting(true);
    let uploadedFiles = files;
    if (rawFiles.length > 0) {
      setIsUploading(true);
      uploadedFiles = await uploadFiles(rawFiles, `topic_${Date.now()}`, setUploadProgress);
      setFiles(uploadedFiles);
      setIsUploading(false);
    }

    const { error } = await supabase.from('topics').insert({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      topic_name: topicName,
      subject,
      level,
      specific_questions: specificQuestions,
      additional_context: additionalContext,
      platform,
      platform_contact: platformContact,
      files: uploadedFiles,
      status: 'pending',
    });

    setIsSubmitting(false);
    if (error) { toast.error('Failed to submit: ' + error.message); return; }
    toast.success('Topic request submitted! Proceed to payment.');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 page-content">
        <div style={{ ...panel, maxWidth: '480px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
            📚
          </div>
          <h2 style={{ fontFamily: 'inherit', fontSize: '24px', fontWeight: '800', color: '#e8f5ec', marginBottom: '8px' }}>Almost there!</h2>
          <p style={{ color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.7)' : '#15803d', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
            Your topic request has been saved. Complete the £20 payment to confirm your order.
          </p>
          <a
            href="https://flutterwave.com/pay/ctiqneyy3cgv"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '14px', color: 'white',
              background: 'linear-gradient(135deg,#14532d,#15803d 40%,#22c55e)',
              boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
              fontWeight: '700', fontSize: '15px', textDecoration: 'none',
              marginBottom: '16px', width: '100%', justifyContent: 'center',
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Pay £20 — Complete Order
          </a>
          <p style={{ fontSize: '11px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.4)' : '#6b7280', marginBottom: '20px' }}>
            ⚠️ Enter exactly £20 on the payment page
          </p>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.5)' : '#6b7280', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
            Cancel and go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          <div className="ml-auto">
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(34,197,94,0.2)' }}>
              📚 Topic Request
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-foreground mb-2">Request a Topic Explanation</h1>
          <p className="text-muted-foreground mb-8">
            Struggling with a topic? Tell us exactly what you need and we'll deliver a personalised learning document straight to you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Topic Details */}
            <div style={panel}>
              <div style={panelTitleStyle}>{greenBar} Topic Details</div>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Topic Name</label>
                  <input style={inputStyle} placeholder="e.g. Photosynthesis, Integration by Parts, The French Revolution"
                    value={topicName} onChange={e => setTopicName(e.target.value)} required />
                  <p style={{ fontSize: '11px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.4)' : '#6b7280', marginTop: '4px' }}>Be specific — "Newton's Second Law" is better than "Physics"</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <select style={selectStyle} value={subject} onChange={e => setSubject(e.target.value)} required>
                      <option value="" style={{ background: resolvedTheme === 'dark' ? '#0a0f0b' : '#ffffff' }}>Select subject</option>
                      {SUBJECTS.map(s => <option key={s} value={s} style={{ background: resolvedTheme === 'dark' ? '#0a0f0b' : '#ffffff' }}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Level of Study</label>
                    <select style={selectStyle} value={level} onChange={e => setLevel(e.target.value)} required>
                      <option value="" style={{ background: resolvedTheme === 'dark' ? '#0a0f0b' : '#ffffff' }}>Select level</option>
                      {LEVELS.map(l => <option key={l} value={l} style={{ background: resolvedTheme === 'dark' ? '#0a0f0b' : '#ffffff' }}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Specific Questions or Confusion Points</label>
                  <textarea style={textareaStyle}
                    placeholder="What exactly don't you understand? e.g. 'I understand what photosynthesis is but I don't understand the light-dependent reactions'"
                    value={specificQuestions} onChange={e => setSpecificQuestions(e.target.value)} required />
                  <p style={{ fontSize: '11px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.4)' : '#6b7280', marginTop: '4px' }}>The more specific, the better your learning document</p>
                </div>
                <div>
                  <label style={labelStyle}>Additional Context (Optional)</label>
                  <textarea style={{ ...textareaStyle, minHeight: '70px' }}
                    placeholder="e.g. This is for my Year 2 Biology exam next week. My teacher uses the AQA syllabus."
                    value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div style={panel}>
              <div style={panelTitleStyle}>{greenBar} Upload Reference Files (Optional)</div>
              <p style={{ fontSize: '13px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.5)' : '#6b7280', marginBottom: '16px' }}>Textbook pages, past papers, notes — anything that helps us understand what you need</p>
              <input type="file" id="fileUpload" multiple onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
              <div
                onClick={() => document.getElementById('fileUpload')?.click()}
                style={{ border: '2px dashed rgba(34,197,94,0.3)', borderRadius: '14px', padding: '28px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.6)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)')}
              >
                <Upload className="h-9 w-9 mx-auto mb-2 text-emerald-400" />
                <p style={{ color: '#e8f5ec', fontWeight: '600', marginBottom: '4px' }}>Click to upload files</p>
                <p style={{ fontSize: '12px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.4)' : '#6b7280' }}>PDF, DOCX, or images up to 10MB</p>
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} style={infoRowStyle}>
                      <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div className="flex-1">
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e8f5ec' }}>{file.name}</div>
                        <div style={{ fontSize: '11px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.4)' : '#6b7280' }}>{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Platform */}
            <div style={panel}>
              <div style={panelTitleStyle}>{greenBar} Delivery Preference</div>
              <p style={{ fontSize: '13px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.5)' : '#6b7280', marginBottom: '16px' }}>Choose a platform and provide your contact details</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { id: 'WhatsApp', emoji: '💬', color: 'rgba(37,211,102,0.15)', borderActive: 'rgba(37,211,102,0.5)' },
                  { id: 'Email', emoji: '✉️', color: 'rgba(96,165,250,0.15)', borderActive: 'rgba(96,165,250,0.5)' },
                  { id: 'Snapchat', emoji: '👻', color: 'rgba(250,204,21,0.15)', borderActive: 'rgba(250,204,21,0.5)' },
                ].map(p => (
                  <button key={p.id} type="button" onClick={() => { setPlatform(p.id); setPlatformContact(''); }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '16px 8px', borderRadius: '14px',
                      background: platform === p.id ? p.color : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${platform === p.id ? p.borderActive : 'rgba(255,255,255,0.08)'}`,
                      color: resolvedTheme === 'dark' ? '#e8f5ec' : '#052e16', cursor: 'pointer', transition: 'all 0.2s',
                      fontFamily: 'inherit', fontSize: '13px', fontWeight: '600',
                      transform: platform === p.id ? 'scale(1.03)' : 'scale(1)',
                    }}>
                    <span style={{ fontSize: '22px' }}>{p.emoji}</span>
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
              {!platform && <p style={{ textAlign: 'center', fontSize: '13px', color: resolvedTheme === 'dark' ? 'rgba(134,239,172,0.4)' : '#6b7280', padding: '8px 0' }}>👆 Select a platform above to continue</p>}
            </div>

            {isUploading && (
              <div style={{ ...panel, textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#4ade80', marginBottom: '8px', fontWeight: '600' }}>Uploading files... {uploadProgress}%</div>
                <div style={{ height: '6px', background: 'rgba(34,197,94,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#22c55e', borderRadius: '3px', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            <button type="submit"
              disabled={!topicName || !subject || !level || !specificQuestions || !platform || !platformContact || isSubmitting || isUploading}
              style={{
                width: '100%', padding: '16px',
                background: (!topicName || !subject || !level || !specificQuestions || !platform || !platformContact || isSubmitting || isUploading)
                  ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#14532d,#15803d 40%,#22c55e)',
                color: 'white', border: 'none', borderRadius: '14px',
                fontSize: '15px', fontWeight: '700',
                cursor: (!topicName || !subject || !level || !specificQuestions || !platform || !platformContact || isSubmitting || isUploading) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(34,197,94,0.3)', transition: 'all 0.2s',
              }}>
              {isSubmitting ? 'Submitting...' : '📚 Request Topic Explanation — £20'}
            </button>

          </form>
        </motion.div>
      </main>
    </div>
  );
}

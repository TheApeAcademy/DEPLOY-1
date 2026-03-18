import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, X, FileText, Phone, Mail, AtSign, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import type { User, FileInfo } from '@/types';
import { PLATFORMS } from '@/data/constants';
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

export function TopicRequestPage({ user, onBack, onLogin }: TopicRequestPageProps) {
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
      const newFiles: FileInfo[] = newRaw.map(f => ({
        name: f.name, size: f.size, type: f.type,
        url: URL.createObjectURL(f),
      }));
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
      files: uploadedFiles,
      platform,
      platform_contact: platformContact,
      status: 'pending',
    });

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to submit. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Topic Submitted! 🦍</h2>
          <p className="text-gray-600 mb-2">We've received your topic request for</p>
          <p className="text-xl font-semibold text-emerald-700 mb-6">"{topicName}"</p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will prepare a detailed learning document and deliver it to your {platform}. 
            Expect it within 24 hours.
          </p>
          <Button onClick={onBack}
            className="rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 h-12 px-8">
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-3xl">
              🦍
            </motion.div>
            <span className="text-2xl font-bold text-gray-900">ApeAcademy</span>
          </div>
          <div className="ml-auto">
            <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              📚 Topic Request
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Request a Topic Explanation</h1>
          <p className="text-gray-600 mb-8">
            Struggling with a topic? Tell us exactly what you need and we'll deliver a 
            personalised learning document straight to you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Topic Details */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  Topic Details
                </h3>

                <div>
                  <Label htmlFor="topicName">Topic Name *</Label>
                  <Input id="topicName" placeholder="e.g. Photosynthesis, Integration by Parts, The French Revolution"
                    value={topicName} onChange={e => setTopicName(e.target.value)}
                    required className="h-12 rounded-xl bg-gray-50 mt-1" />
                  <p className="text-xs text-gray-400 mt-1">Be specific — "Newton's Second Law" is better than "Physics"</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Subject *</Label>
                    <select value={subject} onChange={e => setSubject(e.target.value)} required
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm mt-1">
                      <option value="">Select subject</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Level of Study *</Label>
                    <select value={level} onChange={e => setLevel(e.target.value)} required
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm mt-1">
                      <option value="">Select level</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specificQuestions">Specific Questions or Confusion Points *</Label>
                  <Textarea id="specificQuestions"
                    placeholder="What exactly don't you understand? e.g. 'I understand what photosynthesis is but I don't understand the light-dependent reactions or why chlorophyll absorbs specific wavelengths'"
                    value={specificQuestions} onChange={e => setSpecificQuestions(e.target.value)}
                    required className="rounded-xl bg-gray-50 min-h-28 mt-1" />
                  <p className="text-xs text-gray-400 mt-1">The more specific, the better your learning document will be</p>
                </div>

                <div>
                  <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
                  <Textarea id="additionalContext"
                    placeholder="e.g. This is for my Year 2 Biology exam next week. My teacher uses the AQA syllabus. I've already read the textbook but the diagrams confuse me."
                    value={additionalContext} onChange={e => setAdditionalContext(e.target.value)}
                    className="rounded-xl bg-gray-50 min-h-20 mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Reference Files (Optional)</h3>
                <p className="text-sm text-gray-500 mb-4">Textbook pages, past papers, notes, diagrams — anything that helps us understand exactly what you need</p>
                <input type="file" id="fileUpload" multiple onChange={handleFileUpload}
                  className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                <div onClick={() => document.getElementById('fileUpload')?.click()}
                  className="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all">
                  <Upload className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                  <p className="text-gray-700 font-medium">Click to upload files</p>
                  <p className="text-sm text-gray-400">PDF, DOCX, or images up to 10MB</p>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-800">{file.name}</span>
                          <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Platform */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">How should we deliver your learning document?</h3>
                <p className="text-sm text-gray-500 mb-4">Choose a platform and provide your contact details</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { id: 'WhatsApp', emoji: '💬', color: 'border-green-400 bg-green-50', activeColor: 'border-green-500 bg-green-100', textColor: 'text-green-700' },
                    { id: 'Email', emoji: '✉️', color: 'border-blue-400 bg-blue-50', activeColor: 'border-blue-500 bg-blue-100', textColor: 'text-blue-700' },
                    { id: 'Snapchat', emoji: '👻', color: 'border-yellow-400 bg-yellow-50', activeColor: 'border-yellow-500 bg-yellow-100', textColor: 'text-yellow-700' },
                  ].map(p => (
                    <button key={p.id} type="button" onClick={() => { setPlatform(p.id); setPlatformContact(''); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105 font-medium text-sm ${
                        platform === p.id ? `${p.activeColor} ${p.textColor} shadow-md scale-105` : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}>
                      <span className="text-2xl">{p.emoji}</span>
                      <span>{p.id}</span>
                    </button>
                  ))}
                </div>
                {platform === 'WhatsApp' && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    <Input type="tel" placeholder="+1 234 567 8900 (include country code)"
                      value={platformContact} onChange={e => setPlatformContact(e.target.value)}
                      required className="h-12 rounded-xl bg-gray-50 pl-10" />
                  </div>
                )}
                {platform === 'Email' && (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input type="email" placeholder="yourname@example.com"
                      value={platformContact} onChange={e => setPlatformContact(e.target.value)}
                      required className="h-12 rounded-xl bg-gray-50 pl-10" />
                  </div>
                )}
                {platform === 'Snapchat' && (
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                    <Input type="text" placeholder="your.snapchat.username"
                      value={platformContact} onChange={e => setPlatformContact(e.target.value)}
                      required className="h-12 rounded-xl bg-gray-50 pl-10" />
                  </div>
                )}
                {!platform && <p className="text-center text-sm text-gray-400 py-2">👆 Select a platform above</p>}
              </CardContent>
            </Card>

            {isUploading && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-sm font-medium text-emerald-800 mb-2">Uploading files... {uploadProgress}%</div>
                <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <Button type="submit"
              disabled={!topicName || !subject || !level || !specificQuestions || !platform || !platformContact || isSubmitting || isUploading}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-lg font-semibold disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : '📚 Request Topic Explanation'}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

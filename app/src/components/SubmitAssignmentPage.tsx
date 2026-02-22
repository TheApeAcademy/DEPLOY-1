import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, X, FileText, User as UserIcon, Mail, CheckCircle, MessageCircle, Phone, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import type { User, Assignment, FileInfo, AIAnalysis, Payment } from '@/types';
import { PLATFORMS, ASSIGNMENT_TYPES } from '@/data/constants';
import { createAssignment, updateAssignmentStatus, logActivity } from '@/services/database';
import { uploadFiles } from '@/services/upload';
import { AIAnalysisPanel } from './assignment/AIAnalysisPanel';
import { PaymentPanel } from './assignment/PaymentPanel';

interface SubmitAssignmentPageProps {
  user: User | null;
  onBack: () => void;
  onSubmit: (assignment: Assignment) => void;
  onLogin: () => void;
}

export function SubmitAssignmentPage({ user, onBack, onSubmit, onLogin }: SubmitAssignmentPageProps) {
  const [step, setStep] = useState<'form' | 'analysis' | 'payment' | 'success'>('form');
  const [assignmentType, setAssignmentType] = useState('');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const newRaw = Array.from(uploadedFiles);
      const newFiles: FileInfo[] = newRaw.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // temporary preview URL
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

    if (!user) {
      onLogin();
      toast.info('Please log in to submit an assignment');
      return;
    }

    if (!platform) {
      toast.error('Please select a delivery platform');
      return;
    }

    setIsUploading(true);
    toast.info('Uploading files...');

    // Generate a temp ID for the Cloudinary folder — will be replaced by DB id
    const tempId = `tmp_${Date.now()}`;
    let uploadedFiles = files;

    if (rawFiles.length > 0) {
      uploadedFiles = await uploadFiles(rawFiles, tempId, setUploadProgress);
      setFiles(uploadedFiles);
    }

    setIsUploading(false);

    const assignmentData = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      assignmentType,
      courseName,
      className,
      teacherName,
      dueDate,
      platform,
      platformContact,
      description,
      files: uploadedFiles,
      status: 'pending' as const,
    };

    const { data: saved, error } = await createAssignment(assignmentData);

    if (error || !saved) {
      toast.error('Failed to save assignment: ' + (error || 'Unknown error'));
      return;
    }

    setCurrentAssignment(saved);

    await logActivity({
      type: 'assignment_created',
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      assignmentId: saved.id,
      description: `Assignment created: ${courseName} - ${assignmentType}`,
    });

    toast.success('Assignment saved! Starting review...');
    setStep('analysis');
  };

  const handleAnalysisComplete = (completedAnalysis: AIAnalysis) => {
    setAnalysis(completedAnalysis);
    
    if (completedAnalysis.inScope) {
      toast.success('Analysis complete! Proceed to payment.');
      setStep('payment');
    } else {
      toast.error('Assignment is out of scope. Please contact support.');
    }
  };

  const handleAnalysisFailed = (error: string) => {
    toast.error(`Analysis failed: ${error}`);
  };

  const handlePaymentComplete = async (payment: Payment) => {
    toast.success('Payment successful! Your assignment has been submitted.');

    if (currentAssignment) {
      await updateAssignmentStatus(currentAssignment.id, {
        status: 'submitted',
        payment_id: payment.id,
      });
      await logActivity({
        type: 'assignment_submitted',
        userId: currentAssignment.userId,
        userName: currentAssignment.userName,
        assignmentId: currentAssignment.id,
        paymentId: payment.id,
        description: `Assignment submitted after payment. Course: ${currentAssignment.courseName}`,
      });
      const updatedAssignment = { ...currentAssignment, status: 'submitted' as const, paymentId: payment.id };
      onSubmit(updatedAssignment);
    }
  };

  const handlePaymentFailed = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-3xl"
            >
              🦍
            </motion.div>
            <span className="text-2xl font-bold text-gray-900">ApeAcademy</span>
          </div>
          
          {/* Progress Steps */}
          <div className="ml-auto hidden md:flex items-center gap-2">
            {[
              { key: 'form', label: 'Details' },
              { key: 'analysis', label: 'AI Analysis' },
              { key: 'payment', label: 'Payment' },
            ].map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s.key 
                    ? 'bg-emerald-600 text-white' 
                    : step === 'success' || (step === 'payment' && s.key !== 'payment') || (step === 'analysis' && s.key === 'form')
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step === 'success' || (step === 'payment' && s.key !== 'payment') || (step === 'analysis' && s.key === 'form') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm ${step === s.key ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                  {s.label}
                </span>
                {index < 2 && <div className="w-8 h-px bg-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Assignment</h1>
            <p className="text-gray-600 mb-8">Fill in the details to submit your assignment for review</p>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* User Info Section */}
              {user && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">Name</div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assignment Details */}
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="assignmentType">Assignment Type</Label>
                      <Select value={assignmentType} onValueChange={setAssignmentType}>
                        <SelectTrigger className="h-12 rounded-xl bg-gray-50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="courseName">Course Name</Label>
                        <Input
                          id="courseName"
                          placeholder="e.g., Mathematics 101"
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                          required
                          className="h-12 rounded-xl bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="className">Class</Label>
                        <Input
                          id="className"
                          placeholder="e.g., Grade 10A"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          required
                          className="h-12 rounded-xl bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="teacherName">Teacher Name</Label>
                        <Input
                          id="teacherName"
                          placeholder="e.g., Prof. Smith"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          required
                          className="h-12 rounded-xl bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                          className="h-12 rounded-xl bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Additional details about your assignment..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-xl bg-gray-50 min-h-24"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Platform */}
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How should we deliver your completed assignment?</h3>
                  <p className="text-sm text-gray-500 mb-5">Choose a platform and provide your contact details</p>

                  {/* Platform Selector Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { id: 'WhatsApp', label: 'WhatsApp', emoji: '💬', color: 'border-green-400 bg-green-50', activeColor: 'border-green-500 bg-green-100', textColor: 'text-green-700' },
                      { id: 'Email', label: 'Email', emoji: '✉️', color: 'border-blue-400 bg-blue-50', activeColor: 'border-blue-500 bg-blue-100', textColor: 'text-blue-700' },
                      { id: 'Snapchat', label: 'Snapchat', emoji: '👻', color: 'border-yellow-400 bg-yellow-50', activeColor: 'border-yellow-500 bg-yellow-100', textColor: 'text-yellow-700' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setPlatform(p.id); setPlatformContact(''); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 font-medium text-sm ${
                          platform === p.id
                            ? `${p.activeColor} ${p.textColor} shadow-md scale-105`
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{p.emoji}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Contact Input based on selected platform */}
                  {platform === 'WhatsApp' && (
                    <div>
                      <Label htmlFor="platformContact">Your WhatsApp Number</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        <Input
                          id="platformContact"
                          type="tel"
                          placeholder="+1 234 567 8900 (include country code)"
                          value={platformContact}
                          onChange={(e) => setPlatformContact(e.target.value)}
                          required
                          className="h-12 rounded-xl bg-gray-50 pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">We'll send your completed assignment directly to this number</p>
                    </div>
                  )}

                  {platform === 'Email' && (
                    <div>
                      <Label htmlFor="platformContact">Your Email Address</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                        <Input
                          id="platformContact"
                          type="email"
                          placeholder="yourname@example.com"
                          value={platformContact}
                          onChange={(e) => setPlatformContact(e.target.value)}
                          required
                          className="h-12 rounded-xl bg-gray-50 pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Your completed assignment will be emailed to this address</p>
                    </div>
                  )}

                  {platform === 'Snapchat' && (
                    <div>
                      <Label htmlFor="platformContact">Your Snapchat Username</Label>
                      <div className="relative mt-1">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                        <Input
                          id="platformContact"
                          type="text"
                          placeholder="your.snapchat.username"
                          value={platformContact}
                          onChange={(e) => setPlatformContact(e.target.value)}
                          required
                          className="h-12 rounded-xl bg-gray-50 pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">We'll add you on Snapchat and send your assignment there</p>
                    </div>
                  )}

                  {!platform && (
                    <p className="text-center text-sm text-gray-400 py-3">👆 Select a platform above to continue</p>
                  )}
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
                  
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  <div
                    onClick={() => document.getElementById('fileUpload')?.click()}
                    className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/50"
                  >
                    <Upload className="h-12 w-12 mx-auto mb-3" style={{ color: '#059669' }} />
                    <div className="text-gray-900 font-semibold mb-1">Click to upload files</div>
                    <div className="text-sm text-gray-500 mb-4">PDF, DOCX, or images up to 10MB</div>
                    <span
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg, #047857, #10b981)', boxShadow: '0 4px 12px rgba(5,150,105,0.35)' }}
                    >
                      <Upload className="h-4 w-4" />
                      Browse Files
                    </span>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{file.name}</div>
                              <div className="text-sm text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              {isUploading && (
                <div className="w-full p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-sm font-medium text-emerald-800 mb-2">Uploading files... {uploadProgress}%</div>
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              <Button
                type="submit"
                disabled={!courseName || !className || !platform || !assignmentType || isUploading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Continue to Expert Review'}
              </Button>
            </form>
          </motion.div>
        )}

        {step === 'analysis' && currentAssignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AIAnalysisPanel
              assignment={currentAssignment}
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisFailed={handleAnalysisFailed}
            />
          </motion.div>
        )}

        {step === 'payment' && currentAssignment && analysis?.inScope && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PaymentPanel
              assignment={currentAssignment}
              user={user!}
              onPaymentComplete={handlePaymentComplete}
              onPaymentFailed={handlePaymentFailed}
            />
          </motion.div>
        )}

        {step === 'payment' && analysis && !analysis.inScope && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <X className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Assignment Out of Scope
            </h2>
            <p className="text-gray-600 mb-6">
              {analysis.outOfScopeReason || 'This assignment cannot be completed by our service.'}
            </p>
            <Button onClick={onBack} variant="outline" className="rounded-xl">
              Go Back
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

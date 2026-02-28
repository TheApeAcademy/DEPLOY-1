import { motion } from 'motion/react';
import { CheckCircle, FileText, Calendar, DollarSign, ArrowLeft, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Assignment } from '@/types';
import { ASSIGNMENT_STATUS_LABELS } from '@/data/constants';

interface SuccessPageProps {
  assignment: Assignment;
  onBackToHome: () => void;
}

export function SuccessPage({ assignment, onBackToHome }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Assignment Submitted!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Your assignment has been successfully submitted and payment processed.
          </motion.p>
        </motion.div>

        {/* Assignment Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Assignment Details
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${ASSIGNMENT_STATUS_LABELS[assignment.status]?.bgColor} ${ASSIGNMENT_STATUS_LABELS[assignment.status]?.color}`}>
                  {ASSIGNMENT_STATUS_LABELS[assignment.status]?.label || assignment.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Assignment ID</label>
                  <p className="font-mono text-sm text-gray-900">{assignment.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Type</label>
                  <p className="font-medium text-gray-900">{assignment.assignmentType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Course</label>
                  <p className="font-medium text-gray-900">{assignment.courseName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Class</label>
                  <p className="font-medium text-gray-900">{assignment.className}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Teacher</label>
                  <p className="font-medium text-gray-900">{assignment.teacherName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Due Date</label>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {assignment.paymentAmount && (
                <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-green-600">Payment Amount</label>
                      <p className="text-2xl font-bold text-green-900 flex items-center gap-2">
                        <DollarSign className="h-6 w-6" />
                        {assignment.paymentAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <label className="text-sm text-green-600">Status</label>
                      <p className="font-medium text-green-900">Paid</p>
                    </div>
                  </div>
                </div>
              )}

              {assignment.files.length > 0 && (
                <div className="mt-6">
                  <label className="text-sm text-gray-500 mb-3 block">Uploaded Files</label>
                  <div className="space-y-2">
                    {assignment.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Analysis Summary */}
        {assignment.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  AI Analysis Summary
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-purple-50">
                    <p className="text-sm text-gray-500 mb-1">Complexity</p>
                    <p className="font-semibold text-purple-900 capitalize">{assignment.analysis.complexity}</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50">
                    <p className="text-sm text-gray-500 mb-1">Est. Hours</p>
                    <p className="font-semibold text-blue-900">{assignment.analysis.estimatedHours}h</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-green-50">
                    <p className="text-sm text-gray-500 mb-1">Confidence</p>
                    <p className="font-semibold text-green-900">{Math.round(assignment.analysis.confidence * 100)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-6">
            We'll notify you once your assignment is ready. You can track the progress in your dashboard.
          </p>

          <Button
            onClick={onBackToHome}
            size="lg"
            className="h-14 px-8 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  DollarSign,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AIAnalysis, Assignment } from '@/types';
import { analyzeAssignment, reanalyzeAssignment } from '@/services/aiAnalysis';
import { fadeInUp, scaleIn } from '@/data/constants';
import { useTheme } from '@/contexts/ThemeContext';

interface AIAnalysisPanelProps {
  assignment: Assignment;
  onAnalysisComplete: (analysis: AIAnalysis) => void;
  onAnalysisFailed: (error: string) => void;
  currencySymbol?: string;
  userCountry?: string;
}

export function AIAnalysisPanel({
  assignment,
  onAnalysisComplete,
  onAnalysisFailed,
  currencySymbol = '£',
  userCountry,
}: AIAnalysisPanelProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(assignment.analysis || null);
  const [error, setError] = useState<string | null>(null);

  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const textPrimary = isDark ? 'white' : '#111827';
  const textMuted = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';
  const textFaint = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  const cellBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const cellBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const trackBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  useEffect(() => {
    if (assignment.analysis) {
      setAnalysis(assignment.analysis);
    }
  }, [assignment.analysis]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    const result = await analyzeAssignment(assignment, (p) => setProgress(p), userCountry);

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
      onAnalysisComplete(result.analysis);
    } else {
      setError(result.error || 'Analysis failed');
      onAnalysisFailed(result.error || 'Analysis failed');
    }

    setIsAnalyzing(false);
  };

  const handleReReview = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    const result = await reanalyzeAssignment(assignment, (p) => setProgress(p), userCountry);

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
      onAnalysisComplete(result.analysis);
    } else {
      setError(result.error || 'Reanalysis failed');
      onAnalysisFailed(result.error || 'Reanalysis failed');
    }

    setIsAnalyzing(false);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-400 bg-green-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'high': return 'text-red-400 bg-red-500/10';
      default: return isDark ? 'text-gray-400 bg-white/5' : 'text-gray-500 bg-black/5';
    }
  };

  return (
    <Card className="overflow-hidden" style={{ background: cardBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: `1px solid ${cardBorder}`, borderRadius: '20px', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.1)' }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
            <Brain className="h-5 w-5 text-emerald-400" />
            Assignment Review
          </CardTitle>
          {analysis && !isAnalyzing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReReview}
              style={{ color: textFaint }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Re-analyze
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!analysis && !isAnalyzing && !error && (
            <motion.div
              key="start"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)' }}>
                <Sparkles className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textPrimary }}>
                Ready to Analyze
              </h3>
              <p className="mb-6 max-w-sm mx-auto" style={{ color: textMuted }}>
                Our team will evaluate your assignment to determine complexity, estimated cost, and feasibility.
              </p>
              <Button
                onClick={handleAnalyze}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600"
              >
                <Brain className="h-5 w-5 mr-2" />
                Start Review
              </Button>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="analyzing"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-500 flex items-center justify-center"
                >
                  <Brain className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
                  Reviewing Assignment...
                </h3>
                <p style={{ color: textMuted }}>
                  Evaluating complexity, requirements, and estimated effort
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: textMuted }}>Analysis Progress</span>
                  <span className="font-medium text-emerald-400">{progress}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: trackBg }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-full"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { label: 'Scanning content', icon: FileText, active: progress >= 20 },
                    { label: 'Evaluating complexity', icon: TrendingUp, active: progress >= 50 },
                    { label: 'Calculating cost', icon: DollarSign, active: progress >= 80 },
                  ].map((step) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: step.active ? 1 : 0.5 }}
                      className="text-center p-3 rounded-xl"
                      style={{ background: step.active ? 'rgba(34,197,94,0.12)' : cellBg }}
                    >
                      <step.icon className={`h-5 w-5 mx-auto mb-2 ${
                        step.active ? 'text-emerald-400' : isDark ? 'text-white/30' : 'text-black/25'
                      }`} />
                      <p className={`text-xs ${step.active ? 'text-emerald-400' : isDark ? 'text-white/40' : 'text-black/35'}`}>
                        {step.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {error && !isAnalyzing && (
            <motion.div
              key="error"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textPrimary }}>
                Analysis Failed
              </h3>
              <p className="mb-6" style={{ color: textMuted }}>{error}</p>
              <Button
                onClick={handleAnalyze}
                variant="outline"
                className="rounded-xl"
                style={{ borderColor: cellBorder, color: textPrimary, background: cellBg }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          )}

          {analysis && !isAnalyzing && (
            <motion.div
              key="result"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              {/* Status Banner */}
              <div className="p-4 rounded-xl" style={
                analysis.inScope
                  ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }
                  : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }
              }>
                <div className="flex items-center gap-3">
                  {analysis.inScope ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h4 className="font-semibold" style={{ color: textPrimary }}>Assignment In Scope</h4>
                        <p className="text-sm" style={{ color: textMuted }}>
                          This assignment can be completed. Proceed to payment.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-400" />
                      <div>
                        <h4 className="font-semibold" style={{ color: textPrimary }}>Assignment Out of Scope</h4>
                        <p className="text-sm" style={{ color: textMuted }}>
                          {analysis.outOfScopeReason || 'This assignment cannot be completed.'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Analysis Results Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: cellBg, border: `1px solid ${cellBorder}` }}
                >
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
                  <p className="text-xs mb-1" style={{ color: textFaint }}>Complexity</p>
                  <Badge className={`capitalize ${getComplexityColor(analysis.complexity)}`}>
                    {analysis.complexity}
                  </Badge>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: cellBg, border: `1px solid ${cellBorder}` }}
                >
                  <Clock className="h-5 w-5 mx-auto mb-2 text-blue-400" />
                  <p className="text-xs mb-1" style={{ color: textFaint }}>Est. Hours</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{analysis.estimatedHours}h</p>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: cellBg, border: `1px solid ${cellBorder}` }}
                >
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
                  <p className="text-xs mb-1" style={{ color: textFaint }}>Est. Cost</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>
                    {currencySymbol}{analysis.estimatedCost.toFixed(2)}
                  </p>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: cellBg, border: `1px solid ${cellBorder}` }}
                >
                  <Sparkles className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
                  <p className="text-xs mb-1" style={{ color: textFaint }}>Confidence</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>
                    {Math.round(analysis.confidence * 100)}%
                  </p>
                </motion.div>
              </div>

              {/* Additional Details */}
              {(analysis.wordCount || analysis.pageCount || analysis.requirements.length > 0) && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: textPrimary }}>
                    <FileText className="h-4 w-4 text-emerald-400" />
                    Additional Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {analysis.wordCount && (
                      <div>
                        <span style={{ color: textFaint }}>Est. Word Count:</span>{' '}
                        <span className="font-medium" style={{ color: textPrimary }}>{analysis.wordCount}</span>
                      </div>
                    )}
                    {analysis.pageCount && (
                      <div>
                        <span style={{ color: textFaint }}>Est. Page Count:</span>{' '}
                        <span className="font-medium" style={{ color: textPrimary }}>{analysis.pageCount}</span>
                      </div>
                    )}
                    {analysis.subjectArea && (
                      <div>
                        <span style={{ color: textFaint }}>Subject Area:</span>{' '}
                        <span className="font-medium" style={{ color: textPrimary }}>{analysis.subjectArea}</span>
                      </div>
                    )}
                  </div>

                  {analysis.requirements.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm" style={{ color: textFaint }}>Detected Requirements:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {analysis.requirements.map((req, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs" style={{ background: cellBg, color: textMuted }}>
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: textMuted }}>Analysis Confidence</span>
                  <span className="font-medium text-emerald-400">
                    {Math.round(analysis.confidence * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: trackBg }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.confidence * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`h-full rounded-full ${
                      analysis.confidence >= 0.8
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : analysis.confidence >= 0.6
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                        : 'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

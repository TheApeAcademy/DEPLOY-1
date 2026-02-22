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

interface AIAnalysisPanelProps {
  assignment: Assignment;
  onAnalysisComplete: (analysis: AIAnalysis) => void;
  onAnalysisFailed: (error: string) => void;
}

export function AIAnalysisPanel({ 
  assignment, 
  onAnalysisComplete, 
  onAnalysisFailed 
}: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(assignment.analysis || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignment.analysis) {
      setAnalysis(assignment.analysis);
    }
  }, [assignment.analysis]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    const result = await analyzeAssignment(assignment, (p) => setProgress(p));

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
      onAnalysisComplete(result.analysis);
    } else {
      setError(result.error || 'Analysis failed');
      onAnalysisFailed(result.error || 'Analysis failed');
    }

    setIsAnalyzing(false);
  };

  const handleRe-review = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    const result = await reanalyzeAssignment(assignment, (p) => setProgress(p));

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
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-600" />
            Assignment Review
          </CardTitle>
          {analysis && !isAnalyzing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRe-review}
              className="text-gray-500 hover:text-emerald-700"
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Analyze
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Reviewing Assignment...
                </h3>
                <p className="text-gray-600">
                  Evaluating complexity, requirements, and estimated effort
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Analysis Progress</span>
                  <span className="font-medium text-emerald-700">{progress}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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
                      className={`text-center p-3 rounded-xl ${
                        step.active ? 'bg-emerald-50' : 'bg-gray-50'
                      }`}
                    >
                      <step.icon className={`h-5 w-5 mx-auto mb-2 ${
                        step.active ? 'text-emerald-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-xs ${step.active ? 'text-emerald-700' : 'text-gray-500'}`}>
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analysis Failed
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={handleAnalyze}
                variant="outline"
                className="rounded-xl"
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
              <div className={`p-4 rounded-xl ${
                analysis.inScope 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  {analysis.inScope ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-green-900">Assignment In Scope</h4>
                        <p className="text-sm text-green-700">
                          This assignment can be completed. Proceed to payment.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-500" />
                      <div>
                        <h4 className="font-semibold text-red-900">Assignment Out of Scope</h4>
                        <p className="text-sm text-red-700">
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
                  className="p-4 rounded-xl bg-gray-50 text-center"
                >
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-emerald-600" />
                  <p className="text-xs text-gray-500 mb-1">Complexity</p>
                  <Badge className={`capitalize ${getComplexityColor(analysis.complexity)}`}>
                    {analysis.complexity}
                  </Badge>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-xl bg-gray-50 text-center"
                >
                  <Clock className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                  <p className="text-xs text-gray-500 mb-1">Est. Hours</p>
                  <p className="font-semibold text-gray-900">{analysis.estimatedHours}h</p>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl bg-gray-50 text-center"
                >
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-gray-500 mb-1">Est. Cost</p>
                  <p className="font-semibold text-gray-900">
                    ${analysis.estimatedCost.toFixed(2)}
                  </p>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl bg-gray-50 text-center"
                >
                  <Sparkles className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                  <p className="text-xs text-gray-500 mb-1">Confidence</p>
                  <p className="font-semibold text-gray-900">
                    {Math.round(analysis.confidence * 100)}%
                  </p>
                </motion.div>
              </div>

              {/* Additional Details */}
              {(analysis.wordCount || analysis.pageCount || analysis.requirements.length > 0) && (
                <div className="p-4 rounded-xl bg-emerald-50/50">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Additional Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {analysis.wordCount && (
                      <div>
                        <span className="text-gray-500">Est. Word Count:</span>{' '}
                        <span className="font-medium">{analysis.wordCount}</span>
                      </div>
                    )}
                    {analysis.pageCount && (
                      <div>
                        <span className="text-gray-500">Est. Page Count:</span>{' '}
                        <span className="font-medium">{analysis.pageCount}</span>
                      </div>
                    )}
                    {analysis.subjectArea && (
                      <div>
                        <span className="text-gray-500">Subject Area:</span>{' '}
                        <span className="font-medium">{analysis.subjectArea}</span>
                      </div>
                    )}
                  </div>
                  
                  {analysis.requirements.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-sm">Detected Requirements:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {analysis.requirements.map((req, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
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
                  <span className="text-gray-600">Analysis Confidence</span>
                  <span className="font-medium text-emerald-700">
                    {Math.round(analysis.confidence * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

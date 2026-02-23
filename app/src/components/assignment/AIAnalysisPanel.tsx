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

  // ✅ FIXED FUNCTION NAME
  const handleReReview = async () => {
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
              onClick={handleReReview}
              className="text-gray-500 hover:text-emerald-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Re-analyze
            </Button>
          )}

        </div>
      </CardHeader>

      {/* KEEP REST OF YOUR ORIGINAL JSX EXACTLY SAME */}

      <CardContent>
        {/* unchanged */}
      </CardContent>

    </Card>
  );
}={scaleIn}
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

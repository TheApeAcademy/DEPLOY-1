import type { AIAnalysis, Assignment } from '@/types';
import { updateAssignmentStatus, logActivity } from '@/services/database';

const calculatePriceLocally = (assignment: Assignment) => {
  const type = assignment.assignmentType || 'Other';
  const desc = (assignment.description || '').toLowerCase();
  const dueDate = assignment.dueDate;

  const highTypes = ['Thesis', 'Dissertation', 'Research Paper'];
  const medTypes = ['Project', 'Case Study', 'Lab Report', 'Presentation'];
  const highWords = ['research', 'analysis', 'comprehensive', 'detailed', 'complex', 'advanced'];
  const lowWords = ['simple', 'basic', 'short', 'brief', 'summary'];

  let complexity: 'low' | 'medium' | 'high' = 'medium';
  if (highTypes.includes(type)) complexity = 'high';
  else if (medTypes.includes(type)) complexity = 'medium';
  else if (lowWords.some(w => desc.includes(w))) complexity = 'low';
  else if (highWords.some(w => desc.includes(w))) complexity = 'high';

  const daysUntilDue = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 7;
  const urgency = daysUntilDue <= 1 ? 'express' : daysUntilDue <= 3 ? 'urgent' : 'normal';

  const basePrices: Record<string, number> = {
    Homework: 15,
    Essay: 30,
    'Lab Report': 35,
    Presentation: 30,
    'Case Study': 45,
    Project: 50,
    'Research Paper': 60,
    Thesis: 100,
    Dissertation: 150,
    Other: 25,
  };

  const estimatedHours = complexity === 'low' ? 2 : complexity === 'medium' ? 4 : 8;
  const urgencyAdd: Record<string, number> = { normal: 0, urgent: 10, express: 20 };
  const basePrice = basePrices[type] || 25;
  const price = Math.round((basePrice + urgencyAdd[urgency]) * 100) / 100;

  return { price, complexity, estimatedHours, urgency, inScope: true, currency: 'GBP' };
};

export const analyzeAssignment = async (
  assignment: Assignment,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; analysis?: AIAnalysis; error?: string }> => {
  try {
    await updateAssignmentStatus(assignment.id, { status: 'analyzing' });
    await logActivity({
      type: 'assignment_analyzing',
      userId: assignment.userId,
      userName: assignment.userName,
      assignmentId: assignment.id,
      description: `Review started for assignment ${assignment.id}`,
    });

    onProgress?.(20);
    await new Promise(r => setTimeout(r, 500));
    onProgress?.(50);
    await new Promise(r => setTimeout(r, 400));

    const priceResult = calculatePriceLocally(assignment);

    onProgress?.(80);
    await new Promise(r => setTimeout(r, 300));
    onProgress?.(100);

    const requirements = extractRequirements(assignment.description);

    const analysis: AIAnalysis = {
      id: `analysis_${Date.now()}`,
      assignmentId: assignment.id,
      status: 'completed',
      progress: 100,
      estimatedCost: priceResult.price,
      currency: 'GBP',
      complexity: priceResult.complexity as 'low' | 'medium' | 'high',
      estimatedHours: priceResult.estimatedHours,
      subjectArea: assignment.courseName,
      requirements,
      inScope: true,
      confidence: 0.95,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    await updateAssignmentStatus(assignment.id, {
      status: 'analyzed',
      payment_amount: priceResult.price,
      complexity: priceResult.complexity,
      estimated_hours: priceResult.estimatedHours,
    });

    await logActivity({
      type: 'assignment_analyzed',
      userId: assignment.userId,
      userName: assignment.userName,
      assignmentId: assignment.id,
      description: `Review complete. Price: £${priceResult.price}. Complexity: ${priceResult.complexity}`,
    });

    return { success: true, analysis };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Review failed';
    await updateAssignmentStatus(assignment.id, { status: 'pending' });
    return { success: false, error: msg };
  }
};

export const reanalyzeAssignment = async (
  assignment: Assignment,
  onProgress?: (progress: number) => void
) => analyzeAssignment(assignment, onProgress);

const extractRequirements = (description?: string): string[] => {
  if (!description) return [];
  const checks = [
    'APA', 'MLA', 'Chicago', 'references', 'bibliography', 'citations',
    'double-spaced', 'word count', 'page count', 'data analysis', 'charts', 'appendix'
  ];
  const d = description.toLowerCase();
  return checks.filter(c => d.includes(c.toLowerCase()));
};

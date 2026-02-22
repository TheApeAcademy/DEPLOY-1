// Calls calculate-price Edge Function — real server-side pricing logic
// Progress UI is real (it shows actual steps), pricing is real (from DB rules)
import type { AIAnalysis, Assignment } from '@/types';
import { updateAssignmentStatus, logActivity } from '@/services/database';
import { calculatePrice } from '@/services/payment';

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

    // Progress step 1: Receiving details
    onProgress?.(20);
    await new Promise(r => setTimeout(r, 500));

    // Progress step 2: Evaluating complexity
    onProgress?.(50);

    // Call Edge Function for real price calculation
    const priceResult = await calculatePrice({
      assignmentType: assignment.assignmentType,
      description: assignment.description,
      dueDate: assignment.dueDate,
      schoolLevel: undefined,
    });

    // Progress step 3: Calculating cost
    onProgress?.(80);
    await new Promise(r => setTimeout(r, 300));

    if (!priceResult) {
      await updateAssignmentStatus(assignment.id, { status: 'pending' });
      return { success: false, error: 'Could not calculate price — check Edge Function deployment' };
    }

    onProgress?.(100);

    const requirements = extractRequirements(assignment.description);

    const analysis: AIAnalysis = {
      id: `analysis_${Date.now()}`,
      assignmentId: assignment.id,
      status: 'completed',
      progress: 100,
      estimatedCost: priceResult.price,
      currency: priceResult.currency || 'GBP',
      complexity: priceResult.complexity as 'low' | 'medium' | 'high',
      estimatedHours: priceResult.estimatedHours,
      subjectArea: assignment.courseName,
      requirements,
      inScope: priceResult.inScope,
      outOfScopeReason: priceResult.reason,
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
  const checks = ['APA', 'MLA', 'Chicago', 'references', 'bibliography', 'citations',
    'double-spaced', 'word count', 'page count', 'data analysis', 'charts', 'appendix'];
  const d = description.toLowerCase();
  return checks.filter(c => d.includes(c.toLowerCase()));
};

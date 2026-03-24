import type { AIAnalysis, Assignment } from '@/types';
import { updateAssignmentStatus, logActivity } from '@/services/database';

const calculatePriceLocally = (assignment: Assignment) => {
  const type = assignment.assignmentType || 'Other';

  const universityPrices: Record<string, number> = {
    'Short Assignment': 8,
    'Homework': 15,
    'Essay': 30,
    'Lab Report': 35,
    'Presentation': 30,
    'Case Study': 40,
    'Project': 45,
    'Research Paper': 50,
    'Thesis': 90,
    'Dissertation': 130,
    'Other': 25,
  };

  const schoolLevel = (assignment as any).schoolLevel || 'University';
  const isSecondary = ['Primary', 'Middle', 'High'].includes(schoolLevel);
  const basePrice = universityPrices[type] ?? 25;
  const price = isSecondary ? Math.round(basePrice * 0.67) : basePrice;

  const complexity: 'low' | 'medium' | 'high' =
    price <= 15 ? 'low' :
    price <= 35 ? 'medium' : 'high';

  const estimatedHours =
    price <= 15 ? 1 :
    price <= 35 ? 3 :
    price <= 60 ? 5 : 10;

  return { price, complexity, estimatedHours, inScope: true, currency: 'GBP' };
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
      complexity: priceResult.complexity,
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

import type { AIAnalysis, Assignment } from '@/types';
import { updateAssignmentStatus, logActivity } from '@/services/database';

const GULF_COUNTRIES = new Set([
  'UAE', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait', 'Oman',
]);

const BASE_PRICES: Record<string, number> = {
  'Short Assignment': 12,
  'Homework': 22,
  'Essay': 45,
  'Lab Report': 52,
  'Presentation': 45,
  'Case Study': 58,
  'Project': 65,
  'Research Paper': 72,
  'Thesis': 130,
  'Dissertation': 185,
  'Reflection': 30,
  'Literature Review': 52,
  'Business Plan': 58,
  'Annotated Bibliography': 38,
  'Technical Report': 52,
  'Topic Request': 20,
  'Other': 38,
};

export const calculatePrice = (
  type: string,
  level: string,
  country?: string
): { price: number; complexity: 'low' | 'medium' | 'high'; estimatedHours: number } => {
  // Topic Request is always flat £20 regardless of level or country
  if (type === 'Topic Request') {
    return { price: 20, complexity: 'low', estimatedHours: 1 };
  }

  const basePrice = BASE_PRICES[type] ?? 38;

  // Level multiplier
  const isSecondary = ['Primary', 'Middle', 'High'].includes(level);
  const levelMultiplier = isSecondary ? 0.67 : 1.0;

  // Market multiplier
  let marketMultiplier = 1.0;
  if (country) {
    if (GULF_COUNTRIES.has(country)) {
      marketMultiplier = 1.3;
    } else if (country === 'Nigeria') {
      marketMultiplier = 0.6;
    }
  }

  const price = Math.round(basePrice * levelMultiplier * marketMultiplier);

  const complexity: 'low' | 'medium' | 'high' =
    price <= 20 ? 'low' :
    price <= 50 ? 'medium' : 'high';

  const estimatedHours =
    price <= 20 ? 1 :
    price <= 50 ? 3 :
    price <= 80 ? 5 : 10;

  return { price, complexity, estimatedHours };
};

export const analyzeAssignment = async (
  assignment: Assignment,
  onProgress?: (progress: number) => void,
  userCountry?: string
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

    const type = assignment.assignmentType || 'Other';
    const level = (assignment as any).schoolLevel || 'University';
    const priceResult = calculatePrice(type, level, userCountry);

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
  onProgress?: (progress: number) => void,
  userCountry?: string
) => analyzeAssignment(assignment, onProgress, userCountry);

const extractRequirements = (description?: string): string[] => {
  if (!description) return [];
  const checks = [
    'APA', 'MLA', 'Chicago', 'references', 'bibliography', 'citations',
    'double-spaced', 'word count', 'page count', 'data analysis', 'charts', 'appendix'
  ];
  const d = description.toLowerCase();
  return checks.filter(c => d.includes(c.toLowerCase()));
};

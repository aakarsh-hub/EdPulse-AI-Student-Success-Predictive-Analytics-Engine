export enum RiskTier {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Assessment {
  id: string;
  name: string;
  type: 'Assignment' | 'Quiz' | 'Exam' | 'Project';
  score: number;
  maxScore: number;
  topic: string;
  date: string;
}

export interface EngagementMetric {
  lmsLoginFrequency: number; // logins per week
  avgSessionDuration: number; // minutes
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  videoWatchPercentage: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  cohort: string;
  attendanceRate: number; // percentage 0-100
  overallGrade: number; // percentage 0-100
  riskTier: RiskTier;
  riskScore: number; // 0-100 probability
  assessments: Assessment[];
  engagement: EngagementMetric;
  // Fields populated by AI
  aiAnalysis?: AIStudentAnalysis;
}

export interface AIStudentAnalysis {
  riskDrivers: string[];
  weakTopics: Array<{
    topic: string;
    confidence: number;
    reasoning: string;
  }>;
  interventionPlan: {
    type: 'Academic' | 'Behavioral' | 'Administrative';
    description: string;
    resources: string[];
    priority: 'High' | 'Medium' | 'Low';
  }[];
  predictedOutcome: string;
  generatedAt: string;
}

export interface CohortStats {
  totalStudents: number;
  riskDistribution: { [key in RiskTier]: number };
  avgAttendance: number;
  avgGrade: number;
  weakestTopics: string[];
}

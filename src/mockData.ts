import { Notebook, StudentProfile, SmartNote, PracticeQuestion, AnalyticsData, RecentActivityItem, ChatMessage } from './types';

export const initialStudentProfile: StudentProfile | null = null;

export const initialNotebooks: Notebook[] = [];

export const sampleInitialChatMessages: Record<string, ChatMessage[]> = {};

export const sampleSmartNotes: Record<string, SmartNote> = {};

export const sampleQuestions: PracticeQuestion[] = [];

export const sampleRecentActivity: RecentActivityItem[] = [];

export const sampleAnalyticsData: AnalyticsData = {
  totalNotebooks: 0,
  totalDocuments: 0,
  examsCompleted: 0,
  averageScore: 0,
  questionsAnswered: 0,
  studyProgress: 0,
  scoreHistory: [],
  topicAccuracy: [],
  weakTopics: [],
  strongTopics: [],
  studyRecommendation: 'Upload your course PDFs to begin studying and generate practice assessments.',
};

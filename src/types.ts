export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  degree: string;
  semester: string;
  university: string;
}

export type DocumentProcessingStage =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'EXTRACTING'
  | 'OCR'
  | 'CLEANING'
  | 'CHUNKING'
  | 'EMBEDDING'
  | 'INDEXING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ready'
  | 'uploading'
  | 'extracting'
  | 'indexing'
  | 'error';

export interface DocumentMetrics {
  fileSize: number;
  pageCount: number;
  extractionDurationMs: number;
  ocrPagesCount: number;
  extractedChars: number;
  chunkCount: number;
  skippedChunks: number;
  embeddingCount: number;
  indexingDurationMs: number;
  totalDurationMs: number;
}

export interface DocumentItem {
  id: string;
  notebookId: string;
  name: string;
  size: string;
  pages: number;
  uploadDate: string;
  status: DocumentProcessingStage;
  extractedChunksCount: number;
  previewSnippet?: string;
  currentStage?: string;
  progress?: number;
  message?: string;
  error?: string | null;
  metrics?: DocumentMetrics;
}

export interface Notebook {
  id: string;
  title: string;
  code: string;
  description: string;
  iconName: string;
  accentColor: string;
  documentsCount: number;
  progress: number;
  lastStudied: string;
  documents: DocumentItem[];
}

export interface SourceReference {
  docName: string;
  page: number;
  pageEnd?: number;
  section?: string;
  snippet: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  notebookId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sourceReferences?: SourceReference[];
  isGrounded?: boolean;
  retrievalScore?: number;
  insufficientInfo?: boolean;
}

export interface ConceptItem {
  title: string;
  description: string;
}

export interface ImportantPoint {
  point: string;
  category: string;
}

export interface EasyExplanation {
  concept: string;
  analogy: string;
}

export interface ExamFocusTopic {
  topic: string;
  importance: 'Critical' | 'High' | 'Medium';
  tip: string;
}

export interface SmartNote {
  id: string;
  notebookId: string;
  title: string;
  chapterSummary: string;
  importantConcepts: ConceptItem[];
  importantPoints: ImportantPoint[];
  easyExplanation: EasyExplanation[];
  examFocus: ExamFocusTopic[];
  generatedAt: string;
}

export type QuestionType = 'mcq' | 'short' | 'long' | 'viva';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface PracticeQuestion {
  id: string;
  topic: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation: string;
  revealed?: boolean;
}

export interface ExamState {
  examId: string;
  notebookId: string;
  title: string;
  durationSeconds: number;
  timeRemaining: number;
  questions: PracticeQuestion[];
  userAnswers: Record<number, number>;
  flaggedQuestions: Record<number, boolean>;
  status: 'in_progress' | 'completed';
  startTime: string;
}

export interface TopicPerformance {
  topic: string;
  score: number;
  total: number;
  percentage: number;
  status: 'strong' | 'weak' | 'moderate';
}

export interface ExamResult {
  examId: string;
  notebookId: string;
  notebookTitle: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  percentage: number;
  timeTakenSeconds: number;
  topicPerformance: TopicPerformance[];
  strongTopics: string[];
  weakTopics: string[];
  recommendation: string;
  reviewQuestions: {
    question: PracticeQuestion;
    selectedOption?: number;
    isCorrect: boolean;
  }[];
}

export interface RecentActivityItem {
  id: string;
  type: 'exam' | 'note' | 'document' | 'chat';
  title: string;
  subtitle: string;
  timestamp: string;
  score?: string;
  notebookTitle: string;
}

export interface AnalyticsData {
  totalNotebooks: number;
  totalDocuments: number;
  examsCompleted: number;
  averageScore: number;
  questionsAnswered: number;
  studyProgress: number;
  scoreHistory: {
    date: string;
    score: number;
    subject: string;
  }[];
  topicAccuracy: {
    topic: string;
    accuracy: number;
    totalQuestions: number;
  }[];
  weakTopics: {
    topic: string;
    score: number;
    subject: string;
    recommendation: string;
  }[];
  strongTopics: {
    topic: string;
    score: number;
    subject: string;
  }[];
  studyRecommendation: string;
}

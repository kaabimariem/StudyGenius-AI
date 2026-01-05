export interface QcmGenerated {
  id: number;
  courseId: number;
  questions: string; // JSON stringified
  documentSummary: string;
  numberOfQuestions: number;
  createdById?: number;
  createdAt: string;
  course?: {
    id: number;
    title: string;
    code: string;
  };
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}



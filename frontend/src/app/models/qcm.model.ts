export interface QcmQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QcmResponse {
  questions: QcmQuestion[];
  documentSummary: string;
}

export interface GenerateQcmRequest {
  documentText: string;
  numberOfQuestions?: number;
}

export interface QcmAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

export interface QcmResult {
  score: number;
  totalQuestions: number;
  answers: QcmAnswer[];
  questions: QcmQuestion[];
}



export interface QcmQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export class QcmResponseDto {
  questions: QcmQuestion[];
  documentSummary: string;
}



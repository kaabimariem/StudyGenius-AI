export interface AnalyzeTextRequest {
  text: string;
  language?: string;
}

export interface AnalyzeTextResponse {
  summary: string;
  wordCount: number;
  sentences: number;
}



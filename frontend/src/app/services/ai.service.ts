import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyzeTextRequest, AnalyzeTextResponse } from '../models/ai.model';
import { GenerateQcmRequest, QcmResponse } from '../models/qcm.model';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  analyzeText(request: AnalyzeTextRequest): Observable<AnalyzeTextResponse> {
    return this.http.post<AnalyzeTextResponse>(`${this.apiUrl}/ai/analyze-text`, request);
  }

  analyzeDocument(file: File): Observable<AnalyzeTextResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AnalyzeTextResponse>(`${this.apiUrl}/ai/analyze-document`, formData);
  }

  generateQcm(request: GenerateQcmRequest): Observable<QcmResponse> {
    return this.http.post<QcmResponse>(`${this.apiUrl}/ai/generate-qcm`, request);
  }

  generateQcmFromDocument(file: File, numberOfQuestions?: number): Observable<QcmResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (numberOfQuestions) {
      formData.append('numberOfQuestions', numberOfQuestions.toString());
    }
    return this.http.post<QcmResponse>(`${this.apiUrl}/ai/generate-qcm-from-document`, formData);
  }
}


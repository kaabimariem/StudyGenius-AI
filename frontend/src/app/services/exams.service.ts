import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam, CreateExamRequest, SubmitExamRequest } from '../models/exam.model';
import { ExamResult } from '../models/exam-result.model';

@Injectable({
  providedIn: 'root',
})
export class ExamsService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/exams`);
  }

  getById(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/exams/${id}`);
  }

  create(exam: CreateExamRequest): Observable<Exam> {
    return this.http.post<Exam>(`${this.apiUrl}/exams`, exam);
  }

  startExam(id: number): Observable<ExamResult> {
    return this.http.post<ExamResult>(`${this.apiUrl}/exams/${id}/start`, {});
  }

  submitExam(id: number, submitRequest: SubmitExamRequest): Observable<ExamResult> {
    return this.http.post<ExamResult>(`${this.apiUrl}/exams/${id}/submit`, submitRequest);
  }

  getResults(examId: number): Observable<ExamResult[]> {
    return this.http.get<ExamResult[]>(`${this.apiUrl}/exams/${examId}/results`);
  }

  getMyResult(examId: number): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.apiUrl}/exams/${examId}/my-result`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exams/${id}`);
  }
}



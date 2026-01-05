import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAll(courseId?: number): Observable<Document[]> {
    const url = courseId
      ? `${this.apiUrl}/documents?courseId=${courseId}`
      : `${this.apiUrl}/documents`;
    return this.http.get<Document[]>(url);
  }

  upload(file: File, courseId: number): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Document>(`${this.apiUrl}/documents?courseId=${courseId}`, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${id}`, {
      responseType: 'blob',
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${id}`);
  }
}


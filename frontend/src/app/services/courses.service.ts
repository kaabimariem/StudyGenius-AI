import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CreateCourseRequest, UpdateCourseRequest } from '../models/course.model';
import { QcmResponse } from '../models/qcm.model';
import { QcmGenerated } from '../models/qcm-generated.model';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`);
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
  }

  create(course: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, course);
  }

  update(id: number, course: UpdateCourseRequest): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${id}`, course);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/${id}`);
  }

  generateQcm(courseId: number, numberOfQuestions?: number): Observable<QcmResponse> {
    let params = new HttpParams();
    if (numberOfQuestions) {
      params = params.set('numberOfQuestions', numberOfQuestions.toString());
    }
    return this.http.post<QcmResponse>(`${this.apiUrl}/courses/${courseId}/generate-qcm`, {}, { params });
  }

  getQcmsForCourse(courseId: number): Observable<QcmGenerated[]> {
    return this.http.get<QcmGenerated[]>(`${this.apiUrl}/courses/${courseId}/qcms`);
  }

  getQcmById(qcmId: number): Observable<QcmGenerated> {
    return this.http.get<QcmGenerated>(`${this.apiUrl}/courses/qcm/${qcmId}`);
  }
}


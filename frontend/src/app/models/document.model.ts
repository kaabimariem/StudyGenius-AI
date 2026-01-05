import { Course } from './course.model';

export interface Document {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  path: string;
  size: number;
  course?: Course;
  courseId: number;
  createdAt: string;
  updatedAt: string;
}



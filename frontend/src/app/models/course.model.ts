import { User } from './user.model';
import { Document } from './document.model';

export interface Course {
  id: number;
  title: string;
  description: string;
  code: string;
  teacher: User;
  teacherId: number;
  documents?: Document[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  code: string;
  isActive?: boolean;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}



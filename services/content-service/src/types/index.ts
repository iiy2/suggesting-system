import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'moderator';
  };
}

export type ContentType = 'course' | 'article' | 'video' | 'news';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ContentAttributes {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  category?: string;
  tags: string[];
  authorId?: string;
  difficultyLevel?: DifficultyLevel;
  durationMinutes?: number;
  language: string;
  isPublished: boolean;
  publishedAt?: Date;
  viewCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentCreationAttributes extends Omit<ContentAttributes, 'id' | 'viewCount' | 'rating' | 'createdAt' | 'updatedAt'> {}

export interface CreateContentDTO {
  title: string;
  description?: string;
  contentType: ContentType;
  category?: string;
  tags?: string[];
  difficultyLevel?: DifficultyLevel;
  durationMinutes?: number;
  language?: string;
  isPublished?: boolean;
}

export interface UpdateContentDTO {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  difficultyLevel?: DifficultyLevel;
  durationMinutes?: number;
  language?: string;
  isPublished?: boolean;
}

export interface ContentQueryParams {
  page?: number;
  limit?: number;
  contentType?: ContentType;
  category?: string;
  difficulty?: DifficultyLevel;
  language?: string;
  isPublished?: boolean;
  search?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

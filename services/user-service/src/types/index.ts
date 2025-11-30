import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface UserPayload extends JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export type UserRole = 'user' | 'admin' | 'moderator';

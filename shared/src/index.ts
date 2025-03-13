// Common types shared between frontend and backend

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CoachingMoment {
  id: string;
  userId: string;
  videoUrl: string;
  timestamp: number;
  notes?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 
export type Role = 'patient' | 'doctor';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  specialization?: string; // only for doctors
}

export interface HealthMetric {
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  sleep: number;
}

export interface Review {
  id: string;
  text: string;
  rating: number;
  date: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reviews: Review[];
  description: string;
  achievements: string[];
  contribution: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'triage' | 'image' | 'metric';
  title: string;
  description: string;
  imageUrl?: string;
  severity?: 'normal' | 'warning' | 'danger';
}


export type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'dropdown' | 'email' | 'number' | 'yes_no' | 'rating';

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  settings: Record<string, any>;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  public_slug?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  questions: Question[];
  responses_count?: number;
}

export interface FormList {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  public_slug?: string;
  created_at: string;
  updated_at: string;
  responses_count: number;
}

export interface Answer {
  id: string;
  question_id: string;
  value: string;
}

export interface Response {
  id: string;
  form_id: string;
  submitted_at: string;
  answers: Answer[];
}

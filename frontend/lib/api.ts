import axios from 'axios';
import { Form, FormList, Question, Response } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const formsApi = {
  getForms: async (): Promise<FormList[]> => {
    const response = await api.get('/api/forms');
    return response.data;
  },
  
  createForm: async (data: { title: string; description?: string }): Promise<Form> => {
    const response = await api.post('/api/forms', data);
    return response.data;
  },
  
  getForm: async (id: string): Promise<Form> => {
    const response = await api.get(`/api/forms/${id}`);
    return response.data;
  },
  
  updateForm: async (id: string, data: Partial<Form>): Promise<Form> => {
    const response = await api.patch(`/api/forms/${id}`, data);
    return response.data;
  },
  
  deleteForm: async (id: string): Promise<void> => {
    await api.delete(`/api/forms/${id}`);
  },
  
  duplicateForm: async (id: string): Promise<Form> => {
    const response = await api.post(`/api/forms/${id}/duplicate`);
    return response.data;
  },
  
  publishForm: async (id: string): Promise<Form> => {
    const response = await api.post(`/api/forms/${id}/publish`);
    return response.data;
  },
  
  unpublishForm: async (id: string): Promise<Form> => {
    const response = await api.post(`/api/forms/${id}/unpublish`);
    return response.data;
  },

  getStats: async (id: string): Promise<any> => {
    const response = await api.get(`/api/forms/${id}/stats`);
    return response.data;
  }
};

export const questionsApi = {
  getQuestions: async (formId: string): Promise<Question[]> => {
    const response = await api.get(`/api/forms/${formId}/questions`);
    return response.data;
  },
  
  createQuestion: async (formId: string, data: Partial<Question>): Promise<Question> => {
    const response = await api.post(`/api/forms/${formId}/questions`, data);
    return response.data;
  },
  
  updateQuestion: async (id: string, data: Partial<Question>): Promise<Question> => {
    const response = await api.patch(`/api/forms/questions/${id}`, data);
    return response.data;
  },
  
  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/api/forms/questions/${id}`);
  },
  
  reorderQuestions: async (formId: string, items: { id: string; position: number }[]): Promise<void> => {
    await api.post(`/api/forms/${formId}/reorder`, items);
  }
};

export const publicApi = {
  getFormBySlug: async (slug: string): Promise<Form> => {
    const response = await api.get(`/api/public/forms/${slug}`);
    return response.data;
  },
  
  submitResponse: async (slug: string, data: { answers: { question_id: string; value: string }[] }): Promise<Response> => {
    const response = await api.post(`/api/public/forms/${slug}/responses`, data);
    return response.data;
  }
};

export const responsesApi = {
  getResponses: async (formId: string): Promise<Response[]> => {
    const response = await api.get(`/api/forms/${formId}/responses`);
    return response.data;
  },
  getResponse: async (id: string): Promise<Response> => {
    const response = await api.get(`/api/forms/responses/${id}`);
    return response.data;
  }
};

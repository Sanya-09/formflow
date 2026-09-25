'use client';

import { useEffect, useState } from 'react';
import { responsesApi, formsApi } from '@/lib/api';
import { Response, Form } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, CheckCircle2, XCircle, Star } from 'lucide-react';
import Link from 'next/link';

export default function IndividualResponsePage() {
  const params = useParams();
  const router = useRouter();
  const responseId = params.responseId as string;
  
  const [response, setResponse] = useState<Response | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [responseId]);

  const loadData = async () => {
    try {
      const respData = await responsesApi.getResponse(responseId);
      setResponse(respData);
      
      const formData = await formsApi.getForm(respData.form_id);
      formData.questions.sort((a, b) => a.position - b.position);
      setForm(formData);
    } catch (error) {
      console.error("Failed to load response", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
       <div className="w-8 h-8 border-4 border-purple-lavender border-t-primary rounded-full animate-spin"></div>
    </div>
  );
  
  if (!response || !form) return <div className="p-8 text-center text-text-secondary">Response not found.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/dashboard/forms/${form.id}/responses`} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-soft bg-card-bg hover:bg-card-elevated text-text-secondary hover:text-text-primary transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Response #{response.id.substring(0, 8)}</h1>
          <p className="text-sm text-text-secondary flex items-center gap-2 mt-1">
            <FileText className="w-4 h-4" /> {form.title}
          </p>
        </div>
      </div>

      <div className="bg-card-bg rounded-2xl border border-border-soft shadow-sm overflow-hidden">
        {/* Top Info */}
        <div className="bg-purple-light/40 p-6 border-b border-border-soft flex items-center gap-3">
           <Calendar className="w-5 h-5 text-primary" />
           <span className="text-text-primary font-medium">Submitted:</span>
           <span className="text-text-secondary">{new Date(response.submitted_at).toLocaleString(undefined, {
             weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
           })}</span>
        </div>

        {/* Answers List */}
        <div className="p-6 md:p-8 space-y-10">
          {form.questions.map((q, idx) => {
            const answer = response.answers.find(a => a.question_id === q.id);
            const value = answer?.value;
            
            let displayValue: React.ReactNode = <span className="italic text-text-muted">Skipped</span>;
            
            if (value !== undefined && value !== null && value !== '') {
              if (q.type === 'yes_no') {
                displayValue = (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                    value === 'Yes' 
                      ? 'bg-success-bg text-success border border-success/30' 
                      : 'bg-destructive-bg text-destructive border border-destructive/30'
                  }`}>
                    {value === 'Yes' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {value}
                  </span>
                );
              } else if (q.type === 'rating') {
                const max = q.settings?.max || 5;
                const rating = parseInt(value);
                displayValue = (
                  <div className="flex gap-1 items-center">
                    {Array.from({ length: max }).map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < rating ? 'text-primary fill-primary' : 'text-border-strong'}`} />
                    ))}
                    <span className="ml-2 font-medium text-text-primary text-lg">{rating}/{max}</span>
                  </div>
                );
              } else {
                displayValue = <span className="text-xl text-text-primary font-medium whitespace-pre-wrap">{value}</span>;
              }
            }
            
            return (
              <div key={q.id} className="relative pl-6 sm:pl-8">
                {/* Number indicator */}
                <div className="absolute left-0 top-0.5 text-sm font-semibold text-text-muted">{idx + 1}.</div>
                
                <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">{q.title}</h3>
                <div className="mt-2">
                  {displayValue}
                </div>
                
                {idx < form.questions.length - 1 && (
                  <div className="h-px bg-border-soft mt-10"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

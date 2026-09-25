'use client';

import { useEffect, useState } from 'react';
import { formsApi, questionsApi } from '@/lib/api';
import { Form, Question } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Play, Globe, Check, Settings as SettingsIcon, Layout, Monitor, Smartphone } from 'lucide-react';
import Link from 'next/link';

// Builder components
import Sidebar from '@/components/builder/Sidebar';
import Canvas from '@/components/builder/Canvas';
import SettingsPanel from '@/components/builder/SettingsPanel';

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const data = await formsApi.getForm(formId);
      data.questions.sort((a, b) => a.position - b.position);
      setForm(data);
      if (data.questions.length > 0 && !activeQuestionId) {
        setActiveQuestionId(data.questions[0].id);
      }
    } catch (error) {
      toast.error('Failed to load form');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (type: string) => {
    if (!form) return;
    try {
      const newQuestion = await questionsApi.createQuestion(form.id, {
        type: type as any,
        title: 'New Question',
        position: form.questions.length,
      });
      setForm({
        ...form,
        questions: [...form.questions, newQuestion]
      });
      setActiveQuestionId(newQuestion.id);
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleUpdateQuestion = async (id: string, updates: Partial<Question>) => {
    if (!form) return;
    
    // Optimistic update
    setForm({
      ...form,
      questions: form.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    });

    try {
      await questionsApi.updateQuestion(id, updates);
    } catch (error) {
      toast.error('Failed to save changes');
      loadForm(); // Revert
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!form) return;
    
    setForm({
      ...form,
      questions: form.questions.filter(q => q.id !== id)
    });
    
    if (activeQuestionId === id) {
      setActiveQuestionId(null);
    }

    try {
      await questionsApi.deleteQuestion(id);
    } catch (error) {
      toast.error('Failed to delete question');
      loadForm();
    }
  };

  const handleReorder = async (activeId: string, overId: string) => {
    if (!form) return;
    
    const oldIndex = form.questions.findIndex(q => q.id === activeId);
    const newIndex = form.questions.findIndex(q => q.id === overId);
    
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    
    const newQuestions = [...form.questions];
    const [movedItem] = newQuestions.splice(oldIndex, 1);
    newQuestions.splice(newIndex, 0, movedItem);
    
    const reordered = newQuestions.map((q, index) => ({ ...q, position: index }));
    
    setForm({ ...form, questions: reordered });
    
    try {
      await questionsApi.reorderQuestions(form.id, reordered.map(q => ({ id: q.id, position: q.position })));
    } catch (error) {
      toast.error('Failed to reorder');
      loadForm();
    }
  };

  const handlePublish = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = form.status === 'published' 
        ? await formsApi.unpublishForm(form.id)
        : await formsApi.publishForm(form.id);
      
      // Update form questions order because the response from backend might not include them in correct order if not handled
      updated.questions = form.questions; 
      
      setForm(updated);
      toast.success(updated.status === 'published' ? 'Form published successfully!' : 'Form unpublished');
    } catch (error) {
      toast.error('Failed to change publish status');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <div className="h-screen flex flex-col bg-card-bg">
       <header className="h-14 bg-card-bg border-b border-border-soft px-6 flex items-center justify-between shrink-0"></header>
       <div className="flex-1 flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
       </div>
    </div>
  );

  const activeQuestion = form.questions.find(q => q.id === activeQuestionId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#F9FAFB] overflow-hidden -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Builder Header */}
      <header className="h-16 bg-card-bg border-b border-border-soft px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-light text-text-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
            }}
            onBlur={(e) => {
              formsApi.updateForm(form.id, { title: e.target.value });
            }}
            className="font-semibold text-text-primary bg-transparent border-none focus:ring-2 focus:ring-indigo-100 focus:outline-none placeholder-text-muted rounded px-2 py-1 transition-all"
            placeholder="Form Title"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-purple-light p-1 rounded-lg">
            <button 
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-card-bg shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-secondary'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-card-bg shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-secondary'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 hidden sm:block mx-2"></div>

          {form.status === 'published' && form.public_slug && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/form/${form.public_slug}`);
                toast.success('Link copied to clipboard!');
              }}
              className="text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 bg-purple-light px-3 py-2 rounded-lg transition-colors border border-border-soft"
            >
              <Globe className="w-4 h-4" /> Share
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={saving}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm ${
              form.status === 'published' 
                ? 'bg-card-bg border border-border-soft text-text-secondary hover:bg-card-elevated' 
                : 'bg-inverted-bg text-inverted-text hover:opacity-90'
            }`}
          >
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Builder Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Question Types */}
        <Sidebar onAddQuestion={handleAddQuestion} />

        {/* Center Canvas - Form Preview/Reordering */}
        <div className="flex-1 bg-[#F3F4F6] overflow-hidden flex flex-col relative">
           <Canvas 
            form={form} 
            activeQuestionId={activeQuestionId}
            onSelectQuestion={setActiveQuestionId}
            onDeleteQuestion={handleDeleteQuestion}
            onReorder={handleReorder}
          />
        </div>

        {/* Right Sidebar - Settings */}
        <SettingsPanel 
          question={activeQuestion} 
          onUpdate={handleUpdateQuestion} 
        />
      </div>
    </div>
  );
}

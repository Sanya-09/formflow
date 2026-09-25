'use client';

import { useEffect, useState } from 'react';
import { formsApi, questionsApi } from '@/lib/api';
import { Form, Question } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Play, Globe, Check, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

// Builder components will be imported here
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

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const data = await formsApi.getForm(formId);
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
        type,
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
      setForm(updated);
      toast.success(updated.status === 'published' ? 'Form published!' : 'Form unpublished');
    } catch (error) {
      toast.error('Failed to change publish status');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="h-screen flex items-center justify-center">Loading builder...</div>;

  const activeQuestion = form.questions.find(q => q.id === activeQuestionId);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Builder Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
            }}
            onBlur={(e) => {
              formsApi.updateForm(form.id, { title: e.target.value });
            }}
            className="font-medium text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400"
            placeholder="Form Title"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {form.status === 'published' && form.public_slug && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/form/${form.public_slug}`);
                toast.success('Link copied to clipboard!');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md"
            >
              <Check className="w-4 h-4" /> Copy Link
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={saving}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              form.status === 'published' 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
        <Canvas 
          form={form} 
          activeQuestionId={activeQuestionId}
          onSelectQuestion={setActiveQuestionId}
          onDeleteQuestion={handleDeleteQuestion}
          onReorder={handleReorder}
        />

        {/* Right Sidebar - Settings */}
        <SettingsPanel 
          question={activeQuestion} 
          onUpdate={handleUpdateQuestion} 
        />
      </div>
    </div>
  );
}

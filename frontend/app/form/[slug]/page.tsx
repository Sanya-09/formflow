'use client';

import { useEffect, useState, useRef } from 'react';
import { publicApi } from '@/lib/api';
import { Form, Question } from '@/types';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<Form | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    loadForm();
  }, [slug]);

  // Focus input when question changes
  useEffect(() => {
    if (inputRef.current && !submitted) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIdx, submitted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Only trigger next on enter for certain inputs, or if explicitly handled by input component
        if (form && currentIdx < form.questions.length) {
            const q = form.questions[currentIdx];
            if (q.type !== 'long_text') {
                e.preventDefault();
                handleNext();
            }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, form, answers]);

  const loadForm = async () => {
    try {
      const data = await publicApi.getFormBySlug(slug);
      // Sort questions by position
      data.questions.sort((a, b) => a.position - b.position);
      setForm(data);
    } catch (err) {
      setError('Form not found or not available.');
    } finally {
      setLoading(false);
    }
  };

  const validateCurrent = (): boolean => {
    if (!form) return false;
    const q = form.questions[currentIdx];
    const val = answers[q.id];
    
    if (q.required && (!val || val.trim() === '')) {
      toast.error('This question is required');
      return false;
    }

    if (val && q.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        toast.error('Please enter a valid email');
        return false;
      }
    }

    if (val && q.type === 'number') {
      if (isNaN(Number(val))) {
        toast.error('Please enter a valid number');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrent()) {
      if (form && currentIdx < form.questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    try {
      const payload = {
        answers: Object.entries(answers).map(([qId, val]) => ({
          question_id: qId,
          value: val
        }))
      };
      await publicApi.submitResponse(slug, payload);
      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  if (loading) return <div className="h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  
  if (error || !form) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600">{error || 'Something went wrong.'}</p>
        </div>
      </div>
    );
  }

  if (form.questions.length === 0) {
    return <div className="h-screen bg-gray-50 flex items-center justify-center">This form has no questions yet.</div>;
  }

  if (submitted) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your response has been recorded.</p>
        </motion.div>
      </div>
    );
  }

  const question = form.questions[currentIdx];
  const isLast = currentIdx === form.questions.length - 1;
  const progress = ((currentIdx) / form.questions.length) * 100;

  const handleAnswerChange = (val: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: val }));
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-100 fixed top-0 z-50">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-4xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-indigo-600 font-bold flex items-center gap-1">
                {currentIdx + 1}
                <span className="text-indigo-300">→</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 leading-tight">
                {question.title}
                {question.required && <span className="text-red-500 ml-2">*</span>}
              </h2>
            </div>
            
            {question.description && (
              <p className="text-lg text-gray-500 mb-8 ml-10">
                {question.description}
              </p>
            )}

            <div className="ml-10 mt-8">
              <QuestionInput 
                question={question} 
                value={answers[question.id] || ''} 
                onChange={handleAnswerChange}
                onEnter={handleNext}
                inputRef={inputRef}
              />
            </div>
            
            <div className="ml-10 mt-12">
              <button
                onClick={handleNext}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                {isLast ? 'Submit' : 'OK'} <Check className="w-5 h-5" />
              </button>
              {!isLast && (
                 <p className="text-xs text-gray-400 mt-3 font-medium">press <span className="font-bold text-gray-500">Enter ↵</span></p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          <div className="bg-gray-800 text-white rounded-md flex overflow-hidden shadow-lg">
            <button 
              onClick={handlePrev} 
              disabled={currentIdx === 0}
              className="p-2 hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-700"></div>
            <button 
              onClick={handleNext} 
              className="p-2 hover:bg-gray-700 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionInput({ 
  question, 
  value, 
  onChange,
  onEnter,
  inputRef 
}: { 
  question: Question, 
  value: string, 
  onChange: (v: string) => void,
  onEnter: () => void,
  inputRef: any
}) {
  const commonClasses = "w-full text-xl sm:text-2xl border-b-2 border-indigo-200 focus:border-indigo-600 bg-transparent py-2 outline-none transition-colors placeholder-gray-300 text-gray-900";

  switch (question.type) {
    case 'short_text':
    case 'email':
      return (
        <input
          ref={inputRef}
          type={question.type === 'email' ? 'email' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className={commonClasses}
        />
      );
    
    case 'number':
      return (
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          className={commonClasses}
        />
      );
    
    case 'long_text':
      return (
        <textarea
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={3}
          className={`${commonClasses} resize-none`}
        />
      );
    
    case 'multiple_choice':
    case 'dropdown':
      return (
        <div className="space-y-3">
          {(question.settings.options || []).map((opt: string, idx: number) => {
            const isSelected = value === opt;
            const letter = String.fromCharCode(65 + idx); // A, B, C...
            return (
              <button
                key={idx}
                onClick={() => {
                  onChange(opt);
                  // Optional: Auto advance on selection for multiple choice
                  // setTimeout(onEnter, 300);
                }}
                className={`w-full max-w-md text-left px-4 py-3 rounded-md border-2 transition-all flex items-center gap-4 group ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className={`w-6 h-6 rounded flex items-center justify-center text-sm font-semibold border ${
                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-300 group-hover:bg-gray-100'
                }`}>
                  {letter}
                </span>
                <span className={`text-lg ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      );
    
    case 'yes_no':
      return (
        <div className="flex gap-4">
          {['Yes', 'No'].map(opt => {
            const isSelected = value === opt;
            const letter = opt === 'Yes' ? 'Y' : 'N';
            return (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`flex-1 max-w-[200px] text-center px-4 py-6 rounded-md border-2 transition-all flex flex-col items-center gap-2 group ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                 <span className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold border ${
                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-300 group-hover:bg-gray-100'
                }`}>
                  {letter}
                </span>
                <span className={`text-xl ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      );

    case 'rating':
      const max = question.settings.max || 5;
      return (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: max }).map((_, idx) => {
            const val = (idx + 1).toString();
            const isSelected = value === val;
            return (
              <button
                key={idx}
                onClick={() => onChange(val)}
                className={`w-12 h-14 rounded-md border-2 transition-all flex items-center justify-center text-xl font-medium ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
      );

    default:
      return <div className="text-red-500">Unsupported question type</div>;
  }
}

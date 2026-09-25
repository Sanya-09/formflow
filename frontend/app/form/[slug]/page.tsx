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
  const [direction, setDirection] = useState(1);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    loadForm();
  }, [slug]);

  useEffect(() => {
    if (inputRef.current && !submitted) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 300);
    }
  }, [currentIdx, submitted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
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
      toast.error('This question is required', { position: 'top-center' });
      return false;
    }

    if (val && q.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        toast.error('Please enter a valid email', { position: 'top-center' });
        return false;
      }
    }

    if (val && q.type === 'number') {
      if (isNaN(Number(val))) {
        toast.error('Please enter a valid number', { position: 'top-center' });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrent()) {
      if (form && currentIdx < form.questions.length - 1) {
        setDirection(1);
        setCurrentIdx(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setDirection(-1);
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
      setDirection(1);
      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  const handleAutoAdvance = () => {
    setTimeout(() => {
      handleNext();
    }, 400);
  };

  if (loading) return (
    <div className="h-screen bg-[#FBFBFA] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (error || !form) return (
    <div className="h-screen bg-[#FBFBFA] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600">{error || 'Something went wrong.'}</p>
      </div>
    </div>
  );

  if (form.questions.length === 0) return (
    <div className="h-screen bg-[#FBFBFA] flex items-center justify-center text-gray-500">
      This form has no questions yet.
    </div>
  );

  if (submitted) return (
    <div className="h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="max-w-md w-full"
      >
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Check className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Thank you! 🎉</h1>
        <p className="text-xl text-gray-600 mb-12">Your response has been submitted successfully.</p>
        
        <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
          Powered by 
          <span className="text-gray-900 flex items-center gap-1">
            <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
              <div className="bg-gray-900 rounded-[1px]"></div>
              <div className="bg-gray-900 rounded-[1px] opacity-70"></div>
              <div className="bg-gray-900 rounded-[1px] opacity-40"></div>
              <div className="bg-gray-900 rounded-[1px] opacity-90"></div>
            </div>
            FormFlow
          </span>
        </div>
      </motion.div>
    </div>
  );

  const question = form.questions[currentIdx];
  const isLast = currentIdx === form.questions.length - 1;
  const progress = ((currentIdx) / form.questions.length) * 100;

  const handleAnswerChange = (val: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: val }));
  };

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="h-screen bg-[#FBFBFA] flex flex-col font-sans overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100 fixed top-0 z-50">
        <motion.div 
          className="h-full bg-indigo-600 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-3xl mx-auto w-full relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full pb-32"
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="text-indigo-600 font-bold text-xl sm:text-2xl pt-1 flex items-center gap-2">
                {currentIdx + 1} <ArrowRightIcon className="w-5 h-5 text-indigo-300" />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 leading-tight">
                {question.title}
                {question.required && <span className="text-red-500 ml-2">*</span>}
              </h2>
            </div>
            
            {question.description && (
              <p className="text-lg sm:text-xl text-gray-500 mb-8 sm:ml-[3.25rem]">
                {question.description}
              </p>
            )}

            <div className="mt-8 sm:ml-[3.25rem]">
              <QuestionInput 
                question={question} 
                value={answers[question.id] || ''} 
                onChange={handleAnswerChange}
                onEnter={handleNext}
                inputRef={inputRef}
                autoAdvance={handleAutoAdvance}
              />
            </div>
            
            <div className="mt-10 sm:ml-[3.25rem] flex items-center gap-4">
              <button
                onClick={handleNext}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-95 flex items-center gap-2"
              >
                {isLast ? 'Submit' : 'OK'} <Check className="w-5 h-5" />
              </button>
              {!isLast && (
                 <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
                   press <strong className="text-gray-500">Enter ↵</strong>
                 </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-0 right-0 p-6 flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto bg-gray-900 text-white rounded-lg flex overflow-hidden shadow-xl">
          <button 
            onClick={handlePrev} 
            disabled={currentIdx === 0}
            className="px-3 py-2.5 hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="w-px bg-gray-700"></div>
          <button 
            onClick={handleNext} 
            className="px-3 py-2.5 hover:bg-gray-800 transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

function QuestionInput({ 
  question, 
  value, 
  onChange,
  onEnter,
  inputRef,
  autoAdvance
}: { 
  question: Question, 
  value: string, 
  onChange: (v: string) => void,
  onEnter: () => void,
  inputRef: any,
  autoAdvance: () => void
}) {
  const commonClasses = "w-full text-2xl sm:text-3xl text-indigo-900 border-b-[3px] border-indigo-200 focus:border-indigo-600 bg-transparent py-2 outline-none transition-colors placeholder-indigo-200/50";

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
          className={`${commonClasses} text-xl sm:text-2xl resize-none`}
        />
      );
    
    case 'multiple_choice':
    case 'dropdown':
      return (
        <div className="space-y-3">
          {(question.settings.options || []).map((opt: string, idx: number) => {
            const isSelected = value === opt;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={idx}
                onClick={() => {
                  onChange(opt);
                  autoAdvance();
                }}
                className={`w-full max-w-md text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-5 group ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50 shadow-[0_0_0_1px_rgba(79,70,229,1)]' 
                    : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                }`}
              >
                <span className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold border transition-colors ${
                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 group-hover:border-indigo-400'
                }`}>
                  {letter}
                </span>
                <span className={`text-lg sm:text-xl ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                  {opt}
                </span>
                {isSelected && <Check className="w-5 h-5 text-indigo-600 ml-auto" />}
              </button>
            );
          })}
        </div>
      );
    
    case 'yes_no':
      return (
        <div className="flex gap-4 flex-col sm:flex-row max-w-md">
          {['Yes', 'No'].map(opt => {
            const isSelected = value === opt;
            const letter = opt === 'Yes' ? 'Y' : 'N';
            return (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  autoAdvance();
                }}
                className={`flex-1 text-center px-6 py-8 rounded-xl border-2 transition-all flex flex-col items-center gap-3 group ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50 shadow-[0_0_0_1px_rgba(79,70,229,1)]' 
                    : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                }`}
              >
                 <span className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold border transition-colors ${
                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 group-hover:border-indigo-400'
                }`}>
                  {letter}
                </span>
                <span className={`text-2xl ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
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
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: max }).map((_, idx) => {
            const val = (idx + 1).toString();
            const isSelected = value === val;
            return (
              <button
                key={idx}
                onClick={() => {
                  onChange(val);
                  autoAdvance();
                }}
                className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-2xl font-medium group ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50'
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

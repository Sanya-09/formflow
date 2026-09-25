'use client';

import { Form, Question } from '@/types';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Type, AlignLeft, List, ChevronDown, Mail, Hash, ToggleLeft, Star } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  short_text: Type,
  long_text: AlignLeft,
  multiple_choice: List,
  dropdown: ChevronDown,
  email: Mail,
  number: Hash,
  yes_no: ToggleLeft,
  rating: Star,
};

function SortableQuestion({ 
  question, 
  isActive, 
  onSelect, 
  onDelete,
  index
}: { 
  question: Question; 
  isActive: boolean; 
  onSelect: () => void;
  onDelete: () => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const Icon = ICON_MAP[question.type] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-4 group transition-all cursor-pointer rounded-2xl ${
        isActive 
          ? 'bg-card-bg shadow-[0_0_0_2px_#6C4CF6] ring-4 ring-purple-light' 
          : 'bg-card-bg border border-border-soft hover:border-border-strong hover:shadow-md'
      } ${isDragging ? 'opacity-70 shadow-2xl scale-[1.02]' : ''}`}
      onClick={onSelect}
    >
      <div className="flex p-1">
        {/* Drag Handle Area */}
        <div 
          {...attributes} 
          {...listeners}
          className="w-10 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-page-bg"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-text-secondary/70" />
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-4 pl-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-1">
                  <span className="w-5 h-5 rounded bg-purple-light flex items-center justify-center mr-1">
                    <Icon className="w-3 h-3" />
                  </span>
                  {index + 1}. {question.type.replace('_', ' ')}
                </span>
                {question.required && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                )}
              </div>
              <h4 className={`text-lg font-medium leading-snug ${!question.title ? 'text-text-secondary/70 italic' : 'text-text-primary'}`}>
                {question.title || 'Type your question here...'}
              </h4>
              {question.description && (
                <p className="text-text-secondary text-sm mt-1">{question.description}</p>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-text-secondary/70 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50 mt-4"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Canvas({ 
  form, 
  activeQuestionId, 
  onSelectQuestion, 
  onDeleteQuestion,
  onReorder
}: { 
  form: Form;
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto px-4 py-8 sm:px-8">
      <div className="max-w-2xl mx-auto pb-32">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">{form.title}</h2>
          {form.description && <p className="text-lg text-text-secondary">{form.description}</p>}
        </div>

        {form.questions.length === 0 ? (
          <div className="text-center py-24 bg-card-bg rounded-3xl border-2 border-dashed border-border-soft">
            <div className="w-16 h-16 bg-page-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Type className="w-8 h-8 text-text-secondary/70" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Start building your form</h3>
            <p className="text-text-secondary max-w-sm mx-auto">Add your first question from the left sidebar to get started.</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={form.questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {form.questions.map((question, index) => (
                <SortableQuestion 
                  key={question.id} 
                  question={question} 
                  index={index}
                  isActive={activeQuestionId === question.id}
                  onSelect={() => onSelectQuestion(question.id)}
                  onDelete={() => onDeleteQuestion(question.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

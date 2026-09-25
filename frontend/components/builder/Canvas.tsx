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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Type, AlignLeft, List, CaretDown, Mail, Hash, ToggleLeft, Star } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  short_text: Type,
  long_text: AlignLeft,
  multiple_choice: List,
  dropdown: CaretDown,
  email: Mail,
  number: Hash,
  yes_no: ToggleLeft,
  rating: Star,
};

function SortableQuestion({ 
  question, 
  isActive, 
  onSelect, 
  onDelete 
}: { 
  question: Question; 
  isActive: boolean; 
  onSelect: () => void;
  onDelete: () => void;
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
    zIndex: isDragging ? 10 : 1,
  };

  const Icon = ICON_MAP[question.type] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-3 group rounded-xl border-2 transition-all cursor-pointer ${
        isActive 
          ? 'border-indigo-500 bg-indigo-50/30' 
          : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="p-4 flex items-start gap-3">
        <div 
          {...attributes} 
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-600 uppercase bg-indigo-100 px-2 py-0.5 rounded flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {question.type.replace('_', ' ')}
            </span>
            {question.required && (
              <span className="text-xs text-red-500 font-medium">* Required</span>
            )}
          </div>
          <h4 className="text-gray-900 font-medium truncate">
            {question.title || 'Untitled Question'}
          </h4>
          {question.description && (
            <p className="text-gray-500 text-sm truncate mt-1">{question.description}</p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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
    if (active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  return (
    <div className="flex-1 bg-gray-50/50 overflow-y-auto p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h2>
          {form.description && <p className="text-gray-500">{form.description}</p>}
        </div>

        {form.questions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <h3 className="text-gray-500 mb-2 font-medium">Your form is empty</h3>
            <p className="text-sm text-gray-400">Add a question from the left sidebar to get started.</p>
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
              {form.questions.map((question) => (
                <SortableQuestion 
                  key={question.id} 
                  question={question} 
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

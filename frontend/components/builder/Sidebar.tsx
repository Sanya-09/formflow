'use client';

import { 
  Type, AlignLeft, List, ChevronDown, 
  Mail, Hash, ToggleLeft, Star 
} from 'lucide-react';

const QUESTION_TYPES = [
  { id: 'short_text', label: 'Short Text', icon: Type },
  { id: 'long_text', label: 'Long Text', icon: AlignLeft },
  { id: 'multiple_choice', label: 'Multiple Choice', icon: List },
  { id: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'number', label: 'Number', icon: Hash },
  { id: 'yes_no', label: 'Yes/No', icon: ToggleLeft },
  { id: 'rating', label: 'Rating', icon: Star },
];

export default function Sidebar({ onAddQuestion }: { onAddQuestion: (type: string) => void }) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 shrink-0 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add blocks</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {QUESTION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => onAddQuestion(type.id)}
                className="flex flex-col items-center justify-center p-3 gap-2 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors bg-white group text-gray-700 hover:text-indigo-700"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium text-center leading-tight">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

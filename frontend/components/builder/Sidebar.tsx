'use client';

import { 
  Type, AlignLeft, List, ChevronDown, 
  Mail, Hash, ToggleLeft, Star, Plus
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
    <div className="w-72 bg-card-bg border-r border-border-soft shrink-0 flex flex-col z-10 shadow-sm relative">
      <div className="p-5 border-b border-border-soft flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Blocks</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-text-secondary/70 uppercase tracking-wider mb-3 px-1">Question Types</p>
        <div className="grid grid-cols-2 gap-3">
          {QUESTION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => onAddQuestion(type.id)}
                className="group flex flex-col items-center justify-center p-4 gap-3 rounded-xl border border-border-soft hover:border-primary hover:bg-purple-light hover:shadow-md transition-all bg-card-bg text-text-secondary hover:text-primary-hover relative overflow-hidden"
              >
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Plus className="w-3 h-3 text-primary" />
                </div>
                <div className="w-10 h-10 rounded-full bg-page-bg group-hover:bg-card-bg flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-center leading-tight tracking-wide">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Question } from '@/types';
import { Plus, X, Settings } from 'lucide-react';

export default function SettingsPanel({ 
  question, 
  onUpdate 
}: { 
  question?: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}) {
  if (!question) {
    return (
      <div className="w-80 bg-card-bg border-l border-border-soft shrink-0 flex flex-col h-full z-10 shadow-sm">
        <div className="p-5 border-b border-border-soft">
           <h3 className="font-semibold text-text-primary flex items-center gap-2">
             <Settings className="w-4 h-4 text-text-muted" /> Settings
           </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card-elevated/50">
          <div className="w-16 h-16 bg-card-bg rounded-2xl flex items-center justify-center mb-4 border border-border-soft shadow-sm">
            <Settings className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">No question selected</p>
          <p className="text-sm text-text-muted">Select a question to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleOptionsChange = (index: number, value: string) => {
    const newOptions = [...(question.settings.options || [])];
    newOptions[index] = value;
    onUpdate(question.id, { settings: { ...question.settings, options: newOptions } });
  };

  const addOption = () => {
    const newOptions = [...(question.settings.options || []), `Option ${(question.settings.options?.length || 0) + 1}`];
    onUpdate(question.id, { settings: { ...question.settings, options: newOptions } });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(question.settings.options || [])];
    newOptions.splice(index, 1);
    onUpdate(question.id, { settings: { ...question.settings, options: newOptions } });
  };

  return (
    <div className="w-80 bg-card-bg border-l border-border-soft shrink-0 flex flex-col h-full z-10 shadow-sm relative">
      <div className="p-5 border-b border-border-soft flex items-center justify-between">
        <h3 className="font-semibold text-text-primary flex items-center gap-2">
           <Settings className="w-4 h-4 text-primary" /> Block Settings
        </h3>
        <span className="text-xs font-semibold bg-purple-light text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
          {question.type.replace('_', ' ')}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {/* Basic Settings */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Question Title</label>
            <textarea
              value={question.title}
              onChange={(e) => onUpdate(question.id, { title: e.target.value })}
              rows={3}
              placeholder="E.g. What's your name?"
              className="w-full border border-border-soft rounded-xl shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow resize-none bg-input-bg text-text-primary placeholder-text-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Description (Optional)</label>
            <textarea
              value={question.description || ''}
              onChange={(e) => onUpdate(question.id, { description: e.target.value })}
              rows={2}
              placeholder="Add more context..."
              className="w-full border border-border-soft rounded-xl shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow resize-none bg-input-bg text-text-primary placeholder-text-muted"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border-soft bg-card-elevated shadow-sm">
            <div>
              <label className="text-sm font-semibold text-text-primary block">Required</label>
              <span className="text-xs text-text-muted">Prevent skipping</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={question.required}
                onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border-soft peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-card-bg after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card-bg after:border-border-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Specific Settings */}
        {(question.type === 'multiple_choice' || question.type === 'dropdown') && (
          <div className="pt-6 border-t border-border-soft">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-text-primary">Choices</label>
            </div>
            <div className="space-y-3">
              {(question.settings.options || []).map((opt: string, i: number) => (
                <div key={i} className="flex gap-2 group relative items-center">
                  <div className="w-6 h-8 flex items-center justify-center text-xs font-semibold text-text-muted">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionsChange(i, e.target.value)}
                    className="flex-1 border border-border-soft bg-input-bg text-text-primary rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                  <button 
                    onClick={() => removeOption(i)} 
                    className="p-1.5 text-text-muted hover:text-destructive hover:bg-destructive-bg rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remove choice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full mt-2 py-2.5 border-2 border-dashed border-border-soft rounded-xl text-sm font-medium text-text-secondary hover:border-primary hover:text-primary hover:bg-purple-light transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Choice
              </button>
            </div>
          </div>
        )}

        {question.type === 'rating' && (
          <div className="pt-6 border-t border-border-soft">
            <label className="block text-sm font-semibold text-text-primary mb-2">Scale Range</label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">1 to</span>
              <select
                value={question.settings.max || 5}
                onChange={(e) => onUpdate(question.id, { settings: { ...question.settings, max: parseInt(e.target.value) || 5 } })}
                className="flex-1 border border-border-soft bg-input-bg text-text-primary rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow outline-none cursor-pointer"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n} className="bg-card-bg text-text-primary">{n}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

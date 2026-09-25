'use client';

import { Question } from '@/types';
import { Plus, X } from 'lucide-react';

export default function SettingsPanel({ 
  question, 
  onUpdate 
}: { 
  question?: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}) {
  if (!question) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 shrink-0 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
          <span className="text-gray-400">?</span>
        </div>
        <p className="text-sm text-gray-500">Select a question to edit its settings</p>
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
    <div className="w-80 bg-white border-l border-gray-200 shrink-0 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Question Settings</h3>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdate(question.id, { title: e.target.value })}
            className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            value={question.description || ''}
            onChange={(e) => onUpdate(question.id, { description: e.target.value })}
            rows={2}
            className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Required</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={question.required}
              onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Options for Multiple Choice / Dropdown */}
        {(question.type === 'multiple_choice' || question.type === 'dropdown') && (
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-700 mb-3">Options</label>
            <div className="space-y-2">
              {(question.settings.options || []).map((opt: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionsChange(i, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button onClick={() => removeOption(i)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full py-1.5 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Option
              </button>
            </div>
          </div>
        )}

        {/* Settings for Rating */}
        {question.type === 'rating' && (
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Rating</label>
            <input
              type="number"
              min="1"
              max="10"
              value={question.settings.max || 5}
              onChange={(e) => onUpdate(question.id, { settings: { ...question.settings, max: parseInt(e.target.value) || 5 } })}
              className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

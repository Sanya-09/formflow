'use client';

import { useEffect, useState } from 'react';
import { formsApi } from '@/lib/api';
import { FormList } from '@/types';
import Link from 'next/link';
import { Plus, MoreVertical, Copy, Trash2, LayoutDashboard, Globe, Activity, Eye, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [forms, setForms] = useState<FormList[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadForms = async () => {
    try {
      const data = await formsApi.getForms();
      setForms(data);
    } catch (error) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleCreate = async () => {
    try {
      const newForm = await formsApi.createForm({ title: 'Untitled Form' });
      toast.success('Form created!');
      router.push(`/builder/${newForm.id}`);
    } catch (error) {
      toast.error('Failed to create form');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      await formsApi.deleteForm(id);
      toast.success('Form deleted');
      loadForms();
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await formsApi.duplicateForm(id);
      toast.success('Form duplicated');
      loadForms();
    } catch (error) {
      toast.error('Failed to duplicate form');
    }
  };

  if (loading) return <div className="p-8">Loading forms...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">FormFlow</h1>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Form
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Workspaces</h2>
        
        {forms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-500 mb-4">Create your first form to get started.</p>
            <button
              onClick={handleCreate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-4" title={form.title}>
                      {form.title}
                    </h3>
                    <div className="relative dropdown group/menu">
                      <button className="text-gray-400 hover:text-gray-600" onClick={(e) => e.preventDefault()}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden group-hover/menu:block">
                        <div className="py-1">
                          <button onClick={(e) => handleDuplicate(form.id, e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <Copy className="w-4 h-4" /> Duplicate
                          </button>
                          <button onClick={(e) => handleDelete(form.id, e)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {form.responses_count} responses
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {form.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Updated {new Date(form.updated_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between">
                  <Link href={`/builder/${form.id}`} className="text-indigo-600 font-medium text-sm hover:text-indigo-700 flex items-center gap-1">
                    <Edit2 className="w-4 h-4" /> Edit
                  </Link>
                  <div className="flex gap-3">
                    {form.status === 'published' && form.public_slug && (
                      <Link href={`/form/${form.public_slug}`} target="_blank" className="text-gray-600 hover:text-gray-900">
                        <Globe className="w-4 h-4" />
                      </Link>
                    )}
                    <Link href={`/dashboard/${form.id}/responses`} className="text-gray-600 hover:text-gray-900">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

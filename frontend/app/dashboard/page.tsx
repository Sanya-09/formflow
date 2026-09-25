'use client';

import { useEffect, useState } from 'react';
import { formsApi } from '@/lib/api';
import { FormList } from '@/types';
import Link from 'next/link';
import { Plus, MoreVertical, Copy, Trash2, Edit2, BarChart2, ExternalLink, FileText, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [forms, setForms] = useState<FormList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
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
      toast.success('Form created successfully!');
      router.push(`/dashboard/forms/${newForm.id}/edit`);
    } catch (error) {
      toast.error('Failed to create form');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
    try {
      await formsApi.duplicateForm(id);
      toast.success('Form duplicated');
      loadForms();
    } catch (error) {
      toast.error('Failed to duplicate form');
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-lavender border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            Good afternoon, Creator 👋
          </h1>
          <p className="text-text-muted text-lg">
            Create forms that people actually enjoy completing.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create form
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Your forms</h2>
        
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search forms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border-soft rounded-lg text-sm bg-input-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none pl-10 pr-8 py-2 border border-border-soft rounded-lg text-sm bg-input-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow cursor-pointer"
            >
              <option value="all" className="bg-card-bg text-text-primary">All statuses</option>
              <option value="draft" className="bg-card-bg text-text-primary">Drafts</option>
              <option value="published" className="bg-card-bg text-text-primary">Published</option>
            </select>
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-24 bg-card-bg rounded-2xl border border-dashed border-border-strong">
          <div className="w-16 h-16 bg-card-elevated rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No forms found</h3>
          <p className="text-text-muted mb-6">Create your first form or adjust your filters.</p>
          <button
            onClick={handleCreate}
            className="bg-card-bg border border-border-soft text-text-primary px-5 py-2 rounded-lg font-medium hover:bg-card-elevated transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredForms.map((form) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={form.id} 
                className="bg-card-bg rounded-2xl border border-border-soft overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full"
              >
                <Link href={`/dashboard/forms/${form.id}/edit`} className="flex-1 p-6 flex flex-col cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-light text-primary flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="relative dropdown group/menu" onClick={e => e.preventDefault()}>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card-elevated transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-card-bg rounded-xl shadow-xl border border-border-soft py-1 z-10 hidden group-hover/menu:block">
                        <button onClick={(e) => handleDuplicate(form.id, e)} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-card-elevated flex items-center gap-2">
                          <Copy className="w-4 h-4 text-text-muted" /> Duplicate
                        </button>
                        <button onClick={(e) => handleDelete(form.id, e)} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive-bg flex items-center gap-2">
                          <Trash2 className="w-4 h-4 text-destructive" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-text-primary mb-2 truncate group-hover:text-primary transition-colors">
                    {form.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mt-auto pt-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${
                      form.status === 'published' 
                        ? 'bg-success-bg text-success border border-success/30' 
                        : 'bg-card-elevated text-text-secondary border border-border-soft'
                    }`}>
                      {form.status}
                    </span>
                    <span className="text-sm text-text-muted font-medium flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-border-strong"></div>
                      {form.responses_count} {form.responses_count === 1 ? 'response' : 'responses'}
                    </span>
                  </div>
                </Link>
                
                <div className="border-t border-border-soft p-2 bg-card-elevated/40 flex items-center gap-1">
                  <Link href={`/dashboard/forms/${form.id}/edit`} className="flex-1 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-card-elevated rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit
                  </Link>
                  <Link href={`/dashboard/forms/${form.id}/responses`} className="flex-1 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-card-elevated rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Results
                  </Link>
                  {form.status === 'published' && form.public_slug && (
                    <Link href={`/form/${form.public_slug}`} target="_blank" className="flex-1 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-purple-light rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> View
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

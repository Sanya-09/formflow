'use client';

import { useEffect, useState } from 'react';
import { formsApi, responsesApi } from '@/lib/api';
import { Form, Response } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Activity, BarChart3, List as ListIcon } from 'lucide-react';
import Link from 'next/link';

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'responses'>('summary');

  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    try {
      const [formData, responsesData, statsData] = await Promise.all([
        formsApi.getForm(formId),
        responsesApi.getResponses(formId),
        formsApi.getStats(formId)
      ]);
      formData.questions.sort((a, b) => a.position - b.position);
      setForm(formData);
      setResponses(responsesData);
      setStats(statsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
       <div className="w-8 h-8 border-4 border-purple-lavender border-t-primary rounded-full animate-spin"></div>
    </div>
  );
  
  if (!form) return <div className="p-8 text-center text-text-secondary">Form not found.</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-soft bg-card-bg hover:bg-page-bg text-text-secondary transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{form.title}</h1>
            <p className="text-sm text-text-secondary">Analyze your collected data</p>
          </div>
        </div>
        <div className="flex bg-card-bg rounded-lg p-1 shadow-sm border border-border-soft">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-purple-light text-primary-hover' : 'text-text-secondary hover:text-text-primary hover:bg-page-bg'}`}
          >
            <BarChart3 className="w-4 h-4" /> Summary
          </button>
          <button 
            onClick={() => setActiveTab('responses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'responses' ? 'bg-purple-light text-primary-hover' : 'text-text-secondary hover:text-text-primary hover:bg-page-bg'}`}
          >
            <ListIcon className="w-4 h-4" /> Responses
          </button>
        </div>
      </div>

      {activeTab === 'summary' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card-bg p-6 rounded-2xl border border-border-soft shadow-sm flex items-center gap-5">
              <div className="p-4 bg-purple-light text-primary rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium mb-1">Total Responses</p>
                <p className="text-3xl font-bold text-text-primary">{responses.length}</p>
              </div>
            </div>
            
            <div className="bg-card-bg p-6 rounded-2xl border border-border-soft shadow-sm flex items-center gap-5">
              <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium mb-1">Status</p>
                <p className="text-xl font-bold text-text-primary capitalize">{form.status}</p>
              </div>
            </div>
            
            <div className="bg-card-bg p-6 rounded-2xl border border-border-soft shadow-sm flex items-center gap-5">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium mb-1">Created</p>
                <p className="text-lg font-bold text-text-primary">
                  {new Date(form.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Question Summary */}
          <h2 className="text-xl font-bold text-text-primary pt-4">Question Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {form.questions.map((q, idx) => {
              const qStats = stats?.[q.id];
              return (
                <div key={q.id} className="bg-card-bg p-6 md:p-8 rounded-2xl border border-border-soft shadow-sm">
                  <span className="inline-block px-2.5 py-1 bg-purple-light text-text-secondary text-xs font-semibold uppercase tracking-wider rounded mb-4">
                    {q.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-semibold text-lg text-text-primary mb-6 leading-snug">
                    {idx + 1}. {q.title}
                  </h3>
                  
                  {qStats && qStats.total > 0 ? (
                    <div>
                      {q.type === 'multiple_choice' || q.type === 'dropdown' || q.type === 'yes_no' ? (
                        <div className="space-y-4">
                          {Object.entries(qStats.counts || {}).map(([val, count]: [string, any]) => {
                            const percent = qStats.total > 0 ? Math.round((count / qStats.total) * 100) : 0;
                            return (
                              <div key={val}>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-text-primary font-medium">{val}</span>
                                  <span className="text-text-secondary font-medium">{count} <span className="text-text-muted font-normal">({percent}%)</span></span>
                                </div>
                                <div className="w-full bg-purple-light rounded-full h-2.5 overflow-hidden">
                                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : q.type === 'rating' || q.type === 'number' ? (
                        <div className="flex gap-4">
                          <div className="flex-1 bg-page-bg p-4 rounded-xl text-center border border-border-soft">
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Average</p>
                            <p className="text-3xl font-bold text-primary">
                              {qStats.average?.toFixed(1) || '0'}
                            </p>
                          </div>
                          <div className="flex-1 bg-page-bg p-4 rounded-xl text-center border border-border-soft">
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Min</p>
                            <p className="text-2xl font-semibold text-text-primary">{qStats.min || '0'}</p>
                          </div>
                          <div className="flex-1 bg-page-bg p-4 rounded-xl text-center border border-border-soft">
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Max</p>
                            <p className="text-2xl font-semibold text-text-primary">{qStats.max || '0'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-page-bg rounded-xl p-6 text-center border border-border-soft text-sm text-text-secondary">
                          <span className="font-semibold text-text-primary">{qStats.total}</span> text responses collected.<br/>
                          Switch to the <strong>Responses</strong> tab to read them.
                        </div>
                      )}
                    </div>
                  ) : (
                     <div className="text-center py-8 text-sm text-text-secondary border-2 border-dashed border-border-soft rounded-xl">
                       No data for this question yet.
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
          {responses.length === 0 ? (
            <div className="bg-card-bg p-12 rounded-2xl border border-border-soft text-center shadow-sm">
              <div className="w-16 h-16 bg-page-bg rounded-full flex items-center justify-center mx-auto mb-4">
                 <ListIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">No responses yet</h3>
              <p className="text-text-secondary">Share your form to start collecting data.</p>
            </div>
          ) : (
            <div className="bg-card-bg rounded-2xl border border-border-soft shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-light/50 border-b border-border-soft">
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">Submitted at</th>
                    {form.questions.slice(0, 3).map((q) => (
                      <th key={q.id} className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider max-w-[200px] truncate" title={q.title}>
                        {q.title}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {responses.map((response, idx) => (
                    <tr key={response.id} className="hover:bg-page-bg transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/responses/${response.id}`)}>
                      <td className="px-6 py-4 text-sm font-medium text-text-primary whitespace-nowrap">
                        {responses.length - idx}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                        {new Date(response.submitted_at).toLocaleString()}
                      </td>
                      {form.questions.slice(0, 3).map((q) => {
                        const answer = response.answers.find(a => a.question_id === q.id);
                        return (
                          <td key={q.id} className="px-6 py-4 text-sm text-text-primary truncate max-w-[200px]">
                            {answer?.value || '-'}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-sm text-right">
                        <Link href={`/dashboard/responses/${response.id}`} onClick={(e) => e.stopPropagation()} className="text-primary hover:text-primary-hover font-medium transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

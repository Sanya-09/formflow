'use client';

import { useEffect, useState } from 'react';
import { formsApi, responsesApi } from '@/lib/api';
import { Form, Response } from '@/types';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Activity, BarChart3, List as ListIcon } from 'lucide-react';
import Link from 'next/link';

export default function ResponsesPage() {
  const params = useParams();
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
       <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!form) return <div className="p-8 text-center text-gray-500">Form not found.</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-sm text-gray-500">Analyze your collected data</p>
          </div>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <BarChart3 className="w-4 h-4" /> Summary
          </button>
          <button 
            onClick={() => setActiveTab('responses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'responses' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <ListIcon className="w-4 h-4" /> Responses
          </button>
        </div>
      </div>

      {activeTab === 'summary' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900">{responses.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{form.status}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Created</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(form.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Question Summary */}
          <h2 className="text-xl font-bold text-gray-900 pt-4">Question Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {form.questions.map((q, idx) => {
              const qStats = stats?.[q.id];
              return (
                <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider rounded mb-4">
                    {q.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-semibold text-lg text-gray-900 mb-6 leading-snug">
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
                                  <span className="text-gray-700 font-medium">{val}</span>
                                  <span className="text-gray-500 font-medium">{count} <span className="text-gray-400 font-normal">({percent}%)</span></span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : q.type === 'rating' || q.type === 'number' ? (
                        <div className="flex gap-4">
                          <div className="flex-1 bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Average</p>
                            <p className="text-3xl font-bold text-indigo-600">
                              {qStats.average?.toFixed(1) || '0'}
                            </p>
                          </div>
                          <div className="flex-1 bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Min</p>
                            <p className="text-2xl font-semibold text-gray-700">{qStats.min || '0'}</p>
                          </div>
                          <div className="flex-1 bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Max</p>
                            <p className="text-2xl font-semibold text-gray-700">{qStats.max || '0'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100 text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">{qStats.total}</span> text responses collected.<br/>
                          Switch to the <strong>Responses</strong> tab to read them.
                        </div>
                      )}
                    </div>
                  ) : (
                     <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
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
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ListIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No responses yet</h3>
              <p className="text-gray-500">Share your form to start collecting data.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {responses.map((response, idx) => (
                <div key={response.id} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Submission #{responses.length - idx}</span>
                    <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      {new Date(response.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-6">
                    {form.questions.map((q, qIdx) => {
                      const answer = response.answers.find(a => a.question_id === q.id);
                      return (
                        <div key={q.id} className="flex gap-4">
                          <div className="w-6 text-gray-400 font-medium text-sm mt-0.5">{qIdx + 1}.</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-2">{q.title}</p>
                            <div className="text-base text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 inline-block min-w-[50%]">
                              {answer?.value || <span className="italic text-gray-400">Skipped</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

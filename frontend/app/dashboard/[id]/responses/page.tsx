'use client';

import { useEffect, useState } from 'react';
import { formsApi, responsesApi } from '@/lib/api';
import { Form, Response } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ResponsesPage() {
  const params = useParams();
  const formId = params.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      // sort questions
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

  if (loading) return <div className="p-8">Loading responses...</div>;
  if (!form) return <div className="p-8">Form not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
          <p className="text-sm text-gray-500">Responses & Analytics</p>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{form.status}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Created</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(form.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary / Stats (Left column, 2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Question Summary</h2>
            {form.questions.map((q, idx) => {
              const qStats = stats?.[q.id];
              return (
                <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-900 mb-4">
                    {idx + 1}. {q.title}
                  </h3>
                  
                  {qStats ? (
                    <div>
                      {q.type === 'multiple_choice' || q.type === 'dropdown' || q.type === 'yes_no' ? (
                        <div className="space-y-3">
                          {Object.entries(qStats.counts || {}).map(([val, count]: [string, any]) => {
                            const percent = qStats.total > 0 ? Math.round((count / qStats.total) * 100) : 0;
                            return (
                              <div key={val}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{val}</span>
                                  <span className="text-gray-500 font-medium">{count} ({percent}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                          {(!qStats.counts || Object.keys(qStats.counts).length === 0) && (
                            <p className="text-sm text-gray-500 italic">No data yet.</p>
                          )}
                        </div>
                      ) : q.type === 'rating' || q.type === 'number' ? (
                        <div className="flex gap-8">
                          <div>
                            <p className="text-sm text-gray-500">Average</p>
                            <p className="text-2xl font-bold text-indigo-600">
                              {qStats.average?.toFixed(1) || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Min</p>
                            <p className="text-xl font-medium text-gray-700">{qStats.min || '0'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Max</p>
                            <p className="text-xl font-medium text-gray-700">{qStats.max || '0'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">{qStats.total} responses collected. See individual responses for text.</p>
                      )}
                    </div>
                  ) : (
                     <p className="text-sm text-gray-500 italic">No responses yet.</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Individual Responses (Right column) */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Individual Responses</h2>
            {responses.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500">
                No responses yet.
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response, idx) => (
                  <div key={response.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                      <span className="font-semibold text-gray-700">Response #{responses.length - idx}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(response.submitted_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {form.questions.map((q) => {
                        const answer = response.answers.find(a => a.question_id === q.id);
                        return (
                          <div key={q.id}>
                            <p className="text-xs text-gray-500 font-medium mb-1 truncate" title={q.title}>{q.title}</p>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {answer?.value || <span className="italic text-gray-400">Skipped</span>}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

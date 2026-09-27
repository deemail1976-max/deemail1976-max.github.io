import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import { History, Shield, Clock, Search, Filter } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAuditLogs();
      setLogs(res);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err?.message || 'अडिट लग लोड गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-md font-bold text-blue-900 flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-700" />
          <span>अडिट लग (System Audit Trail)</span>
        </h3>
        <p className="text-xs text-slate-500">
          प्रणालीमा गरिएका सम्पूर्ण खरिद दर्ता, चेकलिस्ट मूल्याङ्कन, कैफियत सिर्जना तथा प्रमाणीकरणको सुरक्षा अभिलेख
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-slate-600 rounded-full" />
            <div className="mt-2 text-xs">अडिट लग लोड हुँदैछ...</div>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-700 text-xs">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            हाल कुनै अडिट लग फेला परेन।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">समय (Timestamp)</th>
                  <th className="py-3 px-4">प्रयोगकर्ता</th>
                  <th className="py-3 px-4">कार्य (Action)</th>
                  <th className="py-3 px-4">निकाय (Entity)</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">IP ठेगाना</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {new Date(log.created_at).toLocaleString('ne-NP')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {log.username || 'System'}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {log.entity_type}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {log.entity_id || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Finding } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  ShieldAlert,
  Building,
  UserCheck,
  Calendar,
  Coins,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Edit,
} from 'lucide-react';

interface FindingsViewProps {
  initialRiskFilter?: string;
  initialSearch?: string;
  onOpenNewFinding: () => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  initialRiskFilter,
  initialSearch,
  onOpenNewFinding,
}) => {
  const { canEditInspection, isAdmin } = useAuth();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [riskFilter, setRiskFilter] = useState(initialRiskFilter || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');

  // Active finding for detail
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const res = await api.getFindings({
        risk_level: riskFilter,
        status: statusFilter,
        search: searchTerm,
      });
      setFindings(res);
    } catch (err) {
      console.error('Failed to load findings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const res = await api.getFindings({
        risk_level: riskFilter,
        status: statusFilter,
        search: searchTerm,
      });
      setFindings(res);
    } catch (err) {
      console.error('Filter findings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('के तपाईं यो कैफियत हटाउन चाहनुहुन्छ?')) return;
    try {
      await api.deleteFinding(id);
      setFindings((prev) => prev.filter((f) => f.id !== id));
      if (activeFinding?.id === id) setActiveFinding(null);
    } catch (err) {
      console.error('Failed to delete finding:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h3 className="text-md font-bold text-blue-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>कैफियत तथा जोखिम अभिलेखीकरण (Findings & Irregularities)</span>
          </h3>
          <p className="text-xs text-slate-500">
            छानविनका क्रममा पहिचान गरिएका कानूनी विचलन, जोखिम तथा वित्तीय अनियमितताहरूको विवरण
          </p>
        </div>

        {canEditInspection && (
          <button
            onClick={onOpenNewFinding}
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नयाँ कैफियत दर्ता गर्नुहोस्</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="कैफियत शीर्षक, कोड, खरिद आयोजना वा कानूनी दफा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-slate-50"
            />
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-slate-50"
            >
              <option value="">सबै जोखिम स्तर (All Risks)</option>
              <option value="अत्यन्त उच्च">अत्यन्त उच्च जोखिम (Critical)</option>
              <option value="उच्च">उच्च जोखिम (High)</option>
              <option value="मध्यम">मध्यम जोखिम (Medium)</option>
              <option value="न्यून">न्यून जोखिम (Low)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-slate-50"
            >
              <option value="">सबै अवस्था (All Status)</option>
              <option value="Open">खुला (Open)</option>
              <option value="Corrective Action Required">सुधार आवश्यक</option>
              <option value="Under Review">समीक्षा भैरहेको (Under Review)</option>
              <option value="Resolved">समाधान भएको (Resolved)</option>
              <option value="Closed">बन्द गरिएको (Closed)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            जम्मा कैफियत: <span className="font-bold text-slate-800">{formatNepaliNumber(findings.length)}</span> वटा
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setRiskFilter('');
                setStatusFilter('');
                loadFindings();
              }}
              className="px-3 py-1 text-slate-600 border border-slate-200 rounded-md font-medium hover:bg-slate-50"
            >
              रिसेट
            </button>
            <button
              onClick={handleFilter}
              className="px-4 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-bold transition"
            >
              फिल्टर गर्नुहोस्
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-red-600 rounded-full" />
            <div className="mt-2 text-xs">कैफियतहरू लोड हुँदैछन्...</div>
          </div>
        ) : findings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            कुनै कैफियत फेला परेन।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">कैफियत कोड</th>
                  <th className="py-3 px-4">कैफियत शीर्षक र विवरण</th>
                  <th className="py-3 px-4">खरिद आयोजना / निकाय</th>
                  <th className="py-3 px-4">कानूनी दफा</th>
                  <th className="py-3 px-4">जोखिम स्तर</th>
                  <th className="py-3 px-4 text-right">आर्थिक दायित्व (रु.)</th>
                  <th className="py-3 px-4">अवस्था</th>
                  <th className="py-3 px-4 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map((f) => {
                  const isHigh = f.risk_level === 'उच्च' || f.risk_level === 'अत्यन्त उच्च';
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-red-700">
                        {f.finding_code}
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 leading-snug">
                          {f.title}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                          {f.description}
                        </p>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {f.procurement_title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {f.office_name}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-blue-700 font-medium max-w-[150px] truncate">
                        {f.legal_reference || '-'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isHigh
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {f.risk_level}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {Number(f.estimated_financial_impact) > 0
                          ? `रु. ${formatNPR(f.estimated_financial_impact)}`
                          : '-'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {f.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                            title="हटाउनुहोस्"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

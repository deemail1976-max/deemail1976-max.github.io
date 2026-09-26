import React, { useState, useEffect } from 'react';
import { Inspection } from '../types';
import { api } from '../services/api';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  FileSpreadsheet,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Building,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface ReportsViewProps {
  onOpenReportPrint: (inspectionId: number) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenReportPrint }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const res = await api.getInspections();
      setInspections(res);
    } catch (err) {
      console.error('Failed to load inspections for report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-md font-bold text-blue-900 flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-700" />
          <span>प्रतिवेदन तथा तथा डाटा एक्पोर्ट (Reports & Data Export)</span>
        </h3>
        <p className="text-xs text-slate-500">
          छानविन प्रतिवेदन, परिपालना स्थिति र एक्सेल/CSV एक्सपोर्ट
        </p>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export 1: Procurements CSV */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              खरिद / आयोजना डाटा एक्सपोर्ट (Procurements CSV)
            </h3>
            <p className="text-xs text-slate-500">
              दर्ता भएका खरिद विवरण, ठेक्का रकम, कार्यालय र विधिको  तालिका
            </p>
          </div>
          <a
            href="/api/reports/export/procurements.csv"
            download
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0 ml-3"
          >
            <Download className="w-4 h-4" />
            <span>CSV डाउनलोड</span>
          </a>
        </div>

        {/* Export 2: Findings CSV */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              कैफियत तथा जोखिम सारांश एक्सपोर्ट (Findings CSV)
            </h3>
            <p className="text-xs text-slate-500">
              पहिचान भएका कैफियत, कानूनी व्यवस्था, सम्भावित आर्थिक विचलन र समयावधिको अभिलेख
            </p>
          </div>
          <a
            href="/api/reports/export/findings.csv"
            download
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0 ml-3"
          >
            <Download className="w-4 h-4" />
            <span>CSV डाउनलोड</span>
          </a>
        </div>
      </div>

      {/* Official Inspection Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-700" />
            <span>छानविन विवरण (Inspection Dossiers)</span>
          </h3>
          <span className="text-xs text-slate-500">
            जम्मा: {formatNepaliNumber(inspections.length)} प्रतिवेदनहरू उपलब्ध
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" />
            <div className="mt-2 text-xs">प्रतिवेदनहरू लोड हुँदैछन्...</div>
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            कुनै निरीक्षण प्रतिवेदन तयार भएको छैन।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">प्रतिवेदन संकेत</th>
                  <th className="py-3 px-4">खरिद / आयोजना तथा शीर्षक</th>
                  <th className="py-3 px-4">सार्वजनिक निकाय</th>
                  <th className="py-3 px-4">निरीक्षण टोली प्रमुख</th>
                  <th className="py-3 px-4 text-center">प्रगति</th>
                  <th className="py-3 px-4 text-center">अवस्था</th>
                  <th className="py-3 px-4 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {insp.inspection_code}
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {insp.procurement_title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {insp.procurement_id_code}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {insp.office_name}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {insp.lead_inspector_name || ''}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {formatNepaliNumber(insp.completion_percentage)}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          insp.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {insp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenReportPrint(insp.id)}
                        className="px-1.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded  text-xs shadow-xs transition flex items-center space-x-1.5 ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>प्रतिवेदन</span>
                      </button>
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

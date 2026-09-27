import React, { useEffect, useState } from 'react';
import { DashboardSummary } from '../types';
import { api } from '../services/api';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  ShieldAlert,
  AlertTriangle,
  FolderGit2,
  CheckCircle,
  Coins,
  TrendingUp,
  FileCheck2,
  Building2,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  X,
  BookOpen,
  EyeOff,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string, filter?: any) => void;
  onOpenNewProcurement: () => void;
  onOpenNewFinding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewProcurement,
  onOpenNewFinding,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  // शून्य कैफियत भएका चरणहरू लुकाउने विकल्प (३४ चरण हुँदा चार्ट छोटो र केन्द्रित बनाउन)
  const [hideEmptyStages, setHideEmptyStages] = useState(false);
  // प्रयोग मार्गदर्शन ब्यानर — प्रयोगकर्ताले बन्द गरेपछि localStorage मा सम्झिन्छ
  const [showGuide, setShowGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nvc_guide_dismissed') !== '1';
    } catch {
      return true;
    }
  });

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      localStorage.setItem('nvc_guide_dismissed', '1');
    } catch {
      // localStorage उपलब्ध नभएमा खासै असर पर्दैन
    }
  };

  const restoreGuide = () => {
    setShowGuide(true);
    try {
      localStorage.removeItem('nvc_guide_dismissed');
    } catch {
      // localStorage उपलब्ध नभएमा खासै असर पर्दैन
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  const { kpis, compliance, risk, stages, provinces, alerts } = data;

  // कैफियत संख्या घट्दो क्रममा क्रमबद्ध — बढी समस्या भएका चरण माथि देखिन्छन्
  const sortedStages = [...stages].sort((a, b) => {
    const diff = (Number(b.findings_count) || 0) - (Number(a.findings_count) || 0);
    return diff !== 0 ? diff : a.stage_number - b.stage_number;
  });
  const zeroStageCount = sortedStages.filter((s) => !(Number(s.findings_count) > 0)).length;
  const visibleStages = hideEmptyStages
    ? sortedStages.filter((s) => Number(s.findings_count) > 0)
    : sortedStages;
  const maxFindings = Math.max(...stages.map((s) => Number(s.findings_count) || 0), 1);

  return (
    <div className="space-y-3">
      {/* Top Banner & Quick Action Header */}
      <div className="bg-white px-4 py-1 rounded-sm border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              राष्ट्रिय सतर्कता केन्द्र
            </span>
           
          </div> */}
          <h3 className="text-md font-bold text-blue-900 mt-1">
            खरिद तथा जोखिम विश्लेषण ड्यासबोर्ड
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            सार्वजनिक खरिद ऐन, २०६३ तथा नियमावली, २०६४ अनुसार {formatNepaliNumber(kpis.total_checklist_stages)} चरणका{' '}
            {formatNepaliNumber(kpis.total_checklist_items)} परिपालनाको अनुगमन
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenNewProcurement}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-blue-800/80 text-white hover:bg-blue-800 text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नयाँ खरिद दर्ता</span>
          </button>
          <button
            onClick={onOpenNewFinding}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-red-800/80 text-white hover:bg-red-800 text-xs font-semibold shadow-xs transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>कैफियत प्रविष्टि</span>
          </button>
        </div>
      </div>

      {/* Usage Guide Banner — नयाँ प्रयोगकर्ताको लागि चरणबद्ध मार्गदर्शन (बन्द गर्न सकिन्छ) */}
      {showGuide && (
        <div className="relative bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 p-2 rounded-md shadow-xs">
          <button
            onClick={dismissGuide}
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/70 transition"
            title="मार्गदर्शन बन्द गर्नुहोस्"
            aria-label="मार्गदर्शन बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start space-x-3 pr-8">
            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-3 h-3 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-blue-900">
                प्रणाली प्रयोग गर्ने सजिलो तरिका ({formatNepaliNumber(kpis.total_checklist_stages)} चरण /{' '}
                {formatNepaliNumber(kpis.total_checklist_items)} बुँदा)
              </h4>
              <ol className="mt-1.5 grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs text-blue-900/90">
                <li>१. खरिद आयोजना दर्ता गर्नुहोस्</li>
                <li>२. निरीक्षण खोली चरणगत चेकलिस्ट बुँदा भर्नुहोस्</li>
                <li>३. कैफियत दर्ता गरी प्रतिवेदन / एक्सपोर्ट गर्नुहोस्</li>
              </ol>
              <div className="mt-2.5 flex flex-wrap gap-20">
                <button
                  onClick={() => onNavigate('procurements')}
                  className="px-6 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold transition"
                >
                  खरिद आयोजना हेर्नुहोस्
                </button>
                <button
                  onClick={() => onNavigate('inspections')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold transition"
                >
                  निरीक्षण शुरु गर्नुहोस्
                </button>
                <button
                  onClick={() => onNavigate('master-checklist')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-blue-300 text-blue-800 rounded-md text-xs font-semibold transition"
                >
                  चेकलिस्ट हेर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!showGuide && (
        <button
          onClick={restoreGuide}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-semibold transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>प्रयोग गर्ने तरीका देखाउनुहोस्</span>
        </button>
      )}

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Procurements */}
        <div
          onClick={() => onNavigate('procurements')}
          className="bg-white p-4 rounded-md border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              कूल खरिद / आयोजना
            </span>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatNepaliNumber(kpis.total_procurements)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center space-x-1">
            <span>सम्झौता रकम:</span>
            <span className="font-semibold text-slate-700">
              रु. {formatNPR(kpis.total_contract_volume)}
            </span>
          </div>
        </div>

        {/* Card 2: Active Inspections */}
        <div
          onClick={() => onNavigate('inspections')}
          className="bg-white p-4 rounded-md border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              चालु विश्लेषणहरू
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatNepaliNumber(kpis.in_progress_inspections)}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium flex items-center space-x-1">
            <span>प्रमाणित: {kpis.verified_inspections}</span>
            <span className="text-slate-400">|</span>
            <span>कूल: {kpis.total_inspections}</span>
          </div>
        </div>

        {/* Card 3: High/Critical Risk Findings */}
        <div
          onClick={() => onNavigate('findings', { risk_level: 'उच्च' })}
          className="bg-white p-4 rounded-md border border-slate-200 hover:border-red-400 hover:shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
              उच्च जोखिम कैफियत
            </span>
            <div className="w-8 h-8 rounded-md bg-red-50 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-700">
            {formatNepaliNumber(kpis.high_critical_findings)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            कूल कैफियत: <span className="font-semibold text-slate-700">{formatNepaliNumber(kpis.total_findings)}</span> (खुला: {formatNepaliNumber(kpis.open_findings)})
          </div>
        </div>

        {/* Card 4: Potential Financial Irregularity */}
        <div
          onClick={() => onNavigate('findings')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
              सम्भावित आर्थिक विचलन
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-amber-700 truncate">
            रु. {formatNPR(kpis.total_financial_impact)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            कैफियतमा औंल्याइएको रकम
          </div>
        </div>
      </div>

      {/* Middle Section: Stage-by-Stage Heatmap & Overall Compliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 34-Stage Procurement Irregularity Distribution */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-start justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {formatNepaliNumber(kpis.total_checklist_stages)} खरिद चरण अनुसार कैफियत (Findings) वितरण
              </h3>
              <p className="text-xs text-slate-500">
                कुन चरणमा सबैभन्दा बढी कानूनी त्रुटि वा अनियमितता भेटियो (कैफियत संख्या घट्दो क्रममा)
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                onClick={() => onNavigate('master-checklist')}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1"
              >
                <span>पूर्ण चेकलिस्ट ({kpis.total_checklist_items} बुँदा)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {zeroStageCount > 0 && (
                <button
                  onClick={() => setHideEmptyStages((v) => !v)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 font-medium flex items-center space-x-1"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>
                    {hideEmptyStages
                      ? `शून्य कैफियतका ${formatNepaliNumber(zeroStageCount)} चरण देखाउनुहोस्`
                      : `शून्य कैफियतका ${formatNepaliNumber(zeroStageCount)} चरण लुकाउनुहोस्`}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {visibleStages.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                हालसम्म कुनै पनि चरणमा कैफियत भेटिएको छैन।
              </div>
            )}
            {visibleStages.map((st) => {
              const findingsCount = Number(st.findings_count) || 0;
              const pct = (findingsCount / maxFindings) * 100;
              const hasImpact = Number(st.financial_impact) > 0;

              return (
                <div key={st.stage_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      चरण {formatNepaliNumber(st.stage_number)}: {st.title_ne}
                      <span className="ml-1.5 text-[10px] font-medium text-slate-400">
                        ({formatNepaliNumber(st.items_count)} बुँदा)
                      </span>
                    </span>
                    <div className="flex items-center space-x-2">
                      {hasImpact && (
                        <span className="text-[11px] font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          रु. {formatNPR(st.financial_impact)}
                        </span>
                      )}
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${findingsCount > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                          }`}
                      >
                        {formatNepaliNumber(findingsCount)} कैफियत
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${findingsCount > 3
                        ? 'bg-red-600'
                        : findingsCount > 0
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                        }`}
                      style={{ width: `${findingsCount > 0 ? Math.max(pct, 8) : 2}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Compliance Status Breakdown & Risk Distribution */}
        <div className="space-y-6">
          {/* Compliance Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              समग्र परिपालन अवस्था
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              निरीक्षण गरिएका चेकलिस्ट बुँदाहरूको स्थिति
            </p>

            <div className="space-y-3">
              {compliance.map((c) => {
                const colors: Record<string, { bg: string; text: string; bar: string }> = {
                  'परिपालन': { bg: 'bg-emerald-50', text: 'text-emerald-800', bar: 'bg-emerald-600' },
                  'आंशिक परिपालन': { bg: 'bg-amber-50', text: 'text-amber-800', bar: 'bg-amber-500' },
                  'परिपालन नभएको': { bg: 'bg-red-50', text: 'text-red-800', bar: 'bg-red-600' },
                  'प्रमाण अपुग': { bg: 'bg-orange-50', text: 'text-orange-800', bar: 'bg-orange-500' },
                  'लागू नहुने': { bg: 'bg-slate-50', text: 'text-slate-700', bar: 'bg-slate-400' },
                };
                const style = colors[c.compliance_status] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-800',
                  bar: 'bg-slate-500',
                };
                return (
                  <div
                    key={c.compliance_status}
                    className={`p-2.5 rounded-lg border border-slate-100 flex items-center justify-between ${style.bg}`}
                  >
                    <span className={`text-xs font-semibold ${style.text}`}>
                      {c.compliance_status}
                    </span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-white shadow-xs">
                      {c.count} वटा
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              जोखिम स्तर विश्लेषण (Risk Matrix)
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {risk.map((r) => {
                const isHigh = r.risk_level === 'उच्च' || r.risk_level === 'अत्यन्त उच्च';
                return (
                  <div
                    key={r.risk_level}
                    className={`p-3 rounded-lg border text-center ${isHigh
                      ? 'border-red-200 bg-red-50/60 text-red-900'
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                      }`}
                  >
                    <div className="text-[11px] font-medium text-slate-500">
                      {r.risk_level} जोखिम
                    </div>
                    <div className="text-xl font-bold mt-1">
                      {r.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Critical Alerts & Findings */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              तत्काल ध्यान दिनुपर्ने कैफियतहरू (Urgent Findings)
            </h3>
            <p className="text-xs text-slate-500">
              उच्च जोखिम तथा ठूलो आर्थिक दायित्व हुनसक्ने कैफियतहरू
            </p>
          </div>
          <button
            onClick={() => onNavigate('findings')}
            className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1"
          >
            <span>सबै कैफियत हेर्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-2.5 px-3">कैफियत कोड</th>
                <th className="py-2.5 px-3">आयोजना / खरिद शीर्षक</th>
                <th className="py-2.5 px-3">सम्बन्धित निकाय</th>
                <th className="py-2.5 px-3">कैफियत विवरण</th>
                <th className="py-2.5 px-3">जोखिम स्तर</th>
                <th className="py-2.5 px-3 text-right">आर्थिक दायित्व (रु.)</th>
                <th className="py-2.5 px-3 text-center">कारबाही</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    हाल कुनै गम्भीर कैफियत फेला परेको छैन।
                  </td>
                </tr>
              ) : (
                alerts.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {al.finding_code}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 max-w-xs truncate">
                      {al.procurement_title}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {al.office_name}
                    </td>
                    <td className="py-3 px-3 text-slate-800 max-w-sm truncate">
                      {al.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                        {al.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      रु. {formatNPR(al.estimated_financial_impact)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onNavigate('findings', { search: al.finding_code })}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        हेर्नुहोस्
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

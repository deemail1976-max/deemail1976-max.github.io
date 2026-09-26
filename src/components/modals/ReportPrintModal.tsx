import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatNepaliNumber, toNepaliDigits } from '../../utils/numberFormat';
import { Printer, X, Download, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: number;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  inspectionId,
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && inspectionId) {
      loadReport();
    }
  }, [isOpen, inspectionId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.getInspectionReport(inspectionId);
      setReport(res);
    } catch (err) {
      console.error('Failed to load report packet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  const formatInspectionDate = () => {
    const currentBsDate = window.NepaliCalendar?.getCurrentDate() || '2083-06-08';
    return toNepaliDigits(currentBsDate);
  };

  const formatNepaliDeadline = (date?: string, preservedBsDate?: string) => {
    if (preservedBsDate) return toNepaliDigits(String(preservedBsDate).slice(0, 10));
    if (!date) return '-';

    const raw = String(date);
    let datePart = raw.slice(0, 10);

    // पुरानो रेकर्डमा मिति ISO timestamp (उदा: 2026-10-08T18:15:00.000Z) को रूपमा आएमा
    // UTC भाग काट्दा एक दिन अघिको मिति देखिन्छ; त्यसैले लोकल क्यालेन्डर मिति लिनुपर्छ।
    if (raw.includes('T')) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        datePart = `${y}-${m}-${d}`;
      }
    }

    const bsDate = window.NepaliCalendar?.convertADtoBS(datePart) || datePart;
    return toNepaliDigits(bsDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print p-4 border-b border-slate-200 bg-blue-800/90 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            <span className="font-bold text-sm">
              निरीक्षण प्रतिवेदन विवरण (Official Inspection Dossier)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-800 hover:bg-green-600 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिन्ट / PDF सेभ गर्नुहोस्</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 overflow-y-auto bg-white text-slate-900 text-xs font-sans print:p-0">
          {loading || !report ? (
            <div className="p-16 text-center text-slate-500">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-700 rounded-full" />
              <div className="mt-2 text-xs">प्रतिवेदन तयार गरिँदैछ...</div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Official Government Memo Header */}
              <div className="relative text-center space-y-1 pb-4 border-b-2 border-red-800">
                <img
                  src="/emblem.webp"
                  alt="नेपालको निशाना छाप"
                  className="absolute left-0 top-0 w-12 h-12 rounded-full object-contain mb-1"
                />
                <div className="text-sm font-bold text-red-900">नेपाल सरकार</div>                
                <h2 className="text-lg font-black text-red-800 tracking-wide uppercase">
                  राष्ट्रिय सतर्कता केन्द्र
                </h2>
                <div className="text-[11px] text-slate-500">
                  सिंहदरबार, काठमाडौं।
                </div>
              </div>

              {/* Memo Meta Bar */}
              <div className="flex justify-between items-center text-xs font-semibold pt-1 border-b border-slate-200 pb-2">
                <div>
                  पत्र संख्या / प्रतिवेदन संकेत: <span className="font-mono text-red-800 font-bold">{report.inspection.inspection_code}</span>
                </div>
                <div>
                  निरीक्षण मिति: <span className="font-mono">{formatInspectionDate()}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="text-center font-bold text-sm text-slate-900 bg-slate-50 py-2 px-4 rounded border border-slate-200">
                विषय: <span className="text-red-900">{report.inspection.procurement_title}</span> को स्थलगत खरिद अनुगमन तथा ३४-चरणीय वैधानिक चेकलिस्ट मूल्याङ्कन प्रतिवेदन।
              </div>

              {/* Section 1: Procurement & Project Details */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  १. खरिद / आयोजना तथा कार्यालयको संक्षिप्त विवरण
                </h3>

                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold w-1/4">सार्वजनिक निकाय:</td>
                      <td className="border border-slate-300 p-2 font-bold w-1/4">{report.inspection.office_name}</td>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold w-1/4">मन्त्रालय / विभाग:</td>
                      <td className="border border-slate-300 p-2 w-1/4">{report.inspection.ministry_name || '-'}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">ठेक्का / खरिद संकेत:</td>
                      <td className="border border-slate-300 p-2 font-mono">{report.inspection.procurement_number}</td>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">खरिद प्रकार र विधि:</td>
                      <td className="border border-slate-300 p-2">{report.inspection.procurement_type} ({report.inspection.procurement_method})</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">लागत अनुमान रकम:</td>
                      <td className="border border-slate-300 p-2 font-mono">रु. {formatNPR(report.inspection.estimated_cost)}</td>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">सम्झौता रकम:</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-red-800">रु. {formatNPR(report.inspection.contract_amount)}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">निर्माण व्यवसायी/आपूर्तिकर्ता:</td>
                      <td className="border border-slate-300 p-2">{report.inspection.contractor_name || '-'}</td>
                      <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">निरीक्षक टोली:</td>
                      <td className="border border-slate-300 p-2">{report.inspection.inspection_team || report.inspection.lead_inspector_name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Compliance Statistics Summary */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  २. चेकलिस्ट अनुसार परिपालना अवस्था (Compliance Summary)
                </h3>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 border border-slate-200 rounded bg-emerald-50">
                    <div className="text-[11px] text-emerald-800 font-semibold">पूर्ण परिपालन</div>
                    <div className="text-base font-bold text-emerald-900">{formatNepaliNumber(report.stats.compliant_count)} वटा</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-amber-50">
                    <div className="text-[11px] text-amber-800 font-semibold">आंशिक परिपालन</div>
                    <div className="text-base font-bold text-amber-900">{formatNepaliNumber(report.stats.partial_count)} वटा</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-red-50">
                    <div className="text-[11px] text-red-800 font-semibold">परिपालन नभएको</div>
                    <div className="text-base font-bold text-red-900">{formatNepaliNumber(report.stats.non_compliant_count)} वटा</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-blue-50">
                    <div className="text-[11px] text-blue-800 font-semibold">प्रगति प्रतिशत</div>
                    <div className="text-base font-bold text-blue-900">{formatNepaliNumber(report.inspection.completion_percentage)}%</div>
                  </div>
                </div>

                {/* Checklist Coverage Note — कुल बुँदा तथा जोखिमको द्रुत सारांश */}
                <div className="text-[11px] text-slate-600 text-center bg-slate-50 border border-slate-200 rounded py-1.5 leading-relaxed">
                  जम्मा चेकलिस्ट बुँदा: <b className="text-slate-900">{formatNepaliNumber(report.stats.total_items)}</b>
                  <span className="text-slate-400"> | </span>
                  परिपालन नभएको तथा प्रमाण अपुग:{' '}
                  <b className="text-red-800">
                    {formatNepaliNumber(Number(report.stats.non_compliant_count) + Number(report.stats.missing_evidence_count))}
                  </b>
                  <span className="text-slate-400"> | </span>
                  उच्च / अति उच्च जोखिम बुँदा: <b className="text-red-800">{formatNepaliNumber(report.stats.high_risk_count)}</b>
                </div>
              </div>

              {/* Section 3: Registered Findings & Legal Breaches */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-red-900 border-b border-red-300 pb-1">
                  ३. स्थलगत निरीक्षणमा पहिचान गरिएका मुख्य कैफियतहरू (Identified Findings)
                </h3>

                {report.findings.length === 0 ? (
                  <div className="p-3 text-center text-slate-500 border border-slate-200 rounded">
                    कुनै गम्भीर कैफियत फेला परेन।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.findings.map((f: any, idx: number) => (
                      <div key={f.id} className="p-3 border border-red-200 rounded-lg bg-red-50/30 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-red-800">
                            ३.{idx + 1} {f.finding_code}: {f.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                            {f.risk_level} जोखिम
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">
                          {f.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-red-100">
                          <div>
                            <span className="font-semibold text-slate-700">कानूनी दफा: </span>
                            <span className="text-blue-800">{f.legal_reference || '-'}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-slate-700">सम्भावित आर्थिक दायित्व: </span>
                            <span className="font-mono font-bold text-red-900">
                              रु. {formatNPR(f.estimated_financial_impact)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Corrective Actions & Deadlines */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  ४. राष्ट्रिय सतर्कता केन्द्रको निर्देशन तथा सुधारात्मक कार्यतालिका
                </h3>

                {report.corrective_actions.length === 0 ? (
                  <div className="p-3 text-center text-slate-500 border border-slate-200 rounded">
                    कुनै सुधारात्मक कार्य तोकिएको छैन।
                  </div>
                ) : (
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-left">
                        <th className="border border-slate-300 p-2">क्र.सं.</th>
                        <th className="border border-slate-300 p-2">तोकिएको सुधारात्मक निर्देशन</th>
                        <th className="border border-slate-300 p-2">जिम्मेवार निकाय/अधिकृत</th>
                        <th className="border border-slate-300 p-2">पालना गर्नुपर्ने म्याद</th>
                        <th className="border border-slate-300 p-2">स्थिति</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.corrective_actions.map((act: any, idx: number) => (
                        <tr key={act.id}>
                          <td className="border border-slate-300 p-2 font-mono text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-2 font-medium">{act.corrective_action_text}</td>
                          <td className="border border-slate-300 p-2">{act.responsible_office || report.inspection.office_name}</td>
                          <td className="border border-slate-300 p-2 font-mono font-bold text-red-800">{formatNepaliDeadline(act.deadline, act.deadline_bs)}</td>
                          <td className="border border-slate-300 p-2">{act.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Section 5: Official Signatures Block */}
              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-1">
                  <div className="border-b border-slate-800 w-44 mx-auto pb-8"></div>
                  <div className="font-bold text-slate-900">{report.inspection.lead_inspector_name || 'ई. साजन लवट'}</div>
                  <div className="text-slate-500 text-[11px]">निरीक्षण टोली प्रमुख</div>
                  <div className="text-slate-400 text-[10px]">राष्ट्रिय सतर्कता केन्द्र</div>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-slate-800 w-44 mx-auto pb-8"></div>
                  <div className="font-bold text-slate-900">ई. प्राविधिक सदस्य</div>
                  <div className="text-slate-500 text-[11px]">प्राविधिक परीक्षण टोली सदस्य</div>
                  <div className="text-slate-400 text-[10px]">राष्ट्रिय सतर्कता केन्द्र</div>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-slate-800 w-44 mx-auto pb-8"></div>
                  <div className="font-bold text-slate-900">ई. सुजन अधिकारी</div>
                  <div className="text-slate-500 text-[11px]">सि.डि.ई. / पुनरावलोकनकर्ता</div>
                  <div className="text-slate-400 text-[10px]">प्राविधिक परीक्षण तथा अनुगमन महाशाखा</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

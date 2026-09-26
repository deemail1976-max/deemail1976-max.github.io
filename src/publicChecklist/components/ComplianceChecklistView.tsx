import React, { useState } from 'react';
import { 
  CheckCircle, 
  HelpCircle, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Filter,
  Building
} from 'lucide-react';
import { COMPLIANCE_CHECKLIST, PROCUREMENT_STAGES } from '../data/procurementData';
import { Language } from '../types/procurement';

type ChecklistStatus = 'verified' | 'partial' | 'failed' | 'unverified' | 'na';

interface ComplianceChecklistViewProps {
  language: Language;
  initialStageFilter?: number | null;
  onPrint: () => void;
}

export const ComplianceChecklistView: React.FC<ComplianceChecklistViewProps> = ({
  language,
  initialStageFilter,
  onPrint
}) => {
  const [selectedStage, setSelectedStage] = useState<number | 'all'>(initialStageFilter || 'all');
  const [filterMandatoryOnly, setFilterMandatoryOnly] = useState(false);
  
  const [statusMap, setStatusMap] = useState<Record<string, ChecklistStatus>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  // Audit Info for print report
  const [reportMeta, setReportMeta] = useState({
    officeName: 'सडक डिभिजन कार्यालय / स्थानीय तह / आयोजना',
    projectName: 'प्रशासनिक भवन तथा पूर्वाधार निर्माण कार्य',
    contractId: 'NVC-NCB-W-2082/83-04',
    fiscalYear: '२०८२/८३',
    procurementOfficer: 'रामप्रसाद शर्मा (खरिद अधिकृत)',
    headOfEntity: 'ई. दिनेश श्रेष्ठ (कार्यालय प्रमुख)'
  });

  const handleToggleStatus = (id: string, status: ChecklistStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: prev[id] === status ? 'unverified' : status
    }));
  };

  const handleNoteChange = (id: string, note: string) => {
    setNotesMap((prev) => ({ ...prev, [id]: note }));
  };

  const handleReset = () => {
    if (window.confirm('के तपाईं सबै चेकलिस्ट पुनः सुरु (Reset) गर्न चाहनुहुन्छ?')) {
      setStatusMap({});
      setNotesMap({});
    }
  };

  const filteredItems = COMPLIANCE_CHECKLIST.filter((item) => {
    if (selectedStage !== 'all' && item.stageId !== selectedStage) return false;
    if (filterMandatoryOnly && !item.isMandatory) return false;
    return true;
  });

  const mandatoryItems = COMPLIANCE_CHECKLIST.filter((item) => item.isMandatory);
  const applicableMandatory = mandatoryItems.filter((item) => statusMap[item.id] !== 'na');
  const verifiedMandatory = applicableMandatory.filter((item) => statusMap[item.id] === 'verified').length;
  const failedMandatory = applicableMandatory.filter((item) => statusMap[item.id] === 'failed').length;
  const partialMandatory = applicableMandatory.filter((item) => statusMap[item.id] === 'partial').length;
  const reviewedMandatory = mandatoryItems.filter((item) => statusMap[item.id] && statusMap[item.id] !== 'unverified').length;
  const totalMandatory = applicableMandatory.length;
  const compliancePercent = totalMandatory > 0 ? Math.round((verifiedMandatory / totalMandatory) * 100) : 0;
  const assessmentStatus = totalMandatory === 0
    ? { label: 'लागू हुने अनिवार्य बुँदा चयन/जाँच बाँकी', color: 'text-slate-700 bg-slate-100 border-slate-300' }
    : failedMandatory > 0
    ? { label: `${failedMandatory} अनिवार्य बुँदामा पालना नभएको`, color: 'text-red-800 bg-red-50 border-red-300' }
    : partialMandatory > 0
    ? { label: `${partialMandatory} अनिवार्य बुँदामा आंशिक पालना`, color: 'text-amber-800 bg-amber-50 border-amber-300' }
    : reviewedMandatory < mandatoryItems.length
    ? { label: 'स्व-मूल्याङ्कन जारी', color: 'text-blue-800 bg-blue-50 border-blue-300' }
    : { label: 'लागू अनिवार्य बुँदामा Pass', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p>यो स्व-मूल्याङ्कन सूची हो; score कानूनी वैधताको प्रमाणपत्र होइन।</p>
      </div>
      {/* Top Banner & Score Header */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex  items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1b64b5] text-white text-xs font-bold px-2 py-0.5 rounded">
              स्व-मूल्याङ्कन
            </span>
            <span className="text-xs text-slate-500 font-medium">
              राष्ट्रिय सतर्कता केन्द्रको प्राविधिक परीक्षण अपरिपालना तथा बेरुजु रोकथाम सहयोगी
            </span>
          </div>
          <h3 className="text-md sm:text-lg font-black text-[#185294] mt-1">
            {language === 'ne' ? 'सार्वजनिक निकायका लागि खरिद विधि परिपालना चेकलिस्ट' : 'Public Procurement Vigilance Compliance Checklist'}
          </h3>
          {/* <p className="text-slate-600 text-sm mt-0.5">
            {language === 'ne'
              ? 'खरिद प्रक्रियाका हरेक चरणमा कानुनी त्रुटि, अनियमितता र बेरुजु रोकथामका लागि प्रमाणित गर्ने प्रणाली।'
              : 'Official vigilance compliance checklist system to prevent procurement anomalies, legal lapses, and audit queries.'}
          </p> */}
        </div>

        {/* Live Scorecard */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-xl font-black text-[#1b64b5]">
              {compliancePercent}%
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              Pass / लागू अनिवार्य ({verifiedMandatory}/{totalMandatory})
            </div>
          </div>
          <div className="border-l pl-4 border-slate-200">
            <span className={`text-xs font-bold px-2.5 py-1 rounded border inline-block ${assessmentStatus.color}`}>
              {assessmentStatus.label}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              N/A हटाई Pass / लागू अनिवार्य बुँदा
            </div>
          </div>
        </div>
      </div>

      {/* Audit Meta Information */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-1 no-print">
        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#1b64b5]" />
            <span>सम्बन्धित सार्वजनिक निकाय तथा आयोजना विवरण (फाइल तथा अनुगमन रिपोर्ट प्रयोजन)</span>
          </h4>
          <span className="text-[11px] text-slate-400">रिपोर्टमा स्वतः समावेश हुन्छ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">सार्वजनिक निकायको नाम:</label>
            <input
              type="text"
              value={reportMeta.officeName}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setReportMeta({ ...reportMeta, officeName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">आयोजना / खरिद कार्यको नाम:</label>
            <input
              type="text"
              value={reportMeta.projectName}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setReportMeta({ ...reportMeta, projectName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">ठेक्का/बोलपत्र संकेत नं (IFB No):</label>
            <input
              type="text"
              value={reportMeta.contractId}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setReportMeta({ ...reportMeta, contractId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-mono font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filter and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 no-print">
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">चरण छान्नुहोस्:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">सबै चरणहरू (१ देखि {PROCUREMENT_STAGES.length})</option>
              {PROCUREMENT_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  चरण {s.id}: {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                </option>
              ))}
            </select>
          </div>

          {/* Mandatory Checkbox */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={filterMandatoryOnly}
              onChange={(e) => setFilterMandatoryOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>अनिवार्य (Mandatory) मात्र हेर्ने</span>
          </label>
        </div>

        {/* Print & Reset Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="चेकलिस्ट रिसेट गर्नुहोस्"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>रिसेट</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold bg-[#1b64b5] hover:bg-[#155294] text-white shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>खरिद विधि परिपालना रिपोर्ट प्रिन्ट गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Checklist Items Table / Cards */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => {
          const status = statusMap[item.id] || 'unverified';
          const isVerified = status === 'verified';
          const isPartial = status === 'partial';
          const isFailed = status === 'failed';
          const isNA = status === 'na';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition ${
                isVerified
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : isPartial
                  ? 'border-amber-300 bg-amber-50/50'
                  : isFailed
                  ? 'border-red-300 bg-red-50/50'
                  : isNA
                  ? 'border-slate-300 bg-slate-100/60 opacity-75'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                {/* Left: Item Detail */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                      चरण {item.stageId} • {item.category}
                    </span>
                    {item.isMandatory && (
                      <span className="text-[10px] font-black bg-blue-50 text-[#185294] border border-blue-300 px-1.5 py-0.2 rounded uppercase">
                        अनिवार्य (Mandatory)
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.legalRef}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {index + 1}. {language === 'ne' ? item.question : item.questionEn}
                  </p>

                  <p className="text-xs text-slate-500 italic">
                    💡 {item.helpText}
                  </p>

                  {/* Notes input */}
                  <div className="pt-1.5">
                    <input
                      type="text"
                      placeholder="फाइल प्रमाण / निर्णय नम्बर / प्राविधिक टिप्पणी लेख्नुहोस्..."
                      value={notesMap[item.id] || ''}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Right: Verification Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 no-print self-end md:self-center">
                  <button
                    onClick={() => handleToggleStatus(item.id, 'verified')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${
                      isVerified
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>पालना भएको (Pass)</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(item.id, 'partial')}
                    aria-pressed={isPartial}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer border ${
                      isPartial
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    आंशिक (Partial)
                  </button>

                  <button
                    onClick={() => handleToggleStatus(item.id, 'failed')}
                    aria-pressed={isFailed}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer border ${
                      isFailed
                        ? 'bg-red-700 text-white border-red-800'
                        : 'bg-white hover:bg-red-50 text-red-800 border-red-300'
                    }`}
                  >
                    पालना नभएको (Fail)
                  </button>

                  <button
                    onClick={() => handleToggleStatus(item.id, 'na')}
                    aria-pressed={isNA}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer border ${
                      isNA
                        ? 'bg-slate-700 text-white border-slate-800'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    लागू नहुने (N/A)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print summary */}
      <div className="bg-white p-6 rounded-lg border-2 border-slate-300 shadow-xs space-y-4 print-only">
        <div className="text-center border-b pb-4 border-slate-300">
          <div className="text-xs font-bold text-slate-600">नेपाल सरकार</div>
          {/* <div className="text-base font-extrabold text-[#185294]">राष्ट्रिय सतर्कता केन्द्र</div> */}
          <div className="text-sm font-bold text-slate-800">{reportMeta.officeName}</div>
          <div className="text-xs font-semibold text-blue-900 mt-1">
            खरिद प्रक्रिया स्व-मूल्याङ्कन प्रतिवेदन
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            आयोजना: {reportMeta.projectName} | ठेक्का नं: {reportMeta.contractId} | आ.व.: {reportMeta.fiscalYear}
          </div>
        </div>

        <div className="text-xs text-slate-700 space-y-2">
          <p>
            यो स्व-मूल्याङ्कनमा {mandatoryItems.length} अनिवार्य बुँदामध्ये {mandatoryItems.length - totalMandatory} लागू नहुने भनी चिन्हित छन्। लागू {totalMandatory} बुँदामध्ये {verifiedMandatory} Pass, {partialMandatory} आंशिक र {failedMandatory} Fail छन्। विषयगत टिप्पणी प्रतिवेदनमा समावेश गरिएको छ।
          </p>
          <div className="font-bold text-slate-900">
            स्व-मूल्याङ्कन pass अनुपात: {assessmentStatus.label} ({compliancePercent}%)
          </div>
        </div>

        {/* Official Signatures */}
        <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs text-slate-800">
          <div className="border-t border-slate-400 pt-2">
            <div className="font-bold">{reportMeta.procurementOfficer}</div>
            <div className="text-slate-500">परीक्षण गर्ने</div>
            <div className="text-[10px] text-slate-400 mt-1">मिति: ........................</div>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <div className="font-bold">लेखा अधिकृत / इन्जिनियर</div>
            <div className="text-slate-500">रुजु गर्ने</div>
            <div className="text-[10px] text-slate-400 mt-1">मिति: ........................</div>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <div className="font-bold">{reportMeta.headOfEntity}</div>
            <div className="text-slate-500">प्रमाणित गर्ने</div>
            <div className="text-[10px] text-slate-400 mt-1">मिति: ........................</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Clock, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { PROCUREMENT_STAGES } from '../data/procurementData';
import type { ProcurementGuideDecision, ProcurementGuideOpinion } from '../data/procurementGuide';
import { Language } from '../types/procurement';
import { api } from '../../services/api';
import type { ChecklistItem } from '../../types';

const PROCUREMENT_GUIDE_STAGE_IDS = ['plan', 'est', 'doc', 'call', 'sub', 'eval', 'intent', 'con', 'spec', 'cons'];

interface ProcurementStagesViewProps {
  language: Language;
  selectedStageId: number;
  onSelectStage: (stageId: number) => void;
  onOpenChecklistForStage: (stageId: number) => void;
}

export const ProcurementStagesView: React.FC<ProcurementStagesViewProps> = ({
  language,
  selectedStageId,
  onSelectStage,
  onOpenChecklistForStage,
}) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(true);
  const [checklistLoadError, setChecklistLoadError] = useState('');
  const [guideSearch, setGuideSearch] = useState('');
  const [guideOpinions, setGuideOpinions] = useState<ProcurementGuideOpinion[]>([]);
  const [guideDecisions, setGuideDecisions] = useState<ProcurementGuideDecision[]>([]);
  const [isLoadingGuide, setIsLoadingGuide] = useState(true);
  const [guideLoadError, setGuideLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getProcurementChecklistItems()
      .then((items) => {
        if (!isMounted) return;
        setChecklistItems(items.filter((item) => item.is_active));
      })
      .catch((error) => {
        console.error('Failed to load procurement stage checklist:', error);
        if (isMounted) setChecklistLoadError(error instanceof Error ? error.message : 'चेकलिस्ट लोड हुन सकेन।');
      })
      .finally(() => {
        if (isMounted) setIsLoadingChecklist(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    import('../data/procurementGuide')
      .then(({ PROCUREMENT_GUIDE_DECISIONS, PROCUREMENT_GUIDE_OPINIONS }) => {
        if (!isMounted) return;
        setGuideOpinions(PROCUREMENT_GUIDE_OPINIONS);
        setGuideDecisions(PROCUREMENT_GUIDE_DECISIONS);
      })
      .catch((error) => {
        console.error('Failed to load procurement guidance records:', error);
        if (isMounted) setGuideLoadError('राय/निर्णय सामग्री लोड हुन सकेन।');
      })
      .finally(() => {
        if (isMounted) setIsLoadingGuide(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stages = PROCUREMENT_STAGES;
  const currentStage = PROCUREMENT_STAGES.find((stage) => stage.id === selectedStageId) || PROCUREMENT_STAGES[0];
  const activeTitle = currentStage.title;
  const activeDescription = currentStage.shortDesc;
  const stageItems = checklistItems.filter((item) => item.stage_number === selectedStageId);
  const guideStageId = PROCUREMENT_GUIDE_STAGE_IDS[selectedStageId - 1];
  const stageOpinions = guideOpinions.filter((item) => item.stages.includes(guideStageId));
  const stageDecisions = guideDecisions.filter((item) => item.stages.includes(guideStageId));
  const searchText = guideSearch.trim().toLocaleLowerCase();
  const filteredOpinions = stageOpinions.filter((item) =>
    `${item.subject} ${item.opinion} ${item.src} ${item.date}`.toLocaleLowerCase().includes(searchText)
  );
  const filteredDecisions = stageDecisions.filter((item) =>
    `${item.subject} ${item.decision} ${item.type} ${item.act} ${item.rule}`.toLocaleLowerCase().includes(searchText)
  );

  const handlePrev = () => {
    if (selectedStageId > 1) {
      onSelectStage(selectedStageId - 1);
    }
  };

  const handleNext = () => {
    if (selectedStageId < stages.length) {
      onSelectStage(selectedStageId + 1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Banner */}
      {checklistLoadError && (
        <div role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {checklistLoadError} कृपया सर्भर जाँच गरी पेज पुनःलोड गर्नुहोस्।
        </div>
      )}

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1b64b5] text-white text-xs font-bold px-2 py-0.5 rounded">
              {language === 'ne' ? '१० चरणगत प्रक्रिया' : '10-Phase Process'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              सार्वजनिक खरिद ऐन, २०६३ र नियमावली, २०६४ बमोजिम
            </span>
          </div>
          <h3 className="text-md sm:text-md font-black text-[#185294] mt-1">
            {language === 'ne' ? 'चरणगत खरिद कार्यविधि' : 'Step-by-Step Procurement Procedures'}
          </h3>
          <p className="text-slate-600 text-sm mt-0.5">
            {language === 'ne' 
              ? 'खरिद योजनादेखि अन्तिम भुक्तानीसम्म पालना गर्नुपर्ने कानूनी चरणहरू।' 
              : 'End-to-end statutory procurement phases from initial planning to contract closure for all public entities.'}
          </p>
        </div>

        {/* Stepper Quick Summary pill */}
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-right">
          <div className="text-md text-blue-500 font-semibold">हालको चरण</div>
          <div className="text-lg font-black text-[#1b64b5]">
            {selectedStageId} / {stages.length}
          </div>
        </div>
      </div>
{/* 
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        {PROCUREMENT_SOURCE_NOTE}
      </div> */}

      {/* Interactive process stepper */}
      <div className="bg-white p-2 rounded-md border border-slate-200 shadow-xs overflow-x-auto no-print">
        <div className="flex items-center justify-between min-w-[700px] relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
          <div 
            className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-[#1b64b5] -z-0 transition-all duration-300"
            style={{ width: `${((selectedStageId - 1) / Math.max(stages.length - 1, 1)) * 95}%` }}
          />

          {stages.map((stage) => {
            const stageId = stage.id;
            const stageTitle = stage.title;
            const isSelected = stageId === selectedStageId;
            const isCompleted = stageId < selectedStageId;
            return (
              <button
                key={stageId}
                onClick={() => onSelectStage(stageId)}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-transform ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-xs transition-colors border-1 ${
                    isSelected
                      ? 'bg-[#1b64b5] text-white border-amber-300 ring-4 ring-blue-100'
                      : isCompleted
                      ? 'bg-[#185294] text-white border-blue-400'
                      : 'bg-white text-slate-600 border-slate-300 group-hover:border-blue-400'
                  }`}
                >
                  {stageId}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 max-w-[85px] text-center leading-tight truncate ${
                    isSelected ? 'text-[#185294] font-bold' : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {stageTitle.split(' ').slice(0, 2).join(' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Stage Detail Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Stage Header */}
        <div className="bg-linear-to-r from-[#185294] to-[#1b64b5] text-white p-2 sm:p-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-1 py-1 rounded shadow-xs uppercase tracking-wide">
              {currentStage.stageNumber}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenChecklistForStage(selectedStageId)}
                className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold transition shadow-xs cursor-pointer border border-blue-300/40"
              >
                <ShieldCheck className="w-3.5 h-3 text-amber-300" />
                <span>यस चरणको अनुपालन चेकलिस्ट परीक्षण</span>
              </button>
            </div>
          </div>

          <h3 className="text-md sm:text-md font-black mt-1">
            {language === 'ne' ? activeTitle : currentStage.titleEn}
          </h3>
          <p className="text-blue-100 text-sm mt-1 leading-relaxed max-w-3xl">
            {language === 'ne' ? activeDescription : currentStage.shortDescEn}
          </p>

          {/* Quick Legal & Time badges */}
          <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-blue-400/30 text-xs">
            <div className="flex items-center gap-1.5 bg-blue-900/60 px-2.5 py-1 rounded border border-blue-300/30">
              <Scale className="w-4 h-4 text-amber-300 shrink-0" />
              <span><strong>कानूनी आधार:</strong> {currentStage.legalBasis}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-900/60 px-2.5 py-1 rounded border border-blue-300/30">
              <Clock className="w-4 h-4 text-amber-300 shrink-0" />
              <span><strong>तोकिएको म्याद:</strong> {currentStage.timeLimit}</span>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          <section className="md:col-span-2 bg-white p-5 rounded-lg border border-blue-200 shadow-xs space-y-3" aria-labelledby="stage-procedures-title">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-[#1b64b5]" />
              <h4 id="stage-procedures-title" className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'यस चरणमा अपनाउनुपर्ने विस्तृत कार्यविधि' : 'Detailed Procedure for This Stage'}
              </h4>
            </div>
            <ol className="grid gap-3 text-xs sm:text-sm text-slate-700">
              {currentStage.procedures.map((procedure, idx) => (
                <li key={idx} className="flex items-start gap-3 rounded border border-slate-100 bg-slate-50 p-3 leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b64b5] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span>{procedure}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 1. Key Responsibilities */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-[#1b64b5]" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'प्रमुख जिम्मेवारी तथा कार्यहरू' : 'Key Responsibilities'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {currentStage.keyResponsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#1b64b5] font-bold shrink-0 mt-0.5">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Mandatory Documents */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-5 h-5 text-blue-700" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'अनिवार्य कागजात तथा अभिलेखहरू' : 'Mandatory Documents & Records'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {currentStage.mandatoryDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[#1b64b5] font-bold shrink-0">📄</span>
                  <span className="font-medium text-slate-800">{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Checkpoints */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'सतर्कता जाँच बिन्दुहरू (Vigilance Checkpoints)' : 'Compliance Checkpoints'}
              </h4>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              {currentStage.checkpoints.map((chk, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded border border-emerald-200/60 text-emerald-950">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>{chk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Risk & Audit Warning */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'ne' ? 'लेखापरीक्षण/बेरुजु जोखिम र सतर्कता सुझाव' : 'Audit Risk & Vigilance Guidance'}
              </h4>
            </div>
            <div className="bg-amber-50/80 p-3 rounded border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed">
              {currentStage.risksAndMitigation}
            </div>

            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded border border-blue-200 text-xs text-blue-950 mt-2">
              <Lightbulb className="w-4 h-4 text-[#1b64b5] shrink-0 mt-0.5" />
              <div>
                <strong>राष्ट्रिय सतर्कता केन्द्रको निर्देशन:</strong> {currentStage.officialAdvice}
              </div>
              </div>
            </div>
        </div>

        <div className="space-y-4 bg-slate-50/50 p-4 sm:p-6">
            <p className="text-sm text-slate-700">{activeDescription}</p>
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900 text-sm">यस चरणका जाँच बुँदाहरू</h4>
                <span className="text-xs text-slate-500">
                  {isLoadingChecklist ? 'लोड हुँदैछ...' : `${stageItems.length} बुँदा`}
                </span>
              </div>
              {isLoadingChecklist ? (
                <p className="text-sm text-slate-500">जाँच बुँदाहरू लोड हुँदैछन्...</p>
              ) : stageItems.length ? (
                <div className="space-y-2">
                  {stageItems.map((item) => (
                    <article key={item.id} className="rounded border border-emerald-200/70 bg-white p-3">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-mono font-bold text-emerald-800">{item.checklist_code}</span>
                        <span className="text-slate-500">{item.inspection_area}</span>
                        <span className="ml-auto text-slate-500">जोखिम: {item.default_risk_level}</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-slate-900">{item.inspection_question}</p>
                      {item.legal_reference && <p className="mt-1 text-xs text-slate-500">कानूनी आधार: {item.legal_reference}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">यस चरणका लागि सक्रिय जाँच बुँदा भेटिएन।</p>
              )}
            </section>
        </div>

        <section className="border-t border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="stage-guidance-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h4 id="stage-guidance-title" className="font-bold text-[#185294] text-base">
                  {language === 'ne' ? 'यस चरणका द्विविधा, PPMO राय र PPRC निर्णय' : 'Stage Questions, PPMO Opinions and PPRC Decisions'}
              </h4>
              <p className="mt-1 text-xs text-slate-600">
                  {isLoadingGuide
                    ? 'राय र निर्णय सामग्री लोड हुँदैछ...'
                    : language === 'ne'
                    ? `${stageOpinions.length} राय परामर्श र ${stageDecisions.length} पुनरावलोकन निर्णय यस चरणसँग सम्भावित रूपमा सम्बन्धित छन्।`
                    : `${stageOpinions.length} opinions and ${stageDecisions.length} review decisions are potentially related to this stage.`}
              </p>
            </div>
            <label className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={guideSearch}
                onChange={(event) => setGuideSearch(event.target.value)}
                placeholder={language === 'ne' ? 'द्विविधा, राय वा निर्णय खोज्नुहोस्' : 'Search questions, opinions or decisions'}
                aria-label={language === 'ne' ? 'यस चरणका राय र निर्णय खोज्नुहोस्' : 'Search this stage opinions and decisions'}
                className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#1b64b5] focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <p className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-950">
              {language === 'ne'
                ? 'विषयसँग मिल्ने अभिलेखहरूलाई शब्दावलीका आधारमा चरणमा वर्गीकृत गरिएको हो; पुराना अभिलेखको पाठमा रूपान्तरण त्रुटि हुन सक्छ। निर्णयअघि मूल राय/निर्णय, हाल लागू ऐन-नियम र बोलपत्र कागजातसँग रुजु गर्नुहोस्।'
                : 'Records are assigned to stages by keyword matching, and older records may contain transcription errors. Verify the original opinion or decision, current law and the solicitation before deciding.'}
          </p>

            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <section aria-labelledby="ppmo-opinions-title">
                <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2">
                  <h5 id="ppmo-opinions-title" className="font-bold text-slate-900 text-sm">PPMO का राय परामर्श</h5>
                  <span className="text-xs text-slate-500">{filteredOpinions.length} भेटिए</span>
                </div>
                <div className="space-y-2">
                  {isLoadingGuide && <p className="text-sm text-slate-500">राय सामग्री लोड हुँदैछ...</p>}
                  {filteredOpinions.length ? filteredOpinions.slice(0, 20).map((item, index) => (
                    <article key={`opinion-${item.no}-${index}`} className="rounded border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-semibold leading-relaxed text-slate-900">{item.subject}</p>
                      <details className="mt-2">
                        <summary className="text-xs font-semibold text-[#185294]">राय परामर्शको व्यहोरा</summary>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{item.opinion}</p>
                      </details>
                      <p className="mt-2 text-[11px] text-slate-500">{item.src}{item.date ? ` · मिति ${item.date}` : ''}</p>
                      {item.references.length > 0 && (
                        <p className="mt-1 text-[11px] text-slate-500">स्रोतमा उल्लिखित व्यवस्था: {item.references.slice(0, 8).join(', ')}</p>
                      )}
                    </article>
                  )) : !isLoadingGuide && !guideLoadError ? (
                    <p className="rounded border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-600">यस खोजसँग मिल्ने PPMO राय भेटिएन।</p>
                  ) : null}
                  {filteredOpinions.length > 20 && <p className="text-xs text-slate-500">पहिला २० राय देखाइएका छन्। थप सीमित गर्न खोज प्रयोग गर्नुहोस्।</p>}
                </div>
              </section>

              <section aria-labelledby="pprc-decisions-title">
                <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2">
                  <h5 id="pprc-decisions-title" className="font-bold text-slate-900 text-sm">PPRC का पुनरावलोकन निर्णय</h5>
                  <span className="text-xs text-slate-500">{filteredDecisions.length} भेटिए</span>
                </div>
                <div className="space-y-2">
                  {isLoadingGuide && <p className="text-sm text-slate-500">निर्णय सामग्री लोड हुँदैछ...</p>}
                  {filteredDecisions.length ? filteredDecisions.slice(0, 20).map((item, index) => (
                    <article key={`decision-${item.no}-${index}`} className="rounded border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-semibold text-[#185294]">विवाद नं. {item.no}</span>
                        <span className="rounded bg-white px-2 py-0.5 text-slate-600">{item.type}</span>
                      </div>
                      <p className="text-sm font-semibold leading-relaxed text-slate-900">{item.subject}</p>
                      <details className="mt-2">
                        <summary className="text-xs font-semibold text-[#185294]">आधार र निर्णय हेर्नुहोस्</summary>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{item.decision}</p>
                        <p className="mt-2 text-[11px] text-slate-500">ऐन: {item.act} · नियमावली: {item.rule}</p>
                      </details>
                    </article>
                  )) : !isLoadingGuide && !guideLoadError ? (
                    <p className="rounded border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-600">यस खोजसँग मिल्ने PPRC निर्णय भेटिएन।</p>
                  ) : null}
                  {filteredDecisions.length > 20 && <p className="text-xs text-slate-500">पहिला २० निर्णय देखाइएका छन्। थप सीमित गर्न खोज प्रयोग गर्नुहोस्।</p>}
                </div>
              </section>
          </div>
            {guideLoadError && <p role="alert" className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{guideLoadError}</p>}
        </section>

        {/* Stepper Navigation Controls (Next / Prev) */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            onClick={handlePrev}
            disabled={selectedStageId === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs sm:text-sm font-bold transition ${
              selectedStageId === 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>अघिल्लो चरण</span>
          </button>

          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            चरण {selectedStageId} / {stages.length}: {activeTitle.split(' ')[0]}
          </span>

          <button
            onClick={handleNext}
            disabled={selectedStageId === stages.length}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs sm:text-sm font-bold transition ${
              selectedStageId === stages.length
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#1b64b5] hover:bg-[#155294] text-white shadow-xs cursor-pointer'
            }`}
          >
            <span>पछिल्लो चरण</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

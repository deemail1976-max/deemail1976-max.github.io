import React, { useState, useEffect } from 'react';
import { Procurement, ChecklistItem } from '../../types';
import { api } from '../../services/api';
import { AlertTriangle, X, Check } from 'lucide-react';
import { NepaliDatePicker } from '../NepaliDatePicker';

interface FindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preloadData?: {
    inspection_id?: number;
    procurement_id?: number;
    checklist_item_id?: number;
    title?: string;
    description?: string;
    legal_reference?: string;
    possible_irregularity?: string;
    risk_level?: string;
    estimated_financial_impact?: number;
  } | null;
}

export const FindingModal: React.FC<FindingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preloadData,
}) => {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // Form states
  const [procurementId, setProcurementId] = useState<number | ''>('');
  const [checklistItemId, setChecklistItemId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [legalReference, setLegalReference] = useState('');
  const [possibleIrregularity, setPossibleIrregularity] = useState('');
  const [riskLevel, setRiskLevel] = useState<'न्यून' | 'मध्यम' | 'उच्च' | 'अत्यन्त उच्च'>('उच्च');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [responsibleOffice, setResponsibleOffice] = useState('');
  const [responsibleOfficer, setResponsibleOfficer] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [deadline, setDeadline] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (preloadData) {
        if (preloadData.procurement_id) setProcurementId(preloadData.procurement_id);
        if (preloadData.checklist_item_id) setChecklistItemId(preloadData.checklist_item_id);
        if (preloadData.title) setTitle(preloadData.title);
        if (preloadData.description) setDescription(preloadData.description);
        if (preloadData.legal_reference) setLegalReference(preloadData.legal_reference);
        if (preloadData.possible_irregularity) setPossibleIrregularity(preloadData.possible_irregularity);
        if (preloadData.risk_level) setRiskLevel(preloadData.risk_level as any);
        if (preloadData.estimated_financial_impact) setEstimatedImpact(String(preloadData.estimated_financial_impact));
        // default deadline 15 days ahead
        const d = new Date();
        d.setDate(d.getDate() + 15);
        const localAdDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        setDeadline(window.NepaliCalendar.convertADtoBS(localAdDate));
      }
    }
  }, [isOpen, preloadData]);

  const loadDropdowns = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.getProcurements(),
        api.getMasterChecklists(),
      ]);
      setProcurements(pRes);
      setChecklistItems(cRes);
      if (!preloadData?.procurement_id && pRes.length > 0) {
        setProcurementId(pRes[0].id);
        setResponsibleOffice(pRes[0].office_name || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcurementChange = (pId: number) => {
    setProcurementId(pId);
    const p = procurements.find((x) => x.id === pId);
    if (p) setResponsibleOffice(p.office_name || '');
  };

  const handleChecklistChange = (cId: number) => {
    setChecklistItemId(cId);
    const c = checklistItems.find((x) => x.id === cId);
    if (c) {
      if (!legalReference) setLegalReference(c.legal_reference);
      if (!possibleIrregularity) setPossibleIrregularity(c.possible_irregularity || '');
      if (!title) setTitle(`${c.inspection_area} सम्बन्धी प्रक्रियागत कैफियत`);
      setRiskLevel(c.default_risk_level);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procurementId || !title || !description) {
      setError('कृपया खरिद आयोजना, कैफियत शीर्षक र व्यहोरा भर्नुहोस्।');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.createFinding({
        inspection_id: preloadData?.inspection_id,
        procurement_id: Number(procurementId),
        checklist_item_id: checklistItemId ? Number(checklistItemId) : undefined,
        title,
        description,
        legal_reference: legalReference,
        possible_irregularity: possibleIrregularity,
        risk_level: riskLevel,
        estimated_financial_impact: parseFloat(estimatedImpact) || 0,
        responsible_office: responsibleOffice,
        responsible_officer: responsibleOfficer,
        recommended_corrective_action: recommendedAction,
        deadline: deadline
          ? window.NepaliCalendar.convertBStoAD(deadline)
          : undefined,
        deadline_bs: deadline || undefined,
        status: recommendedAction ? 'Corrective Action Required' : 'Open',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'कैफियत सुरक्षित गर्न सकिएन।');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-red-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-700" />
            <h3 className="text-base font-bold text-slate-900">
              स्थलगत कैफियत तथा जोखिम प्रविष्टि (Register Inspection Finding)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Procurement & Checklist Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                सम्बन्धित खरिद आयोजना (Procurement)*:
              </label>
              <select
                value={procurementId}
                onChange={(e) => handleProcurementChange(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white font-medium"
              >
                {procurements.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.procurement_id_code} - {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                सम्बन्धित चेकलिस्ट बुँदा (Statutory Indicator):
              </label>
              <select
                value={checklistItemId}
                onChange={(e) => handleChecklistChange(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white"
              >
                <option value="">-- छनौट गर्नुहोस् (वैकल्पिक) --</option>
                {checklistItems.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.checklist_code}: {c.inspection_area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Finding Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              कैफियत शीर्षक (Finding Title)*:
            </label>
            <input
              type="text"
              required
              placeholder="उदा: बिना आधार सम्झौताको म्याद थप गरिएको..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white font-semibold"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              स्थलगत कैफियतको विस्तृत व्यहोरा (Observation & Finding Details)*:
            </label>
            <textarea
              rows={3}
              required
              placeholder="निरीक्षणका क्रममा फेला परेको तथ्य, प्रमाण, परिमाण तथा कागजातमा देखिएको विचलन लेख्नुहोस्..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white"
            />
          </div>

          {/* Legal Reference & Risk Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                उल्लंघन भएको कानूनी दफा (Legal Reference):
              </label>
              <input
                type="text"
                placeholder="उदा: सार्वजनिक खरिद ऐन, २०६३ को दफा ५२ र नियमावलीको नियम १२०..."
                value={legalReference}
                onChange={(e) => setLegalReference(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                जोखिम स्तर (Risk Level)*:
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white font-bold text-red-700"
              >
                <option value="न्यून">न्यून (Low)</option>
                <option value="मध्यम">मध्यम (Medium)</option>
                <option value="उच्च">उच्च (High)</option>
                <option value="अत्यन्त उच्च">अत्यन्त उच्च (Critical)</option>
              </select>
            </div>
          </div>

          {/* Financial Impact */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              सम्भावित आर्थिक दायित्व / असुलउपर गर्नुपर्ने रकम रु. (Financial Impact):
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={estimatedImpact}
              onChange={(e) => setEstimatedImpact(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 bg-white font-mono"
            />
          </div>

          {/* Recommended Corrective Action & Deadline */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="font-bold text-slate-900 text-xs">
              सिफारिस गरिएको सुधारात्मक कदम (Recommended Corrective Action):
            </div>

            <div>
              <textarea
                rows={2}
                placeholder="निकायले गर्नुपर्ने सुधार वा असुलउपरको निर्देशन..."
                value={recommendedAction}
                onChange={(e) => setRecommendedAction(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  जिम्मेवार निकाय / अधिकृत:
                </label>
                <input
                  type="text"
                  placeholder="उदा: कार्यालय प्रमुख / लेखा अधिकृत..."
                  value={responsibleOfficer}
                  onChange={(e) => setResponsibleOfficer(e.target.value)}
                  className="w-full py-1.5 px-3 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  पालना गर्नुपर्ने म्याद (Deadline):
                </label>
                <NepaliDatePicker
                  value={deadline}
                  onChange={setDeadline}
                  className="w-full py-1.5 px-3 border border-slate-300 rounded-lg font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
            >
              {submitting ? 'सुरक्षित गरिँदैछ...' : 'कैफियत दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

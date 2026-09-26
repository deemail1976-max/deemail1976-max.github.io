import React, { useState, useEffect } from 'react';
import { Office, Province, District, Municipality, FiscalYear, Ministry } from '../../types';
import { api } from '../../services/api';
import { FolderGit2, X, Plus, Check } from 'lucide-react';

type NepalLocationData = {
  PROVINCE: Record<string, string>;
  DISTRICTS: Record<string, string[]>;
};

declare global {
  interface Window {
    nepalData: NepalLocationData;
  }
}

const nepalLocationData = window.nepalData;
const nepalProvinces: Province[] = Object.entries(nepalLocationData.PROVINCE).map(
  ([id, name_ne]) => ({
    id: Number(id),
    name_en: name_ne,
    name_ne,
  }),
);

interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProcurementModal: React.FC<ProcurementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [procurementNumber, setProcurementNumber] = useState('');
  const [officeId, setOfficeId] = useState<number | ''>('');
  const [officeName, setOfficeName] = useState('');
  const [ministryId, setMinistryId] = useState<number | ''>('');
  const [provinceId, setProvinceId] = useState<number | ''>(3); // Bagmati default
  const [districtName, setDistrictName] = useState('काठमाडौं');
  const [municipalityId, setMunicipalityId] = useState<number | ''>(1);
  const [ward, setWard] = useState('');
  const [procurementType, setProcurementType] = useState('Works');
  const [procurementMethod, setProcurementMethod] = useState('Open Competitive Bidding');
  const [fiscalYearId, setFiscalYearId] = useState<number | ''>(1);
  const [budgetSource, setBudgetSource] = useState('नेपाल सरकार स्रोत');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractDate, setContractDate] = useState('2081-04-15');
  const [contractCompletionDate, setContractCompletionDate] = useState('2082-03-30');
  const [leadInspector, setLeadInspector] = useState('ई. पुरुषोत्तम प्रसाद');
  const [inspectionTeam, setInspectionTeam] = useState('ई. विभूति पोखरेल, ले.पा. पोषराज बुढाथोकी');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
    }
  }, [isOpen]);

  const loadDropdowns = async () => {
    try {
      const [offRes, distRes, minRes, fyRes] = await Promise.all([
        api.getOffices(),
        api.getDistricts(3),
        api.getMinistries(),
        api.getFiscalYears(),
      ]);
      setOffices(offRes);
      setProvinces(nepalProvinces);
      setDistricts(distRes);
      setMinistries(minRes);
      setFiscalYears(fyRes);
      if (offRes.length > 0) {
        setOfficeId(offRes[0].id);
        setOfficeName(offRes[0].name);
      }
    } catch (err) {
      console.error('Failed to load master dropdowns:', err);
    }
  };

  const getDistrictNames = (pId: number | '') =>
    pId === '' ? [] : nepalLocationData.DISTRICTS[String(pId)] || [];

  const handleProvinceChange = async (pId: number) => {
    setProvinceId(pId);
    try {
      const dists = await api.getDistricts(pId);
      setDistricts(dists);
      setDistrictName(getDistrictNames(pId)[0] || '');
    } catch (e) {
      console.error(e);
      setDistrictName(getDistrictNames(pId)[0] || '');
    }
  };

  const handleOfficeNameChange = (name: string) => {
    setOfficeName(name);
    const matchingOffice = offices.find(
      (office) => office.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    setOfficeId(matchingOffice?.id || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !officeName.trim() || !estimatedCost || !contractAmount) {
      setError('कृपया शीर्षक, सार्वजनिक निकाय, लागत अनुमान र सम्झौता रकम भर्नुहोस्।');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.createProcurement({
        title,
        procurement_number: procurementNumber || `PROC-${Date.now().toString().slice(-6)}`,
        office_id: officeId ? Number(officeId) : undefined,
        office_name: officeName.trim(),
        ministry_id: ministryId ? Number(ministryId) : undefined,
        province_id: provinceId ? Number(provinceId) : undefined,
        district_id: districts.find((district) => district.name_ne === districtName)?.id,
        municipality_id: municipalityId ? Number(municipalityId) : undefined,
        ward,
        procurement_type: procurementType as any,
        procurement_method: procurementMethod as any,
        fiscal_year_id: Number(fiscalYearId) || 1,
        budget_source: budgetSource,
        estimated_cost: parseFloat(estimatedCost) || 0,
        contract_amount: parseFloat(contractAmount) || 0,
        contract_number: contractNumber,
        contractor_name: contractorName,
        contract_date: contractDate,
        contract_completion_date: contractCompletionDate,
        lead_inspector: leadInspector,
        inspection_team: inspectionTeam,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'खरिद दर्ता गर्न सकिएन।');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              नयाँ खरिद/आयोजना दर्ता (New Procurement Registration)
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

          {/* Section 1: Title & Procurement Number */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                खरिद / आयोजनाको शीर्षक (Procurement Title)*:
              </label>
              <input
                type="text"
                required
                placeholder="उदा: काठमाडौं चक्रपथ सुधार तथा सडक विस्तार आयोजना, ठेक्का नं. ०१..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ठेक्का नम्बर / खरिद संकेत (Contract/IFB No.)*:
                </label>
                <input
                  type="text"
                  placeholder="उदा: DRO-KTM/NCB/081-82/01"
                  value={procurementNumber}
                  onChange={(e) => setProcurementNumber(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  सार्वजनिक निकाय (Public Entity / Office)*:
                </label>
                <input
                  type="text"
                  required
                  value={officeName}
                  onChange={(e) => handleOfficeNameChange(e.target.value)}
                  placeholder="सार्वजनिक निकायको नाम लेख्नुहोस्..."
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Type, Method & Fiscal Year */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                खरिद प्रकार (Procurement Type)*:
              </label>
              <select
                value={procurementType}
                onChange={(e) => setProcurementType(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Works">निर्माण कार्य (Works)</option>
                <option value="Goods">मालसामान खरिद (Goods)</option>
                <option value="Consultancy Services">परामर्श सेवा (Consultancy)</option>
                <option value="Other Services">अन्य सेवा (Other Services)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                खरिद विधि (Procurement Method)*:
              </label>
              <select
                value={procurementMethod}
                onChange={(e) => setProcurementMethod(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Open Competitive Bidding">खुला प्रतिस्पर्धा (NCB)</option>
                <option value="Sealed Quotation">सिलबन्दी दरभाउपत्र (Sealed Quotation)</option>
                <option value="Direct Procurement">सोझै खरिद (Direct)</option>
                <option value="Consumer Committee">उपभोक्ता समिति (Consumer Committee)</option>
                <option value="Consultancy Selection">परामर्श सेवा छनोट</option>
                <option value="Special Circumstances">विशेष परिस्थिति / आकस्मिक खरिद</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                आर्थिक वर्ष (Fiscal Year)*:
              </label>
              <select
                value={fiscalYearId}
                onChange={(e) => setFiscalYearId(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {fiscalYears.map((fy) => (
                  <option key={fy.id} value={fy.id}>
                    {fy.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Cost and Contract Financials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                लागत अनुमान रकम रु. (Estimated Cost)*:
              </label>
              <input
                type="number"
                required
                placeholder="0.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                सम्झौता रकम रु. (Contract Amount)*:
              </label>
              <input
                type="number"
                required
                placeholder="0.00"
                value={contractAmount}
                onChange={(e) => setContractAmount(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                निर्माण व्यवसायी / आपूर्तिकर्ता (Contractor):
              </label>
              <input
                type="text"
                placeholder="कम्पनी / फर्मको नाम..."
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

          {/* Section 4: Location & Inspection Team */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                प्रदेश (Province):
              </label>
              <select
                value={provinceId}
                onChange={(e) => handleProvinceChange(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_ne}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                जिल्ला (District):
              </label>
              <select
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {getDistrictNames(provinceId).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                निरीक्षण टोली प्रमुख (Lead Inspector):
              </label>
              <input
                type="text"
                value={leadInspector}
                onChange={(e) => setLeadInspector(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
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
              className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
            >
              {submitting ? 'दर्ता गरिँदैछ...' : 'खरिद आयोजना दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

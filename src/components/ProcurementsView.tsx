import React, { useState, useEffect } from 'react';
import { Procurement, Office, FiscalYear } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatNepaliNumber } from '../utils/numberFormat';
import {
  FolderGit2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  FileCheck2,
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ProcurementsViewProps {
  onOpenNewModal: () => void;
  onStartInspection: (procurementId: number) => void;
}

export const ProcurementsView: React.FC<ProcurementsViewProps> = ({
  onOpenNewModal,
  onStartInspection,
}) => {
  const { canEditInspection } = useAuth();
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected for detailed modal
  const [activeProcurement, setActiveProcurement] = useState<Procurement | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [pRes, offRes, fyRes] = await Promise.all([
        api.getProcurements(),
        api.getOffices(),
        api.getFiscalYears(),
      ]);
      setProcurements(pRes);
      setOffices(offRes);
      setFiscalYears(fyRes);
    } catch (err) {
      console.error('Failed to load procurements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const res = await api.getProcurements({
        search: searchTerm,
        office_id: selectedOffice,
        procurement_type: selectedType,
        procurement_method: selectedMethod,
        current_status: selectedStatus,
      });
      setProcurements(res);
    } catch (err) {
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id: number) => {
    try {
      setLoadingDetail(true);
      const proc = await api.getProcurement(id);
      setActiveProcurement(proc);
    } catch (err) {
      console.error('Failed to load procurement details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDocStatusChange = async (docId: number, status: string) => {
    if (!activeProcurement) return;
    try {
      await api.updateProcurementDoc(activeProcurement.id, docId, status);
      // update local state
      setActiveProcurement((prev) => {
        if (!prev || !prev.documents) return prev;
        return {
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === docId ? { ...d, status: status as any } : d
          ),
        };
      });
    } catch (err) {
      console.error('Failed to update doc status:', err);
    }
  };

  const formatNPR = (amount: number | string) => {
    return formatNepaliNumber(amount);
  };

  return (
    <div className="space-y-5">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-md font-bold text-blue-900 flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-blue-700" />
            <span>सार्वजनिक खरिद योजनाहरूको अभिलेख</span>
          </h3>
          <p className="text-xs text-slate-500">
            खरिद योजनाहरूको विस्तृत विवरण तथा निरीक्षण स्थिति
          </p>
        </div>

        {canEditInspection && (
          <button
            onClick={onOpenNewModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नयाँ खरिद / आयोजना दर्ता गर्नुहोस्</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="खरिद / आयोजना शीर्षक, ठेक्का नम्बर, निर्माण व्यवसायी वा कोड..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Office Filter */}
          <div>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50"
            >
              <option value="">सबै कार्यालयहरू</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50"
            >
              <option value="">सबै खरिद प्रकार (All Types)</option>
              <option value="Works">निर्माण कार्य (Works)</option>
              <option value="Goods">मालसामान (Goods)</option>
              <option value="Consultancy Services">परामर्श सेवा (Consultancy)</option>
              <option value="Other Services">अन्य सेवा (Other Services)</option>
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50"
            >
              <option value="">सबै खरिद विधि (All Methods)</option>
              <option value="Open Competitive Bidding">खुला प्रतिस्पर्धा (Open Bidding)</option>
              <option value="Sealed Quotation">सिलबन्दी दरभाउपत्र (Sealed Quotation)</option>
              <option value="Direct Procurement">सोझै खरिद (Direct)</option>
              <option value="Consumer Committee">उपभोक्ता समिति (Consumer Committee)</option>
              <option value="Consultancy Selection">परामर्श सेवा छनोट</option>
              <option value="Special Circumstances">विशेष परिस्थिति / आकस्मिक खरिद</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            जम्मा नतिजा: <span className="font-bold text-slate-800">{formatNepaliNumber(procurements.length)}</span> आयोजनाहरू
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedOffice('');
                setSelectedType('');
                setSelectedMethod('');
                setSelectedStatus('');
                loadInitialData();
              }}
              className="px-3 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md font-medium"
            >
              रिसेट गर्नुहोस्
            </button>
            <button
              onClick={handleFilter}
              className="px-4 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-bold transition"
            >
              फिल्टर लागू गर्नुहोस्
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" />
            <div className="mt-2 text-xs">खरिद आयोजनाहरू लोड हुँदैछन्...</div>
          </div>
        ) : procurements.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            कुनै खरिद विवरण भेटिएन। कृपया नयाँ दर्ता गर्नुहोस् वा फिल्टर बदल्नुहोस्।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">कोड / ठेक्का नं.</th>
                  <th className="py-3 px-4">खरिद शीर्षक</th>
                  <th className="py-3 px-4">सार्वजनिक निकाय / स्थान</th>
                  <th className="py-3 px-4">प्रकार र विधि</th>
                  <th className="py-3 px-4 text-right">लागत अनुमान / सम्झौता</th>
                  <th className="py-3 px-4">निर्माण व्यवसायी/आपूर्तिकर्ता</th>
                  <th className="py-3 px-4 text-center">निरीक्षण स्थिति</th>
                  <th className="py-3 px-4 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {procurements.map((proc) => {
                  const hasInspection = !!proc.latest_inspection_id;
                  const inspectionStatus = proc.inspection_status || 'निरीक्षण बाँकी';
                  const completionPct = proc.completion_percentage || 0;

                  return (
                    <tr key={proc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-blue-700">
                          {proc.procurement_id_code}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                          {proc.procurement_number}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 leading-snug line-clamp-2">
                          {proc.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          आर्थिक वर्ष: <span className="font-semibold text-slate-700">{proc.fiscal_year_name || '२०८२/८३'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {proc.office_name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{proc.district_name || 'काठमाडौं'}, {proc.province_name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {proc.procurement_type}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {proc.procurement_method}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          रु. {formatNPR(proc.contract_amount)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          अनुमान: रु. {formatNPR(proc.estimated_cost)}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[150px] truncate text-slate-700">
                        {proc.contractor_name || '-'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {hasInspection ? (
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                proc.inspection_status === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {inspectionStatus}
                            </span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 mx-auto mt-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {formatNepaliNumber(completionPct)}% प्रगति
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            निरीक्षण हुन बाँकी
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => viewDetails(proc.id)}
                          className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 rounded font-semibold text-[11px] transition"
                        >
                          विस्तृत विवरण हेर्नुहोस्
                        </button>
                        <button
                          onClick={() => onStartInspection(proc.id)}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-[11px] transition"
                        >
                          निरीक्षण
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Procurement Detailed Drawer / Modal */}
      {activeProcurement && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {activeProcurement.procurement_id_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ठेक्का नं: {activeProcurement.procurement_number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeProcurement.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveProcurement(null)}
                className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">सार्वजनिक निकाय:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{activeProcurement.office_name}</div>
                </div>
                <div>
                  <span className="text-slate-500">मन्त्रालय / विभाग:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{activeProcurement.ministry_name || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-500">प्रदेश तथा जिल्ला:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {activeProcurement.province_name}, {activeProcurement.district_name}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">खरिद प्रकार र विधि:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {activeProcurement.procurement_type} ({activeProcurement.procurement_method})
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">लागत अनुमान:</span>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">
                    रु. {formatNPR(activeProcurement.estimated_cost)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">सम्झौता रकम:</span>
                  <div className="font-bold font-mono text-blue-700 mt-0.5">
                    रु. {formatNPR(activeProcurement.contract_amount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">निर्माण व्यवसायी/फर्म:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeProcurement.contractor_name || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">खरिद अवस्था:</span>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {activeProcurement.current_status}
                  </div>
                </div>
              </div>

              {/* 19-Point Document Completeness Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>आवश्यक कागजात रुजु सूची (Statutory File Checklist)</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    क्लिक गरी कागजात स्थिति परिवर्तन गर्न सकिन्छ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white">
                  {activeProcurement.documents?.map((doc) => {
                    const isAvailable = doc.status === 'उपलब्ध';
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs"
                      >
                        <span className="text-slate-800 font-medium truncate pr-2">
                          {doc.document_title}
                        </span>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleDocStatusChange(doc.id, isAvailable ? 'उपलब्ध छैन' : 'उपलब्ध')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center space-x-1 ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>उपलब्ध</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span>उपलब्ध छैन</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setActiveProcurement(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white"
              >
                बन्द गर्नुहोस्
              </button>
              <button
                onClick={() => {
                  const id = activeProcurement.id;
                  setActiveProcurement(null);
                  onStartInspection(id);
                }}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-2"
              >
                <span>स्थलगत निरीक्षण सुरु / जारी राख्नुहोस्</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

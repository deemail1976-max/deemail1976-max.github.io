import React, { useState, useEffect } from 'react';
import { EvidenceFile } from '../../types';
import { api } from '../../services/api';
import { formatNepaliNumber } from '../../utils/numberFormat';
import { Upload, FileText, Trash2, Download, CheckCircle, X } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: number;
  checklistItemId?: number;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  inspectionId,
  checklistItemId,
}) => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, inspectionId, checklistItemId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await api.getEvidenceFiles(inspectionId, checklistItemId);
      setFiles(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('कृपया अपलोड गर्न फाइल चयन गर्नुहोस्।');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('inspection_id', String(inspectionId));
      if (checklistItemId) formData.append('checklist_item_id', String(checklistItemId));
      if (docNumber) formData.append('document_number', docNumber);
      if (docDate) formData.append('document_date', docDate);
      if (pageNumber) formData.append('page_number', pageNumber);
      if (description) formData.append('description', description);

      await api.uploadEvidence(formData);
      setSelectedFile(null);
      setDocNumber('');
      setDocDate('');
      setPageNumber('');
      setDescription('');
      loadFiles();
    } catch (err: any) {
      setError(err.message || 'फाइल अपलोड गर्न सकिएन।');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('के तपाईं यो फाइल हटाउन चाहनुहुन्छ?')) return;
    try {
      await api.deleteEvidence(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              फाइल तथा कागजात अभिलेख (Evidence & Attachments)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Upload Form */}
          <form onSubmit={handleUpload} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 text-xs">
              नयाँ फाइल अपलोड गर्नुहोस् (Upload File)
            </div>

            {error && (
              <div className="p-2 bg-red-50 text-red-800 border border-red-200 rounded">
                {error}
              </div>
            )}

            <div>
              <input
                type="file"
                required
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                स्वीकृत फाइल: PDF, Word (DOC/DOCX), Excel, JPG, PNG (अधिकतम २५ MB)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="font-medium text-slate-700 block mb-0.5">
                  कागजात / चलानी नं.:
                </label>
                <input
                  type="text"
                  placeholder="उदा: च.नं. १८२"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-0.5">
                  कागजातको मिति:
                </label>
                <input
                  type="text"
                  placeholder="उदा: २०८१-०४-२५"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-0.5">
                  मिसिल पाना नं.:
                </label>
                <input
                  type="text"
                  placeholder="उदा: पाना नं. १२-१५"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-0.5">
                प्रमाण कागजातको संक्षिप्त विवरण:
              </label>
              <input
                type="text"
                placeholder="उदा: बोलपत्र मूल्याङ्कन समितिको सक्कल निर्णय प्रतिलिपि..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
              >
                {uploading ? 'अपलोड हुँदैछ...' : 'अपलोड गर्नुहोस्'}
              </button>
            </div>
          </form>

          {/* Uploaded Files List */}
          <div>
            <div className="font-bold text-slate-900 mb-2">
              संलग्न फाइलहरू ({formatNepaliNumber(files.length)} वटा)
            </div>

            {loading ? (
              <div className="text-center py-6 text-slate-500">लोड हुँदैछ...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                कुनै फाइल संलग्न गरिएको छैन।
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className="w-5 h-5 text-blue-700 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">
                          {file.file_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {file.description || file.document_number ? (
                            <span>
                              {file.description} {file.document_number && `(संकेत: ${file.document_number})`}
                            </span>
                          ) : (
                            <span>साइज: {formatNepaliNumber(file.file_size / 1024)} KB</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-3">
                      <a
                        href={`/api/evidence/file/${file.id}`}
                        download
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        title="डाउनलोड गर्नुहोस्"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                        title="हटाउनुहोस्"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Report } from '../types';

interface DeleteConfirmationModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reportId: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !report) return null;

  const handleConfirm = () => {
    onConfirm(report.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Delete Inspection Report</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-slate-900 font-mono-numbers">{report.reportNumber}</span>?
            </p>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 space-y-1 font-mono-numbers">
              <div className="font-bold text-slate-900">{report.title}</div>
              <div className="text-[11px] text-slate-500">
                Asset: {report.assetDetails.name} ({report.assetDetails.assetNumber})
              </div>
              <div className="text-[11px] text-slate-500">
                Location: {report.location} · {report.photos.length} photos
              </div>
            </div>

            <p className="mt-3 text-[11px] font-semibold text-rose-600">
              ⚠️ This will permanently remove all checklists, captured signatures, and photos. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Yes, Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};

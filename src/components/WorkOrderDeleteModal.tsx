import React from 'react';
import { Trash2, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { WorkOrder } from '../types';

interface WorkOrderDeleteModalProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (workOrderId: string) => void;
}

export const WorkOrderDeleteModal: React.FC<WorkOrderDeleteModalProps> = ({
  workOrder,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !workOrder) return null;

  const handleConfirm = () => {
    onConfirm(workOrder.id);
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
              <div className="flex items-center gap-1.5">
                <span className="rounded-sm bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 border border-rose-200">
                  Admin Action
                </span>
                <h3 className="text-base font-bold text-slate-900">Delete Work Order</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete work order{' '}
              <span className="font-bold text-slate-900 font-mono-numbers">{workOrder.workOrderNumber}</span>?
            </p>

            {/* Work order details card */}
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1.5 font-mono-numbers">
              <div className="font-bold text-slate-900">{workOrder.title}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Facility: {workOrder.facility}</span>
                <span className={`px-1.5 py-0.2 rounded-xs font-bold text-[10px] uppercase ${
                  workOrder.priority === 'Urgent'
                    ? 'bg-rose-100 text-rose-800'
                    : workOrder.priority === 'High'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {workOrder.priority}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Asset: {workOrder.assetName} ({workOrder.assetNumber})
              </div>
              <div className="text-[11px] text-slate-500">
                Assigned to: <span className="font-semibold text-slate-700">{workOrder.assignedTo}</span> · Due: {new Date(workOrder.dueDate).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 border border-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-rose-800 leading-tight">
                This will delete the assignment for the field technician and remove linked notifications. This action cannot be reversed.
              </p>
            </div>
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

import React, { useState } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Plus,
  Play,
  FileCheck,
  Search,
} from 'lucide-react';
import { WorkOrder, ReportType } from '../types';

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  onStartReportFromWO: (wo: WorkOrder) => void;
  onViewReportById?: (reportId: string) => void;
  onNewWorkOrderClick?: () => void;
}

export const WorkOrdersList: React.FC<WorkOrdersListProps> = ({
  workOrders,
  onStartReportFromWO,
  onViewReportById,
  onNewWorkOrderClick,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Urgent' | 'High' | 'Medium' | 'Routine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = workOrders.filter((wo) => {
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    const matchesSearch =
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-700" />
            <h2 className="text-xl font-extrabold text-slate-900">
              Field Work Orders &amp; Urgent Assignments
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time dispatched service orders, overhaul requests, and final commissioning tasks.
          </p>
        </div>

        {onNewWorkOrderClick && (
          <button
            type="button"
            onClick={onNewWorkOrderClick}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create Work Order
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              priorityFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Orders ({workOrders.length})
          </button>
          <button
            onClick={() => setPriorityFilter('Urgent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              priorityFilter === 'Urgent' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🚨 Urgent ({workOrders.filter((w) => w.priority === 'Urgent').length})
          </button>
          <button
            onClick={() => setPriorityFilter('High')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              priorityFilter === 'High' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            High Priority ({workOrders.filter((w) => w.priority === 'High').length})
          </button>
          <button
            onClick={() => setPriorityFilter('Medium')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              priorityFilter === 'Medium' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Medium / Routine
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search work order #, asset, or tech..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">
            No work orders matching this filter.
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isUrgent = wo.priority === 'Urgent';

            return (
              <div
                key={wo.id}
                className={`rounded-xl border p-5 bg-white transition-all shadow-xs flex flex-col justify-between ${
                  isUrgent ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar with Number, Priority, Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 font-mono-numbers">
                        {wo.workOrderNumber}
                      </span>
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          wo.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : wo.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 capitalize">
                      Status: {wo.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-sm font-bold text-slate-900 leading-snug">
                    {wo.title}
                  </h3>

                  {/* Machinery & Client */}
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800">
                      {wo.clientName} · {wo.facility}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono-numbers">
                      <span>Asset: {wo.assetName}</span>
                      <span>·</span>
                      <span>{wo.assetNumber}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{wo.location}</span>
                    </div>
                  </div>

                  {/* Description Scope */}
                  <p className="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3">
                    {wo.description}
                  </p>
                </div>

                {/* Footer Strip with Assignee, Due Date & Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    <div>Assigned to: <span className="font-semibold text-slate-800">{wo.assignedTo}</span></div>
                    <div className="text-[10px] text-slate-400 font-mono-numbers">
                      Due: {new Date(wo.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {wo.associatedReportId && onViewReportById ? (
                      <button
                        type="button"
                        onClick={() => onViewReportById(wo.associatedReportId!)}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                        View Report
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartReportFromWO(wo)}
                        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors ${
                          isUrgent ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Start Inspection Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

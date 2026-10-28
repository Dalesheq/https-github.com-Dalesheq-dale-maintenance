import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Send,
  Plus,
  Eye,
  FileText,
  UserCheck,
  Filter,
  Search,
  ArrowRight,
  MapPin,
  Calendar,
  Trash2,
  Edit3,
  Wrench,
  Lock,
} from 'lucide-react';
import { Report, WorkOrder, ReportType } from '../types';
import { storageService } from '../services/storageService';
import { REPORT_TEMPLATES } from '../data/reportTemplates';
import { USERS } from '../data/initialData';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { WorkOrderEditModal } from './WorkOrderEditModal';
import { WorkOrderDeleteModal } from './WorkOrderDeleteModal';
import { ManagementLoginModal } from './ManagementLoginModal';
import { SiteEquipmentDropdown } from './SiteEquipmentDropdown';

interface ManagerDashboardProps {
  reports: Report[];
  workOrders: WorkOrder[];
  onViewReport: (report: Report) => void;
  onEditReport: (report: Report) => void;
  onDeleteReport?: (reportId: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  reports,
  workOrders,
  onViewReport,
  onEditReport,
  onDeleteReport,
}) => {
  const [selectedReportForReview, setSelectedReportForReview] = useState<Report | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'critical' | 'work_orders'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [editingWO, setEditingWO] = useState<WorkOrder | null>(null);
  const [deletingWO, setDeletingWO] = useState<WorkOrder | null>(null);

  // New Work Order Form State
  const [woTitle, setWoTitle] = useState('');
  const [woPriority, setWoPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Routine'>('Urgent');
  const [woClient, setWoClient] = useState('Sunbake Benoni');
  const [woFacility, setWoFacility] = useState('Sunbake Benoni Plant');
  const [woAssetName, setWoAssetName] = useState('8000 Baking Oven');
  const [woAssetNumber, setWoAssetNumber] = useState('DSS 269-2');
  const [woAssignedTo, setWoAssignedTo] = useState('Raynard Kruger');
  const [woTemplate, setWoTemplate] = useState<ReportType>('oven_inspection');
  const [woDescription, setWoDescription] = useState('');

  const currentUser = storageService.getCurrentUser();
  const isAdmin = storageService.isAdmin();
  const isManager = storageService.isManagement();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Metrics
  const pendingReports = reports.filter((r) => r.approvalStatus === 'submitted' || r.approvalStatus === 'under_review');
  const approvedReports = reports.filter((r) => r.approvalStatus === 'approved');
  const criticalSafetyAlerts = reports.filter(
    (r) => !r.summary.assetSafeToUse || r.summary.overallCondition.includes('Major') || r.summary.maintenancePriority === 'Urgent'
  );
  const urgentOrders = workOrders.filter((w) => w.priority === 'Urgent' && w.status !== 'completed');

  // Filtered reports for list
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assetDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assetDetails.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') {
      return r.approvalStatus === 'submitted' || r.approvalStatus === 'under_review';
    }
    if (statusFilter === 'approved') {
      return r.approvalStatus === 'approved';
    }
    if (statusFilter === 'critical') {
      return !r.summary.assetSafeToUse || r.summary.maintenancePriority === 'Urgent';
    }
    return true;
  });

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleApprove = (report: Report) => {
    storageService.approveReport(report.id, currentUser.name, reviewNotes.trim() || 'Reviewed and approved for plant operation.');
    setSelectedReportForReview(null);
    setReviewNotes('');
    setReviewError('');
  };

  const handleRequestRevision = (report: Report) => {
    if (!reviewNotes.trim()) {
      setReviewError('Please specify the required adjustments or observations in the notes field.');
      return;
    }
    setReviewError('');
    storageService.requestRevision(report.id, currentUser.name, reviewNotes.trim());
    setSelectedReportForReview(null);
    setReviewNotes('');
  };

  const handleDispatchWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!woTitle.trim()) return;

    const nextWoNumber = `WO-2026-${String(workOrders.length + 95).padStart(3, '0')}`;

    storageService.dispatchUrgentWorkOrder({
      workOrderNumber: nextWoNumber,
      title: woTitle.trim(),
      priority: woPriority,
      clientName: woClient,
      facility: woFacility,
      assetName: woAssetName,
      assetNumber: woAssetNumber,
      location: woFacility,
      assignedTo: woAssignedTo,
      assignedBy: currentUser.name,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'assigned',
      description: woDescription.trim(),
      templateType: woTemplate,
    });

    setIsDispatchModalOpen(false);
    setWoTitle('');
    setWoDescription('');
  };

  if (!isManager) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-300 text-amber-700">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Management &amp; QA Sign-Off Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
            Reviewing inspection reports, granting equipment safety authorization, and dispatching remediation tickets is restricted to the Management Category (Nico van Wyk, SHEQ Director).
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Login as Management Category (PIN: 1234)</span>
            </button>
          </div>
        </div>

        {isLoginModalOpen && (
          <ManagementLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={() => setIsLoginModalOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Role Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Management &amp; SHEQ Console
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-700">{currentUser.name} ({currentUser.title})</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
            Industrial Equipment Review &amp; Dispatch Dashboard
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Review field inspection reports, authorize machinery safety sign-offs, and dispatch real-time urgent work orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDispatchModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
        >
          <Send className="h-4 w-4" />
          Dispatch Urgent Work Order
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Review */}
        <div
          onClick={() => setStatusFilter('pending')}
          className={`cursor-pointer rounded-xl border p-4 bg-white transition-all shadow-xs ${
            statusFilter === 'pending' ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono-numbers">
            {pendingReports.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Awaiting manager sign-off</div>
        </div>

        {/* Critical Alerts */}
        <div
          onClick={() => setStatusFilter('critical')}
          className={`cursor-pointer rounded-xl border p-4 bg-white transition-all shadow-xs ${
            statusFilter === 'critical' ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Critical / Unsafe</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 font-mono-numbers">
            {criticalSafetyAlerts.length}
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">Immediate maintenance required</div>
        </div>

        {/* Urgent Work Orders */}
        <div
          onClick={() => setStatusFilter('work_orders')}
          className={`cursor-pointer rounded-xl border p-4 bg-white transition-all shadow-xs ${
            statusFilter === 'work_orders' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Work Orders</span>
            <Send className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono-numbers">
            {workOrders.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{urgentOrders.length} urgent · Click to review &amp; edit</div>
        </div>

        {/* Approved Reports */}
        <div
          onClick={() => setStatusFilter('approved')}
          className={`cursor-pointer rounded-xl border p-4 bg-white transition-all shadow-xs ${
            statusFilter === 'approved' ? 'border-emerald-400 ring-2 ring-emerald-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved Reports</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono-numbers">
            {approvedReports.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Certified for production</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'pending' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Approval ({pendingReports.length})
          </button>
          <button
            onClick={() => setStatusFilter('critical')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Critical / Unsafe ({criticalSafetyAlerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'approved' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved ({approvedReports.length})
          </button>
          <button
            onClick={() => setStatusFilter('work_orders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              statusFilter === 'work_orders' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="h-3 w-3" />
            <span>Work Orders ({workOrders.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report, asset, or inspector..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Table: Reports or Work Orders */}
      {statusFilter === 'work_orders' ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-slate-700" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Field Work Orders Management ({filteredWorkOrders.length})
              </h3>
            </div>
            {isAdmin && (
              <span className="rounded-sm bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Admin Edit &amp; Delete Enabled
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700">
                  <th className="py-3 px-4">Work Order # &amp; Title</th>
                  <th className="py-3 px-4">Machinery Asset &amp; Facility</th>
                  <th className="py-3 px-4">Priority &amp; Status</th>
                  <th className="py-3 px-4">Assigned Tech &amp; Due Date</th>
                  <th className="py-3 px-4">Scope / Directives</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No work orders matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWorkOrders.map((wo) => {
                    const isUrgent = wo.priority === 'Urgent';

                    return (
                      <tr key={wo.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Work Order # & Title */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono-numbers">{wo.workOrderNumber}</div>
                          <div className="text-xs font-semibold text-slate-800 max-w-xs">{wo.title}</div>
                        </td>

                        {/* Machinery Asset & Facility */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{wo.assetName}</div>
                          <div className="text-[11px] text-slate-500 font-mono-numbers">{wo.assetNumber}</div>
                          <div className="text-[11px] text-slate-600">{wo.facility}</div>
                        </td>

                        {/* Priority & Status */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block rounded-xs px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800'
                                  : wo.priority === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {wo.priority}
                            </span>
                            <div className="text-[11px] font-medium text-slate-600 capitalize">
                              {wo.status.replace('_', ' ')}
                            </div>
                          </div>
                        </td>

                        {/* Assigned Tech & Due Date */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{wo.assignedTo}</div>
                          <div className="text-[11px] text-slate-400 font-mono-numbers">
                            Due: {new Date(wo.dueDate).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Scope / Directives */}
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                            {wo.description}
                          </p>
                        </td>

                        {/* Admin Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Admin / Manager Edit */}
                            {(isAdmin || currentUser.role === 'manager') && (
                              <button
                                type="button"
                                onClick={() => setEditingWO(wo)}
                                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                                title="ADMIN: Edit Work Order"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                                <span>Edit</span>
                              </button>
                            )}

                            {/* Admin Delete */}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setDeletingWO(wo)}
                                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                                title="ADMIN: Delete Work Order"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Reports Table */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700">
                  <th className="py-3 px-4">Report &amp; Machinery Asset</th>
                  <th className="py-3 px-4">Inspector &amp; Location</th>
                  <th className="py-3 px-4">Condition &amp; Safety</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-center">Approval Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No reports matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const isCritical =
                      !report.summary.assetSafeToUse ||
                      report.summary.overallCondition.includes('Major') ||
                      report.summary.maintenancePriority === 'Urgent';

                    return (
                      <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Report & Asset */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono-numbers">{report.reportNumber}</div>
                          <div className="text-xs text-slate-700 font-medium">{report.assetDetails.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {report.assetDetails.assetNumber} · {report.assetDetails.category}
                          </div>
                        </td>

                        {/* Inspector & Location */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{report.inspectorName}</div>
                          <div className="text-[11px] text-slate-500">{report.location}</div>
                          <div className="text-[10px] text-slate-400 font-mono-numbers">
                            {report.inspectionDate}
                          </div>
                        </td>

                        {/* Condition & Safety */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{report.summary.overallCondition}</div>
                          <div className="mt-1 flex items-center gap-1.5">
                            {report.summary.assetSafeToUse ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="h-3 w-3" /> Safe to Use
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="h-3 w-3" /> UNSAFE - SHUT DOWN
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold text-[11px] ${
                              report.summary.maintenancePriority === 'Urgent'
                                ? 'text-rose-600'
                                : report.summary.maintenancePriority === 'High'
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {report.summary.maintenancePriority}
                          </span>
                        </td>

                        {/* Approval Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                              report.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : report.approvalStatus === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : report.approvalStatus === 'revision_requested'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {report.approvalStatus.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Admin Delete Action */}
                            {currentUser.role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => setReportToDelete(report)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                title="ADMIN: Delete Report"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onViewReport(report)}
                              className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              title="Preview official PDF report"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {(report.approvalStatus === 'submitted' || report.approvalStatus === 'under_review') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReportForReview(report);
                                  setReviewNotes('');
                                }}
                                className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                              >
                                Review &amp; Sign
                              </button>
                            )}

                            {(report.approvalStatus === 'approved' || currentUser.role === 'admin') && (
                              <button
                                type="button"
                                onClick={() => onEditReport(report)}
                                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                title={currentUser.role === 'admin' ? 'ADMIN: Edit any report' : 'View / Edit'}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Approve Modal */}
      {selectedReportForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Manager Sign-off</span>
                <h3 className="text-base font-bold text-slate-900">{selectedReportForReview.reportNumber}</h3>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedReportForReview.assetDetails.name} ({selectedReportForReview.assetDetails.assetNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedReportForReview(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Inspector:</span>
                <span className="font-semibold">{selectedReportForReview.inspectorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Condition:</span>
                <span className="font-bold">{selectedReportForReview.summary.overallCondition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Safe to Operate:</span>
                <span className={selectedReportForReview.summary.assetSafeToUse ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {selectedReportForReview.summary.assetSafeToUse ? 'YES' : 'NO (RISK)'}
                </span>
              </div>
              {selectedReportForReview.summary.additionalNotes && (
                <div className="pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500 block">Tech Observations:</span>
                  <p className="text-slate-800 italic mt-0.5">{selectedReportForReview.summary.additionalNotes}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Operations Manager Review Notes &amp; Signoff Instructions
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Approved. Spare parts order #9822 placed for Saturday maintenance window."
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            {reviewError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
                {reviewError}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => handleRequestRevision(selectedReportForReview)}
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
              >
                Request Revisions
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReportForReview(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedReportForReview)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Authorize &amp; Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Urgent Work Order Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleDispatchWorkOrder}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Real-Time Dispatch</span>
                <h3 className="text-base font-bold text-slate-900">Issue Urgent Work Order Assignment</h3>
                <p className="text-xs text-slate-500">
                  Instantly sends a high-priority push notification and assignment to the field technician.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Work Order Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={woTitle}
                onChange={(e) => setWoTitle(e.target.value)}
                placeholder="e.g. URGENT: Replace fractured flame tubes before evening bake cycle"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Urgency Priority</label>
                <select
                  value={woPriority}
                  onChange={(e) => setWoPriority(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                >
                  <option value="Urgent">🚨 Urgent (Immediate Push Alert)</option>
                  <option value="High">⚠️ High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Routine">Routine Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Assign Technician</label>
                <select
                  value={woAssignedTo}
                  onChange={(e) => setWoAssignedTo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 font-semibold focus:border-slate-900 focus:outline-hidden"
                >
                  {USERS.filter((u) => u.role === 'technician').map((tech) => (
                    <option key={tech.id} value={tech.name}>
                      {tech.name} ({tech.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Site & Machinery Asset Quick Picker */}
            <div className="rounded-lg border border-red-200 bg-red-50/30 p-2.5">
              <SiteEquipmentDropdown
                selectedAssetNumber={woAssetNumber}
                selectedFacilityName={woFacility || woClient}
                label="Select Official Facility Site & Machinery Asset"
                onSelect={(selected) => {
                  setWoClient(selected.clientGroup);
                  setWoFacility(`${selected.facilityName}, ${selected.region}`);
                  setWoAssetName(selected.assetName);
                  setWoAssetNumber(selected.assetNumber);
                  if (!woTitle.trim()) {
                    setWoTitle(`Inspect & Service ${selected.assetNumber} (${selected.assetName}) at ${selected.facilityName}`);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Client / Plant Name</label>
                <input
                  type="text"
                  value={woClient}
                  onChange={(e) => setWoClient(e.target.value)}
                  placeholder="e.g. Sunbake Benoni"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Facility Location</label>
                <input
                  type="text"
                  value={woFacility}
                  onChange={(e) => setWoFacility(e.target.value)}
                  placeholder="e.g. Van Dyk Rd, Benoni"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Machinery Asset Name</label>
                <input
                  type="text"
                  value={woAssetName}
                  onChange={(e) => setWoAssetName(e.target.value)}
                  placeholder="e.g. 8000 Baking Oven"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Asset Serial #</label>
                <input
                  type="text"
                  value={woAssetNumber}
                  onChange={(e) => setWoAssetNumber(e.target.value)}
                  placeholder="e.g. DSS 269-2"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 font-mono-numbers focus:border-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Report Template to Use</label>
              <select
                value={woTemplate}
                onChange={(e) => setWoTemplate(e.target.value as ReportType)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
              >
                {storageService.getAllTemplates().map((tmpl) => (
                  <option key={tmpl.type} value={tmpl.type}>
                    {tmpl.title} {tmpl.type.startsWith('custom_') ? '(Custom / Imported)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Detailed Scope of Work &amp; Directives</label>
              <textarea
                value={woDescription}
                onChange={(e) => setWoDescription(e.target.value)}
                placeholder="Specify parts brought, safety lockouts needed, and acceptance criteria..."
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                <Send className="h-4 w-4" />
                Dispatch &amp; Send Push Notification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      <DeleteConfirmationModal
        report={reportToDelete}
        isOpen={Boolean(reportToDelete)}
        onClose={() => setReportToDelete(null)}
        onConfirm={(id) => {
          if (onDeleteReport) {
            onDeleteReport(id);
          } else {
            storageService.deleteReport(id);
          }
          setReportToDelete(null);
        }}
      />

      {/* Admin Work Order Edit Modal */}
      <WorkOrderEditModal
        workOrder={editingWO}
        isOpen={Boolean(editingWO)}
        onClose={() => setEditingWO(null)}
        onSave={(updated) => {
          storageService.saveWorkOrder(updated);
          setEditingWO(null);
        }}
      />

      {/* Admin Work Order Delete Confirmation Modal */}
      <WorkOrderDeleteModal
        workOrder={deletingWO}
        isOpen={Boolean(deletingWO)}
        onClose={() => setDeletingWO(null)}
        onConfirm={(id) => {
          storageService.deleteWorkOrder(id);
          setDeletingWO(null);
        }}
      />
    </div>
  );
};

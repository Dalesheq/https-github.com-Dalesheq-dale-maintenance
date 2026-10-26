import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { Report, ReportType } from '../types';
import { REPORT_TEMPLATES, ReportTemplate } from '../data/reportTemplates';
import { generateDaleAutomationPDF } from '../utils/pdfGenerator';
import { storageService } from '../services/storageService';

interface ReportsListProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onEditReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
  onCreateReportFromTemplate: (template: ReportTemplate) => void;
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (open: boolean) => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  onSelectReport,
  onEditReport,
  onDeleteReport,
  onCreateReportFromTemplate,
  isTemplateModalOpen,
  setIsTemplateModalOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'submitted' | 'draft' | 'urgent'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const currentUser = storageService.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const handleDelete = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `ADMIN ACTION: Are you sure you want to permanently delete report "${report.reportNumber}" (${report.assetDetails.name})?\n\nThis will remove all checklist data, photo evidence, and signatures. This cannot be undone.`
    );
    if (confirmed) {
      onDeleteReport(report.id);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assetDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assetDetails.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.inspectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'urgent'
        ? !r.summary.assetSafeToUse || r.summary.maintenancePriority === 'Urgent'
        : r.approvalStatus === statusFilter;

    const matchesType = typeFilter === 'all' ? true : r.reportType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDownloadPdf = async (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    try {
      setDownloadingId(report.id);
      const pdf = await generateDaleAutomationPDF(report);
      pdf.save(`${report.reportNumber.replace(/\s+/g, '_')}_Official_Report.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Welcome & Actions Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Field Operations &amp; Quality Engineering
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-700">Dale Automation</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
            Machinery Commissioning, Inspection &amp; Service Reports
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Offline-enabled field reporting for heavy industrial spiral coolers, freezers, ovens, and ammonia pump stations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTemplateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Report
        </button>
      </div>

      {/* Admin Privileges Active Banner */}
      {isAdmin && (
        <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/70 p-3.5 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-purple-700 shrink-0" />
            <div>
              <span className="font-bold text-purple-950">System Administrator Rights Active: </span>
              <span className="text-purple-800">
                You have global permissions to edit or permanently delete any report regardless of approval status.
              </span>
            </div>
          </div>
          <span className="rounded bg-purple-200 px-2 py-0.5 text-[10px] font-extrabold uppercase text-purple-900">
            Admin Mode
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'approved' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved ({reports.filter((r) => r.approvalStatus === 'approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'submitted' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Review ({reports.filter((r) => r.approvalStatus === 'submitted').length})
          </button>
          <button
            onClick={() => setStatusFilter('urgent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'urgent' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🚨 Urgent Repairs ({reports.filter((r) => !r.summary.assetSafeToUse || r.summary.maintenancePriority === 'Urgent').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Equipment Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden"
          >
            <option value="all">All Machinery Types</option>
            <option value="spiral_cooler_double_drum">Spiral Cooler (Double Drum)</option>
            <option value="spiral_cooler_edge_drive">Spiral Cooler (Edge Drive)</option>
            <option value="spiral_freezer">Spiral Freezer</option>
            <option value="oven_inspection">Industrial Oven</option>
            <option value="commissioning_chiller_pump">Pump Station &amp; Chiller</option>
            <option value="training_register">Training Register</option>
            <option value="service_van_tools">Service Van &amp; Rigging Tools</option>
          </select>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No inspection reports match the search criteria. Tap "Create New Report" to begin a new inspection.
          </div>
        ) : (
          filteredReports.map((report) => {
            const isUnsafe = !report.summary.assetSafeToUse;

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className={`group cursor-pointer rounded-xl border p-5 bg-white transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isUnsafe ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Header: Report #, Approval Badge, Sync Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="font-extrabold text-xs text-slate-900 font-mono-numbers">
                      {report.reportNumber}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
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
                    </div>
                  </div>

                  {/* Title & Asset */}
                  <h3 className="mt-3 text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>

                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800">{report.assetDetails.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono-numbers">
                      {report.assetDetails.assetNumber} · {report.assetDetails.category}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{report.location}</span>
                    </div>
                  </div>

                  {/* Machinery Condition & Safe Indicator */}
                  <div className="mt-4 rounded-lg bg-slate-50 p-2.5 border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Condition:</span>
                      <span className="font-semibold text-slate-800">{report.summary.overallCondition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Safe to Operate:</span>
                      {report.summary.assetSafeToUse ? (
                        <span className="font-bold text-emerald-700">YES</span>
                      ) : (
                        <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                          NO (RISK)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Photos &amp; Checks:</span>
                      <span className="font-mono-numbers font-medium text-slate-700">
                        {report.photos.length} photos · {report.sections.flatMap((s) => s.items).length} items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Strip with Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-400 font-mono-numbers">
                    {report.inspectionDate}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, report)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        title="ADMIN: Delete Report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditReport(report);
                      }}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      title={isAdmin ? "ADMIN: Edit any report" : "Edit Report"}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadPdf(e, report)}
                      disabled={downloadingId === report.id}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReport(report);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Report Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Dale Automation Templates
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Select Equipment Inspection &amp; Commissioning Template
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-configured with standard industrial checklist items, sensor tests, and safety interlocks.
                </p>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {Object.values(REPORT_TEMPLATES).map((tmpl) => (
                <div
                  key={tmpl.type}
                  onClick={() => {
                    onCreateReportFromTemplate(tmpl);
                    setIsTemplateModalOpen(false);
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:shadow-xs transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{tmpl.title}</h4>
                    <span className="text-[10px] text-blue-600 font-semibold">{tmpl.defaultCategory}</span>
                    <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">{tmpl.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono-numbers">
                    <span>{tmpl.sections.length} sections · {tmpl.sections.flatMap((s) => s.items).length} checks</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

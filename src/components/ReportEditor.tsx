import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Download,
  Eye,
  Camera,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MinusCircle,
  PenTool,
  Plus,
  Trash2,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ZoomIn,
  X,
} from 'lucide-react';
import { Report, ChecklistSection, ChecklistItem, PhotoAttachment, SignatureData, ItemStatus, ApprovalStatus } from '../types';
import { REPORT_TEMPLATES } from '../data/reportTemplates';
import { SignaturePadModal } from './SignaturePadModal';
import { PhotoUploadModal } from './PhotoUploadModal';
import { GPSLocationPicker } from './GPSLocationPicker';
import { generateDaleAutomationPDF } from '../utils/pdfGenerator';
import { storageService } from '../services/storageService';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SiteEquipmentDropdown } from './SiteEquipmentDropdown';

interface ReportEditorProps {
  initialReport: Report;
  onBack: () => void;
  onPreview: (report: Report) => void;
  onDelete?: (reportId: string) => void;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({ initialReport, onBack, onPreview, onDelete }) => {
  const [report, setReport] = useState<Report>(initialReport);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activePhotoSn, setActivePhotoSn] = useState<number | undefined>(undefined);
  const [signatureModalType, setSignatureModalType] = useState<'technician' | 'client' | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editorLightboxPhoto, setEditorLightboxPhoto] = useState<PhotoAttachment | null>(null);

  const currentUser = storageService.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const handleConfirmDelete = (id: string) => {
    storageService.deleteReport(id);
    if (onDelete) onDelete(id);
    setShowDeleteModal(false);
    onBack();
  };

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleUpdateItemStatus = (sectionId: string, itemId: string, status: ItemStatus) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, status };
          }),
        };
      }),
    }));
  };

  const handleUpdateItemNotes = (sectionId: string, itemId: string, notes: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, notes };
          }),
        };
      }),
    }));
  };

  const handleUpdateItemReadings = (sectionId: string, itemId: string, readings: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, readings };
          }),
        };
      }),
    }));
  };

  const handleAddItemToSection = (sectionId: string) => {
    const section = report.sections.find((s) => s.id === sectionId);
    if (!section) return;

    // Find highest SN across all sections
    const maxSn = Math.max(0, ...report.sections.flatMap((s) => s.items.map((i) => i.sn)));
    const newItem: ChecklistItem = {
      id: `custom-item-${Date.now()}`,
      sn: maxSn + 1,
      name: 'New Inspection Item',
      notes: '',
      status: 'good',
      statusType: 'good_repair_replace',
    };

    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s)),
    }));
  };

  const handleAddSection = () => {
    const newSection: ChecklistSection = {
      id: `sec-${Date.now()}`,
      title: 'Additional Machinery Section',
      items: [],
    };
    setReport((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.filter((i) => i.id !== itemId),
        };
      }),
    }));
  };

  const handleAddPhoto = (newPhoto: PhotoAttachment) => {
    setReport((prev) => {
      const photos = [...prev.photos, newPhoto];
      // Also link to specific checklist item if sn was provided
      let sections = prev.sections;
      if (newPhoto.snItem) {
        sections = sections.map((sec) => ({
          ...sec,
          items: sec.items.map((item) => {
            if (item.sn === newPhoto.snItem) {
              const currentIds = item.photoIds || [];
              return { ...item, photoIds: [...currentIds, newPhoto.id] };
            }
            return item;
          }),
        }));
      }
      return { ...prev, photos, sections };
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    setReport((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId),
      sections: prev.sections.map((sec) => ({
        ...sec,
        items: sec.items.map((item) => ({
          ...item,
          photoIds: item.photoIds?.filter((id) => id !== photoId),
        })),
      })),
    }));
  };

  const handleSaveSignature = (sigData: SignatureData) => {
    if (signatureModalType === 'technician') {
      setReport((prev) => ({
        ...prev,
        signatures: {
          ...prev.signatures,
          technician: sigData,
        },
      }));
    } else if (signatureModalType === 'client') {
      setReport((prev) => ({
        ...prev,
        signatures: {
          ...prev.signatures,
          client: sigData,
        },
      }));
    }
  };

  const handleSaveReport = (isSubmit = false) => {
    const updated: Report = {
      ...report,
      approvalStatus: isSubmit ? 'submitted' : report.approvalStatus === 'approved' ? 'approved' : 'draft',
      updatedAt: new Date().toISOString(),
    };

    const res = storageService.saveReport(updated);
    setReport(res.report);

    const msg = isSubmit
      ? 'Report submitted for Operations Manager review.'
      : res.synced
      ? 'Report saved and synchronized with cloud.'
      : 'Saved in offline storage. Will automatically sync once online.';

    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdf = await generateDaleAutomationPDF(report);
      pdf.save(`${report.reportNumber.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Top Action Bar */}
      <div className="sticky top-14 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xs backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-bold text-slate-900 font-mono-numbers">{report.reportNumber}</span>

          {isAdmin ? (
            <select
              value={report.approvalStatus}
              onChange={(e) => setReport({ ...report, approvalStatus: e.target.value as ApprovalStatus })}
              className="rounded border border-purple-300 bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-900 uppercase focus:outline-hidden"
              title="Admin: Change Approval Status"
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="rejected">Rejected</option>
            </select>
          ) : (
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
          )}

          <span
            className={`text-[10px] font-semibold ${
              report.syncStatus === 'synced' ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            · {report.syncStatus === 'synced' ? 'Cloud Synced' : 'Pending Sync'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
            title="Permanently delete this report"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
            <span>Delete Report</span>
          </button>

          <button
            type="button"
            onClick={() => onPreview(report)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            Preview
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>

          <button
            type="button"
            onClick={() => handleSaveReport(false)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            <Save className="h-3.5 w-3.5 text-slate-600" />
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => handleSaveReport(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Send className="h-3.5 w-3.5" />
            {isAdmin ? 'Save & Set Status' : 'Submit for Review'}
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{saveToast}</span>
          <button onClick={() => setSaveToast(null)} className="text-emerald-600">×</button>
        </div>
      )}

      {/* Official Report Header & Details Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        {/* Title Bar */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Report Document Title
          </label>
          <input
            type="text"
            value={report.title}
            onChange={(e) => setReport({ ...report, title: e.target.value })}
            className="mt-1 w-full text-xl font-extrabold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden py-1"
          />
        </div>

        {/* Site & Machinery Asset Dropdown Selector */}
        <div className="rounded-xl border border-red-200 bg-red-50/30 p-3.5 shadow-2xs">
          <SiteEquipmentDropdown
            selectedAssetNumber={report.assetDetails.assetNumber}
            selectedFacilityName={report.assetDetails.name || report.location}
            label="Select Official Facility Site & Machinery Asset"
            onSelect={(selected) => {
              setReport((prev) => ({
                ...prev,
                location: `${selected.facilityName}, ${selected.region}`,
                gps: {
                  ...prev.gps,
                  facilityName: selected.facilityName,
                  address: selected.locationAddress,
                  latitude: selected.gps?.latitude || prev.gps.latitude,
                  longitude: selected.gps?.longitude || prev.gps.longitude,
                },
                assetDetails: {
                  ...prev.assetDetails,
                  name: selected.facilityName,
                  assetNumber: selected.assetNumber,
                  category: selected.category || prev.assetDetails.category,
                },
                summary: {
                  ...prev.summary,
                  customBusinessFields: {
                    ...prev.summary.customBusinessFields,
                    clientName: selected.clientGroup,
                  },
                },
              }));
            }}
          />
        </div>

        {/* 2-Column Details Box (Inspection Details & Asset Details) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          {/* Column 1: Inspection Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
              Inspection Details
            </h4>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Report #:</span>
              <input
                type="text"
                value={report.reportNumber}
                onChange={(e) => setReport({ ...report, reportNumber: e.target.value })}
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 font-mono-numbers"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Location:</span>
              <input
                type="text"
                value={report.location}
                onChange={(e) => setReport({ ...report, location: e.target.value })}
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Inspection Date:</span>
              <input
                type="text"
                value={report.inspectionDate}
                onChange={(e) => setReport({ ...report, inspectionDate: e.target.value })}
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 font-mono-numbers"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Inspector Name:</span>
              <input
                type="text"
                value={report.inspectorName}
                onChange={(e) => setReport({ ...report, inspectorName: e.target.value })}
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 font-semibold"
              />
            </div>
          </div>

          {/* Column 2: Asset Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
              Asset Details
            </h4>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Asset Category:</span>
              <input
                type="text"
                value={report.assetDetails.category}
                onChange={(e) =>
                  setReport({
                    ...report,
                    assetDetails: { ...report.assetDetails, category: e.target.value },
                  })
                }
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Asset Name:</span>
              <input
                type="text"
                value={report.assetDetails.name}
                onChange={(e) =>
                  setReport({
                    ...report,
                    assetDetails: { ...report.assetDetails, name: e.target.value },
                  })
                }
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 font-semibold"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Asset #:</span>
              <input
                type="text"
                value={report.assetDetails.assetNumber}
                onChange={(e) =>
                  setReport({
                    ...report,
                    assetDetails: { ...report.assetDetails, assetNumber: e.target.value },
                  })
                }
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 font-mono-numbers"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Meter Reading:</span>
              <input
                type="text"
                value={report.assetDetails.meterReading}
                onChange={(e) =>
                  setReport({
                    ...report,
                    assetDetails: { ...report.assetDetails, meterReading: e.target.value },
                  })
                }
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 font-mono-numbers"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Model / Year:</span>
              <input
                type="text"
                value={report.assetDetails.modelYear}
                onChange={(e) =>
                  setReport({
                    ...report,
                    assetDetails: { ...report.assetDetails, modelYear: e.target.value },
                  })
                }
                className="col-span-2 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* GPS Geotagging Component */}
        <GPSLocationPicker
          currentGps={report.gps}
          onChange={(newGps) => setReport({ ...report, gps: newGps })}
        />
      </div>

      {/* Checklist Sections */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Inspection Checklist Sections
          </h3>
          <button
            type="button"
            onClick={handleAddSection}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Section
          </button>
        </div>

        {report.sections.map((section) => {
          const isCollapsed = collapsedSections[section.id];
          return (
            <div key={section.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Section Header */}
              <div className="flex items-center justify-between bg-slate-100 px-4 py-3 border-b border-slate-200">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setReport((prev) => ({
                      ...prev,
                      sections: prev.sections.map((s) => (s.id === section.id ? { ...s, title: newTitle } : s)),
                    }));
                  }}
                  className="font-bold text-sm text-slate-900 bg-transparent focus:bg-white px-2 py-0.5 rounded border border-transparent focus:border-slate-300 focus:outline-hidden"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono-numbers">
                    {section.items.length} items
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSectionCollapse(section.id)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Section Table Body */}
              {!isCollapsed && (
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700">
                        <th className="py-2 px-2.5 w-12 text-center">SN</th>
                        <th className="py-2 px-2.5 min-w-[180px]">Inspection Item</th>
                        <th className="py-2 px-2.5 min-w-[200px]">Technical Note &amp; Observations</th>
                        <th className="py-2 px-2.5 text-center min-w-[180px]">Status Evaluation</th>
                        <th className="py-2 px-2.5 w-24 text-center">Photos</th>
                        <th className="py-2 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {section.items.map((item) => {
                        const itemPhotos = report.photos.filter((p) => p.snItem === item.sn);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* SN */}
                            <td className="py-2.5 px-2.5 text-center font-bold text-slate-600 font-mono-numbers">
                              {item.sn}
                            </td>

                            {/* Item Name */}
                            <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const newName = e.target.value;
                                  setReport((prev) => ({
                                    ...prev,
                                    sections: prev.sections.map((sec) => ({
                                      ...sec,
                                      items: sec.items.map((i) => (i.id === item.id ? { ...i, name: newName } : i)),
                                    })),
                                  }));
                                }}
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800 px-1 py-0.5 rounded focus:outline-hidden"
                              />
                            </td>

                            {/* Note */}
                            <td className="py-2.5 px-2.5">
                              <input
                                type="text"
                                value={item.notes}
                                placeholder="Add technical note / observation..."
                                onChange={(e) => handleUpdateItemNotes(section.id, item.id, e.target.value)}
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden"
                              />
                              {item.statusType === 'readings_only' && (
                                <input
                                  type="text"
                                  value={item.readings || ''}
                                  placeholder="Quantitative reading (e.g. 26 l/s, 45 Hz)..."
                                  onChange={(e) => handleUpdateItemReadings(section.id, item.id, e.target.value)}
                                  className="mt-1 w-full rounded border border-blue-200 bg-blue-50/50 px-2 py-0.5 text-xs text-blue-900 font-mono-numbers focus:outline-hidden"
                                />
                              )}
                            </td>

                            {/* Status Evaluation with Dropdown Menu & Quick Action */}
                            <td className="py-2.5 px-2.5 text-center min-w-[190px]">
                              {item.statusType === 'readings_only' ? (
                                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                  Readings Only
                                </span>
                              ) : item.statusType === 'pass_fail' ? (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                  <select
                                    aria-label={`Status for ${item.name}`}
                                    value={item.status}
                                    onChange={(e) =>
                                      handleUpdateItemStatus(section.id, item.id, e.target.value as ItemStatus)
                                    }
                                    className={`w-full sm:w-auto text-xs font-bold rounded-lg border px-2.5 py-1.5 transition-colors cursor-pointer shadow-xs focus:outline-hidden ${
                                      item.status === 'pass'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                        : item.status === 'fail'
                                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                                        : 'border-slate-300 bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <option value="pass">✓ Pass</option>
                                    <option value="fail">✗ Fail</option>
                                    <option value="na">− NA</option>
                                  </select>
                                </div>
                              ) : item.statusType === 'yes_no' ? (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                  <select
                                    aria-label={`Status for ${item.name}`}
                                    value={item.status}
                                    onChange={(e) =>
                                      handleUpdateItemStatus(section.id, item.id, e.target.value as ItemStatus)
                                    }
                                    className={`w-full sm:w-auto text-xs font-bold rounded-lg border px-2.5 py-1.5 transition-colors cursor-pointer shadow-xs focus:outline-hidden ${
                                      item.status === 'yes'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                        : item.status === 'no'
                                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                                        : 'border-slate-300 bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <option value="yes">✓ Yes</option>
                                    <option value="no">✗ No</option>
                                    <option value="na">− NA</option>
                                  </select>
                                </div>
                              ) : item.statusType === 'ok_faulty' ? (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                  <select
                                    aria-label={`Status for ${item.name}`}
                                    value={item.status}
                                    onChange={(e) =>
                                      handleUpdateItemStatus(section.id, item.id, e.target.value as ItemStatus)
                                    }
                                    className={`w-full sm:w-auto text-xs font-bold rounded-lg border px-2.5 py-1.5 transition-colors cursor-pointer shadow-xs focus:outline-hidden ${
                                      item.status === 'ok'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                        : item.status === 'faulty'
                                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                                        : 'border-slate-300 bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <option value="ok">✓ OK</option>
                                    <option value="faulty">✗ Faulty</option>
                                    <option value="na">− NA</option>
                                  </select>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                  <select
                                    aria-label={`Status for ${item.name}`}
                                    value={item.status}
                                    onChange={(e) =>
                                      handleUpdateItemStatus(section.id, item.id, e.target.value as ItemStatus)
                                    }
                                    className={`w-full sm:w-auto text-xs font-bold rounded-lg border px-2.5 py-1.5 transition-colors cursor-pointer shadow-xs focus:outline-hidden ${
                                      item.status === 'good'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                        : item.status === 'repair'
                                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                                        : item.status === 'replace'
                                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                                        : 'border-slate-300 bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <option value="good">✓ Good</option>
                                    <option value="repair">⚠ Repair Required</option>
                                    <option value="replace">✗ Replace Immediately</option>
                                    <option value="na">− NA (Not Applicable)</option>
                                  </select>
                                </div>
                              )}
                            </td>

                            {/* Photos linked to this item */}
                            <td className="py-2.5 px-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {itemPhotos.length > 0 && (
                                  <span className="font-mono-numbers text-[11px] font-bold text-blue-600">
                                    {itemPhotos.length} 📷
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePhotoSn(item.sn);
                                    setIsPhotoModalOpen(true);
                                  }}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                                  title="Add Photo for this item"
                                >
                                  <Camera className="h-4 w-4" />
                                </button>
                              </div>
                            </td>

                            {/* Delete Item */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="text-slate-300 hover:text-rose-600 p-0.5"
                                title="Remove line item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    onClick={() => handleAddItemToSection(section.id)}
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add item to {section.title}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Photographic Evidence Gallery */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Attached Photographic Evidence ({report.photos.length})
            </h3>
            <p className="text-xs text-slate-500">
              Photos attached here are automatically embedded with item callouts into the generated PDF report.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActivePhotoSn(undefined);
              setIsPhotoModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Camera className="h-4 w-4" />
            Attach Photo
          </button>
        </div>

        {report.photos.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No inspection photos attached yet. Tap "Attach Photo" above to add geotagged site verification photos.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {report.photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:shadow-xs"
              >
                <div
                  className="relative cursor-pointer overflow-hidden"
                  onClick={() => setEditorLightboxPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="rounded-md bg-slate-900/80 px-2 py-1 text-[11px] font-semibold text-white flex items-center gap-1 shadow-xs">
                      <ZoomIn className="h-3 w-3" /> Inspect Detail
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 rounded-full bg-slate-950/70 p-1.5 text-white hover:bg-rose-600 transition-colors shadow-xs"
                  title="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="p-2.5 bg-white">
                  {photo.snItem ? (
                    <div className="text-[11px] font-bold text-slate-900">
                      SN {photo.snItem}. {photo.itemName || 'Checklist Item'}
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-slate-900">General Overview</div>
                  )}
                  <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{photo.caption}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono-numbers">
                    <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => setEditorLightboxPhoto(photo)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View Full Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary, Condition & Business Fields */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          Executive Summary &amp; Machinery Condition
        </h3>

        {/* Additional Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Additional Notes / Recommendations</label>
          <textarea
            value={report.summary.additionalNotes}
            onChange={(e) =>
              setReport({
                ...report,
                summary: { ...report.summary, additionalNotes: e.target.value },
              })
            }
            placeholder="Technical remarks, maintenance timeline, parts to order..."
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden"
          />
        </div>

        {/* Condition Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Overall Condition</label>
            <select
              value={report.summary.overallCondition}
              onChange={(e) =>
                setReport({
                  ...report,
                  summary: { ...report.summary, overallCondition: e.target.value as any },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 font-semibold focus:border-slate-900 focus:outline-hidden"
            >
              <option value="Excellent Condition">Excellent Condition</option>
              <option value="Good Condition">Good Condition</option>
              <option value="A little wear">A little wear</option>
              <option value="Minor Repair required">Minor Repair required</option>
              <option value="Major Repair required">Major Repair required</option>
              <option value="Critical - Shut Down Immediately">Critical - Shut Down Immediately</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Asset Safe to Use?</label>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setReport({
                    ...report,
                    summary: { ...report.summary, assetSafeToUse: true },
                  })
                }
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                  report.summary.assetSafeToUse
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                YES (SAFE)
              </button>
              <button
                type="button"
                onClick={() =>
                  setReport({
                    ...report,
                    summary: { ...report.summary, assetSafeToUse: false },
                  })
                }
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                  !report.summary.assetSafeToUse
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                NO (UNSAFE)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Maintenance Priority</label>
            <select
              value={report.summary.maintenancePriority}
              onChange={(e) =>
                setReport({
                  ...report,
                  summary: { ...report.summary, maintenancePriority: e.target.value as any },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 font-semibold focus:border-slate-900 focus:outline-hidden"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent Priority (Immediate Action)</option>
            </select>
          </div>
        </div>

        {/* Custom Business Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Client / Plant Name</label>
            <input
              type="text"
              value={report.summary.customBusinessFields.clientName}
              onChange={(e) =>
                setReport({
                  ...report,
                  summary: {
                    ...report.summary,
                    customBusinessFields: {
                      ...report.summary.customBusinessFields,
                      clientName: e.target.value,
                    },
                  },
                })
              }
              placeholder="e.g. Robert (Albany Pietermaritzburg)"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Contact Details / Phone</label>
            <input
              type="text"
              value={report.summary.customBusinessFields.contactDetails}
              onChange={(e) =>
                setReport({
                  ...report,
                  summary: {
                    ...report.summary,
                    customBusinessFields: {
                      ...report.summary.customBusinessFields,
                      contactDetails: e.target.value,
                    },
                  },
                })
              }
              placeholder="e.g. 0114620044"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Dual Digital Signature Blocks */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          Digital Signatures &amp; Acceptance
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Dale Technician Signature */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Dale Lead Technician Signature</span>
              <button
                type="button"
                onClick={() => setSignatureModalType('technician')}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <PenTool className="h-3.5 w-3.5" />
                {report.signatures.technician.signatureImage ? 'Re-sign' : 'Capture Signature'}
              </button>
            </div>

            <div className="mt-3 flex h-24 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-2">
              {report.signatures.technician.signatureImage ? (
                <img
                  src={report.signatures.technician.signatureImage}
                  alt="Technician Signature"
                  className="max-h-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">No signature captured</span>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-600">
              <div className="font-semibold text-slate-900">
                {report.signatures.technician.signedByName || report.inspectorName}
              </div>
              <div className="text-slate-400">
                {report.signatures.technician.designation || 'Lead Commissioning Engineer'}
              </div>
            </div>
          </div>

          {/* Client Plant Signature */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Client / Plant Representative Signature</span>
              <button
                type="button"
                onClick={() => setSignatureModalType('client')}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <PenTool className="h-3.5 w-3.5" />
                {report.signatures.client.signatureImage ? 'Re-sign' : 'Capture Signature'}
              </button>
            </div>

            <div className="mt-3 flex h-24 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-2">
              {report.signatures.client.signatureImage ? (
                <img
                  src={report.signatures.client.signatureImage}
                  alt="Client Signature"
                  className="max-h-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">No signature captured</span>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-600">
              <div className="font-semibold text-slate-900">
                {report.signatures.client.signedByName || report.summary.customBusinessFields.clientName || 'Client Representative'}
              </div>
              <div className="text-slate-400">
                {report.signatures.client.designation || 'Plant Maintenance Engineer'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Capture Modal */}
      <SignaturePadModal
        isOpen={Boolean(signatureModalType)}
        onClose={() => setSignatureModalType(null)}
        title={
          signatureModalType === 'technician'
            ? 'Dale Technician Digital Signature'
            : 'Client Plant Representative Digital Signature'
        }
        signeeLabel={signatureModalType === 'technician' ? 'Technician' : 'Client'}
        initialData={
          signatureModalType === 'technician'
            ? report.signatures.technician
            : report.signatures.client
        }
        onSave={handleSaveSignature}
      />

      {/* Photo Attachment Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        sections={report.sections}
        initialSnItem={activePhotoSn}
        onAddPhoto={handleAddPhoto}
        currentGps={{ latitude: report.gps.latitude, longitude: report.gps.longitude }}
      />

      {/* In-app Delete Confirmation Modal */}
      <DeleteConfirmationModal
        report={report}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* High Resolution Detail Verification Lightbox */}
      {editorLightboxPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setEditorLightboxPhoto(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setEditorLightboxPhoto(null)}
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800 z-10"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={editorLightboxPhoto.url}
              alt={editorLightboxPhoto.caption}
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 text-center text-xs text-slate-200">
              <span className="font-bold">
                {editorLightboxPhoto.snItem ? `Item #${editorLightboxPhoto.snItem}: ${editorLightboxPhoto.itemName || ''} · ` : ''}
              </span>
              <span>{editorLightboxPhoto.caption}</span>
              {editorLightboxPhoto.gps && (
                <div className="text-[11px] text-sky-400 font-mono-numbers mt-0.5">
                  GPS: {editorLightboxPhoto.gps.latitude.toFixed(4)}, {editorLightboxPhoto.gps.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

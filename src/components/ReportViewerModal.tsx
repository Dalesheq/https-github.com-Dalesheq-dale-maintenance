import React, { useState } from 'react';
import { X, Download, Printer, Edit, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, MapPin, Trash2 } from 'lucide-react';
import { Report } from '../types';
import { generateDaleAutomationPDF } from '../utils/pdfGenerator';
import { storageService } from '../services/storageService';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface ReportViewerModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (report: Report) => void;
  onDelete?: (reportId: string) => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  report,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!isOpen || !report) return null;

  const isAdmin = storageService.isAdmin();

  const handleConfirmDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      storageService.deleteReport(id);
    }
    setShowDeleteModal(false);
    onClose();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const pdf = await generateDaleAutomationPDF(report);
      pdf.save(`${report.reportNumber.replace(/\s+/g, '_')}_Official_Report.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-xl border border-slate-300 bg-white shadow-2xl">
        {/* Sticky Header with Actions */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 font-mono-numbers">{report.reportNumber}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">{report.title}</span>
            {isAdmin && (
              <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-extrabold text-purple-800 uppercase">
                Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
              title="Permanently delete this report"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Report
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(report);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Edit className="h-3.5 w-3.5 text-slate-500" />
              Edit
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              Print
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Report Content - High-Fidelity Official Dale Automation PDF Simulation */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 space-y-6">
          {/* Header Row */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Dale Automation</h1>
              <h2 className="mt-1 text-base font-bold text-slate-800">{report.title}</h2>
            </div>

            {/* Dale Automation Logo Graphic */}
            <div className="flex items-center gap-1.5 text-right">
              <div className="flex flex-col items-end">
                <span className="text-xs font-black tracking-widest text-rose-600">DALE</span>
                <span className="text-[10px] font-black tracking-wider text-blue-600">AUTOMATION</span>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                DA
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-xs">
            {/* Inspection Details */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                Inspection Details
              </h3>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Report #:</span> <span className="font-bold font-mono-numbers">{report.reportNumber}</span></div>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Location:</span> <span>{report.location}</span></div>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Inspection Date:</span> <span className="font-mono-numbers">{report.inspectionDate}</span></div>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Inspector Name:</span> <span className="font-semibold">{report.inspectorName}</span></div>
              {report.gps && (
                <div className="flex items-center gap-1 text-sky-700 font-medium pt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono-numbers text-[11px]">
                    GPS Verified: {report.gps.facilityName} ({report.gps.latitude.toFixed(4)}, {report.gps.longitude.toFixed(4)})
                  </span>
                </div>
              )}
            </div>

            {/* Asset Details */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                Asset Details
              </h3>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Asset Category:</span> <span>{report.assetDetails.category}</span></div>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Asset Name:</span> <span className="font-semibold">{report.assetDetails.name}</span></div>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Asset #:</span> <span className="font-mono-numbers font-semibold">{report.assetDetails.assetNumber}</span></div>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Meter Reading:</span> <span className="font-mono-numbers">{report.assetDetails.meterReading}</span></div>
              <div className="flex"><span className="w-28 text-slate-500 font-medium">Model / Year:</span> <span>{report.assetDetails.modelYear}</span></div>
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="space-y-6">
            {report.sections.map((section) => (
              <div key={section.id} className="border border-slate-300 rounded-lg overflow-hidden page-break-inside-avoid">
                <div className="bg-slate-100 px-3 py-2 font-bold text-xs text-slate-900 border-b border-slate-300">
                  {section.title}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-[10px] font-bold text-slate-700">
                        <th className="py-1.5 px-2 w-10 text-center">SN</th>
                        <th className="py-1.5 px-2 min-w-[140px]">Inspection Item</th>
                        <th className="py-1.5 px-2 min-w-[160px]">Note</th>
                        <th className="py-1.5 px-2 text-center w-14">Good</th>
                        <th className="py-1.5 px-2 text-center w-14">Repair</th>
                        <th className="py-1.5 px-2 text-center w-14">Replace</th>
                        <th className="py-1.5 px-2 text-center w-10">NA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {section.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-2 text-center font-bold text-slate-600 font-mono-numbers">
                            {item.sn}
                          </td>
                          <td className="py-1.5 px-2 font-medium text-slate-900">{item.name}</td>
                          <td className="py-1.5 px-2 text-slate-600">
                            {item.notes || '—'}
                            {item.readings && (
                              <div className="font-semibold text-blue-700 font-mono-numbers">{item.readings}</div>
                            )}
                          </td>
                          {/* Good */}
                          <td className="py-1.5 px-2 text-center">
                            {item.status === 'good' || item.status === 'pass' || item.status === 'yes' || item.status === 'ok' ? (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="text-slate-300">○</span>
                            )}
                          </td>
                          {/* Repair */}
                          <td className="py-1.5 px-2 text-center">
                            {item.status === 'repair' ? (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                ⚠
                              </span>
                            ) : (
                              <span className="text-slate-300">○</span>
                            )}
                          </td>
                          {/* Replace / Fail / No / Faulty */}
                          <td className="py-1.5 px-2 text-center">
                            {item.status === 'replace' || item.status === 'fail' || item.status === 'no' || item.status === 'faulty' ? (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold">
                                ✕
                              </span>
                            ) : (
                              <span className="text-slate-300">○</span>
                            )}
                          </td>
                          {/* NA */}
                          <td className="py-1.5 px-2 text-center">
                            {item.status === 'na' ? (
                              <span className="font-bold text-slate-600">—</span>
                            ) : (
                              <span className="text-slate-300">○</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Photo Evidence Embeds */}
          {report.photos && report.photos.length > 0 && (
            <div className="space-y-4 page-break-inside-avoid">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Photographic Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {report.photos.map((photo, i) => (
                  <div key={photo.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="h-40 w-full object-cover rounded border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="mt-2 text-[11px]">
                      <span className="font-bold text-slate-900">
                        {photo.snItem ? `${photo.snItem}. ${photo.itemName || ''}` : `Evidence #${i + 1}`}
                      </span>
                      <p className="text-slate-600 text-[10px] mt-0.5">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Box */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/50 space-y-3 page-break-inside-avoid">
            <div>
              <span className="font-bold text-xs text-slate-900">Additional Note:</span>
              <p className="mt-1 text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                {report.summary.additionalNotes || 'No additional note provided.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 w-36">Overall Condition:</span>
                  <span className="font-bold text-slate-900">{report.summary.overallCondition}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 w-36">Asset Safe to Use:</span>
                  {report.summary.assetSafeToUse ? (
                    <span className="bg-emerald-600 text-white font-bold px-3 py-0.5 rounded text-xs">
                      YES
                    </span>
                  ) : (
                    <span className="bg-rose-600 text-white font-bold px-3 py-0.5 rounded text-xs">
                      NO
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 w-36">Maintenance Required:</span>
                  <span className="font-bold">{report.summary.maintenanceRequired ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 w-36">Asset Status:</span>
                  <span className="font-bold">{report.summary.assetStatus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 w-36">Maintenance Priority:</span>
                  <span className="font-bold">{report.summary.maintenancePriority}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Custom Business Fields
                </div>
                <div>
                  <span className="text-slate-500">Client Name : </span>
                  <span className="font-semibold text-slate-900">{report.summary.customBusinessFields.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Contact details : </span>
                  <span className="font-mono-numbers">{report.summary.customBusinessFields.contactDetails}</span>
                </div>
                {report.managerApproval && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                    <span className="font-bold">Manager Approval: </span>
                    {report.managerApproval.approvedBy} ({report.managerApproval.decision.toUpperCase()})
                    <div className="text-[11px] text-blue-700 italic mt-0.5">"{report.managerApproval.notes}"</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dual Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 page-break-inside-avoid">
            <div>
              <div className="h-16 flex items-end justify-center pb-1">
                {report.signatures.technician.signatureImage ? (
                  <img
                    src={report.signatures.technician.signatureImage}
                    alt="Dale Tech Sig"
                    className="max-h-14 object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-300 italic">Signature pending</span>
                )}
              </div>
              <div className="border-t border-slate-900 pt-1 text-center">
                <div className="text-xs font-bold text-slate-900">Dale Technician Signature</div>
                <div className="text-[10px] text-slate-500">{report.signatures.technician.signedByName || report.inspectorName}</div>
              </div>
            </div>

            <div>
              <div className="h-16 flex items-end justify-center pb-1">
                {report.signatures.client.signatureImage ? (
                  <img
                    src={report.signatures.client.signatureImage}
                    alt="Client Sig"
                    className="max-h-14 object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-300 italic">Signature pending</span>
                )}
              </div>
              <div className="border-t border-slate-900 pt-1 text-center">
                <div className="text-xs font-bold text-slate-900">Client Signature</div>
                <div className="text-[10px] text-slate-500">{report.signatures.client.signedByName || report.summary.customBusinessFields.clientName || 'Client Representative'}</div>
              </div>
            </div>
          </div>

          {/* Official Footer */}
          <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[11px] text-slate-600">
            <span>Prepared By:{report.preparedBy || 'sheq@spiralsystems.co.za'}</span>
            <span className="font-bold">{report.website || 'www.daleautomation.co.za'}</span>
          </div>
        </div>
      </div>

      {/* In-app Delete Confirmation Modal (no window.confirm block) */}
      <DeleteConfirmationModal
        report={report}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

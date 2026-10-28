import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  Play,
  X,
  FileCode,
  Sparkles,
  HelpCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { ReportTemplate } from '../data/reportTemplates';
import { storageService } from '../services/storageService';
import {
  importTemplateFromFile,
  downloadSampleTemplate,
  ImportPreviewResult,
} from '../utils/templateImporter';

interface TemplateImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateImportedAndSaved?: (template: ReportTemplate) => void;
  onStartReportWithTemplate?: (template: ReportTemplate) => void;
}

export const TemplateImportModal: React.FC<TemplateImportModalProps> = ({
  isOpen,
  onClose,
  onTemplateImportedAndSaved,
  onStartReportWithTemplate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportPreviewResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set());

  // Editable fields for user tweaking prior to saving
  const [editableTitle, setEditableTitle] = useState('');
  const [editableCategory, setEditableCategory] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const result = await importTemplateFromFile(file);
      setImportResult(result);
      setEditableTitle(result.template.title);
      setEditableCategory(result.template.defaultCategory);
      setEditableDescription(result.template.description);
      // Expand first 2 sections by default
      const defaultExpanded = new Set<string>(
        result.template.sections.slice(0, 2).map((s) => s.id)
      );
      setExpandedSectionIds(defaultExpanded);
    } catch (err: any) {
      console.error('Template import error:', err);
      setErrorMessage(
        err.message || 'Failed to parse file. Please verify it is a valid PDF, Excel, or CSV inspection checklist.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSection = (sectionId: string) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleSaveToDatabase = () => {
    if (!importResult) return;

    const finalizedTemplate: ReportTemplate = {
      ...importResult.template,
      title: editableTitle.trim() || importResult.template.title,
      defaultCategory: editableCategory.trim() || importResult.template.defaultCategory,
      description: editableDescription.trim() || importResult.template.description,
    };

    // Save directly to storageService custom templates database
    storageService.saveCustomTemplate(finalizedTemplate);
    setSavedSuccess(true);

    if (onTemplateImportedAndSaved) {
      onTemplateImportedAndSaved(finalizedTemplate);
    }
  };

  const handleStartReportNow = () => {
    if (!importResult) return;
    const finalizedTemplate: ReportTemplate = {
      ...importResult.template,
      title: editableTitle.trim() || importResult.template.title,
      defaultCategory: editableCategory.trim() || importResult.template.defaultCategory,
      description: editableDescription.trim() || importResult.template.description,
    };
    storageService.saveCustomTemplate(finalizedTemplate);
    if (onStartReportWithTemplate) {
      onStartReportWithTemplate(finalizedTemplate);
    }
    onClose();
  };

  const handleLoadDemoSpreadsheet = async () => {
    // Generate an in-memory sample CSV and parse it immediately
    const sampleCsv = `Section,SN,Inspection Item,Notes / Acceptance Criteria,Status Type
1. Friction Drive & Drum Assembly,1,SEW-Eurodrive Helical Bevel Gearmotor,Check oil level in sight glass and operating temperature under full load,good_repair_replace
1. Friction Drive & Drum Assembly,2,Drum Cage Bar HDPE Wear Strips,Wear strip thickness > 3mm. Fastening screws recessed and flush,good_repair_replace
1. Friction Drive & Drum Assembly,3,Main Drum Center Shaft Bearings,Listen for cavitation or vibration. Check auto-greaser delivery,good_repair_replace
2. Conveyor Belt & Tiers,4,Modular Plastic / Stainless Steel Belt Condition,No missing retaining pins or cracked link hinge modules,good_repair_replace
2. Conveyor Belt & Tiers,5,Take-Up Counterweight & Guide Idlers,Belt tension correct across all 24 tiers. Guide shoes free of grooving,good_repair_replace
3. CIP & Sanitation Systems,6,Rotary Spray Headers & Nozzle Orifices,All 36 CIP nozzles spray unblocked flat-fan pattern,pass_fail
3. CIP & Sanitation Systems,7,Chemical Dosing Pumps & Solenoid Valves,Check dosing valve actuation during 2-minute sanitize cycle,pass_fail
4. Control Panel & Safety Interlocks,8,Emergency Stop Pushbuttons & Perimeter Pull Cords,Test all 6 E-stops; verify safety circuit drops out drive within 1.2s,pass_fail
4. Control Panel & Safety Interlocks,9,Omron / Siemens HMI Alarm Logs,Verify alarm log cleared and passwords set for level 2 maintenance,ok_faulty
4. Control Panel & Safety Interlocks,10,Main Enclosure Cable Glanding & IP65 Gasket,All cable duct neat and enclosure seals intact without moisture ingress,ok_faulty`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const demoFile = new File([blob], 'Dale_Automation_Spiral_Freezer_Commissioning.csv', {
      type: 'text/csv',
    });
    await processSelectedFile(demoFile);
  };

  const handleReset = () => {
    setImportResult(null);
    setErrorMessage(null);
    setSavedSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Import Inspection Checklist Template</h2>
                <span className="rounded bg-red-800/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-red-200">
                  PDF · Excel · CSV
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automatically convert existing checklists, OEM spec sheets, or spreadsheets into ready-to-use Dale Automation templates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!importResult ? (
            /* Upload Zone State */
            <div className="space-y-6">
              {/* Drag and Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-red-500 bg-red-50/50 scale-[0.99]'
                    : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm text-red-600">
                  {isProcessing ? (
                    <RefreshCw className="h-8 w-8 animate-spin text-red-600" />
                  ) : (
                    <UploadCloud className="h-8 w-8" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isProcessing ? 'Analyzing & Converting Document...' : 'Click or drag file here to import'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md">
                    Accepts <strong>PDF</strong> inspection sheets, <strong>Excel (.xlsx, .xls)</strong> workbooks, and <strong>CSV (.csv)</strong> checklists.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                    <FileText className="h-4 w-4 text-rose-500" />
                    PDF Documents
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    Excel Spreadsheets
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                    <FileCode className="h-4 w-4 text-blue-600" />
                    CSV Checklists
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900">Import Error</h4>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Sample Files and Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Format Guidance */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-slate-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Recommended Column Layout
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    For spreadsheets (Excel &amp; CSV), columns are automatically detected regardless of exact names:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                    <li>• <strong>Section</strong>: Area or subsystem heading</li>
                    <li>• <strong>SN</strong>: Checkpoint numbering (1, 2, 3...)</li>
                    <li>• <strong>Inspection Item</strong>: Component or check name</li>
                    <li>• <strong>Notes</strong>: Acceptance criteria or tolerance</li>
                    <li>• <strong>Status Type</strong>: <em>good_repair_replace, pass_fail, yes_no, ok_faulty</em></li>
                  </ul>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => downloadSampleTemplate('xlsx')}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-600" />
                      Sample Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSampleTemplate('csv')}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-600" />
                      Sample CSV
                    </button>
                  </div>
                </div>

                {/* Instant Try Demo */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Quick Test Sample
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Don't have a template file handy right now? Load our factory-grade Dale Automation Spiral Cooler Commissioning sample to see the instant conversion in action.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadDemoSpreadsheet}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Load Sample Inspection Sheet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Parsed Preview State */
            <div className="space-y-6">
              {/* Success Banner if Saved */}
              {savedSuccess && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Template Added to Database!
                      </h4>
                      <p className="text-xs text-emerald-800">
                        "{editableTitle}" is now permanently stored in the Dale Automation inspection templates library and can be used for new reports.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartReportNow}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Report Now
                  </button>
                </div>
              )}

              {/* File Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                    {importResult.sourceFormat === 'pdf' ? (
                      <FileText className="h-5 w-5 text-rose-500" />
                    ) : importResult.sourceFormat === 'excel' ? (
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <FileCode className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{importResult.fileName}</span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        {importResult.sourceFormat.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Successfully detected <strong>{importResult.totalSections}</strong> sections and{' '}
                      <strong>{importResult.totalItems}</strong> inspection checkpoints
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  Import Another File
                </button>
              </div>

              {/* Template Metadata Configuration */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Database className="h-4 w-4 text-red-600" />
                  Template Registration Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Template Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-red-500 focus:outline-hidden"
                      placeholder="e.g. Spiral Freezer 24-Tier Commissioning"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Equipment Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editableCategory}
                      onChange={(e) => setEditableCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:outline-hidden"
                      placeholder="e.g. Double Drum Spiral Cooling System"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Scope &amp; Description
                    </label>
                    <input
                      type="text"
                      value={editableDescription}
                      onChange={(e) => setEditableDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:outline-hidden"
                      placeholder="Description of inspection standards and equipment specifications"
                    />
                  </div>
                </div>
              </div>

              {/* Sections & Items Inspection Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-600" />
                    Parsed Checklist Structure ({importResult.template.sections.length} Sections)
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    Click section to expand / collapse
                  </div>
                </div>

                <div className="space-y-2">
                  {importResult.template.sections.map((section, sIndex) => {
                    const isExpanded = expandedSectionIds.has(section.id);
                    return (
                      <div
                        key={section.id}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                      >
                        <div
                          onClick={() => handleToggleSection(section.id)}
                          className="flex items-center justify-between bg-slate-50/80 px-4 py-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-500" />
                            )}
                            <span className="text-xs font-bold text-slate-900">
                              {section.title}
                            </span>
                          </div>
                          <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {section.items.length} checks
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-slate-100 divide-y divide-slate-100">
                            {section.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start justify-between gap-4 px-4 py-2.5 text-xs hover:bg-slate-50/50"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className="font-mono text-[11px] font-bold text-slate-400 mt-0.5 shrink-0">
                                    #{item.sn}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 leading-snug">
                                      {item.name}
                                    </div>
                                    {item.notes && (
                                      <div className="text-[11px] text-slate-500 mt-0.5">
                                        Criteria: {item.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      item.statusType === 'pass_fail'
                                        ? 'bg-blue-100 text-blue-800'
                                        : item.statusType === 'yes_no'
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : item.statusType === 'ok_faulty'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {item.statusType === 'good_repair_replace'
                                      ? 'Good / Repair / Replace'
                                      : item.statusType === 'pass_fail'
                                      ? 'Pass / Fail'
                                      : item.statusType === 'yes_no'
                                      ? 'Yes / No'
                                      : item.statusType === 'ok_faulty'
                                      ? 'OK / Faulty'
                                      : 'Readings'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {savedSuccess ? 'Close' : 'Cancel'}
          </button>

          {importResult && (
            <div className="flex items-center gap-3">
              {!savedSuccess ? (
                <button
                  type="button"
                  onClick={handleSaveToDatabase}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs"
                >
                  <Database className="h-4 w-4" />
                  Save &amp; Add to Database
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartReportNow}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs"
                >
                  <Play className="h-4 w-4" />
                  Create New Report with This Template
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

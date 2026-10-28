import React, { useState } from 'react';
import { ChecklistSection, ChecklistItem, StatusType } from '../types';
import { ReportTemplate } from '../data/reportTemplates';
import { PREPOPULATED_DALE_COMPONENTS, DALE_COMPONENT_CATEGORIES, PrepopulatedComponent } from '../data/daleComponentLibrary';
import { storageService } from '../services/storageService';
import {
  Wrench,
  Plus,
  Trash2,
  Save,
  Play,
  Search,
  CheckCircle2,
  FolderPlus,
  Sparkles,
  Layers,
  ChevronRight,
  Sliders,
  Copy,
  Clock,
  Check,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { TemplateImportModal } from './TemplateImportModal';

interface CustomTemplateBuilderProps {
  onStartReportWithTemplate: (template: ReportTemplate) => void;
  onNavigateToReports: () => void;
}

export const CustomTemplateBuilder: React.FC<CustomTemplateBuilderProps> = ({
  onStartReportWithTemplate,
  onNavigateToReports,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [templateTitle, setTemplateTitle] = useState('Custom Plant Line Inspection');
  const [assetCategory, setAssetCategory] = useState('Spiral Cooler & Material Handling Line');
  const [modelYear, setModelYear] = useState('Dale Automation 2026');
  const [description, setDescription] = useState('Custom preventative maintenance and commissioning checklist.');

  // Current working sections
  const [sections, setSections] = useState<ChecklistSection[]>([
    {
      id: 'sec-custom-1',
      title: '1. Drive & Mechanical Transmission',
      items: [
        {
          id: 'item-init-1',
          sn: 1,
          name: 'Main Drive SEW Eurodrive Gearmotor & Oil Level',
          notes: 'SEW gearmotor quiet under load; oil level verified in sight glass.',
          status: 'good',
          statusType: 'good_repair_replace',
        },
        {
          id: 'item-init-2',
          sn: 2,
          name: 'Drum Bar & Rail HDPE Wear Strips',
          notes: 'Wear strip thickness within Dale Automation 3mm tolerance limit.',
          status: 'good',
          statusType: 'good_repair_replace',
        },
      ],
    },
    {
      id: 'sec-custom-2',
      title: '2. Safety & Interlock Circuits',
      items: [
        {
          id: 'item-init-3',
          sn: 3,
          name: 'Emergency Stop Pushbuttons & Pull Cords',
          notes: 'All perimeter E-stops and tensioned pull cords tested.',
          status: 'pass',
          statusType: 'pass_fail',
        },
      ],
    },
  ]);

  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ReportTemplate[]>(storageService.getCustomTemplates());
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<PrepopulatedComponent | null>(null);

  // Filter library components
  const filteredLibrary = PREPOPULATED_DALE_COMPONENTS.filter((comp) => {
    const matchesCategory = activeCategory === 'All' || comp.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.defaultSection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate total items
  const totalItemsCount = sections.reduce((acc, s) => acc + s.items.length, 0);

  // Add pre-populated component to current template
  const handleAddPrepopulatedComponent = (comp: PrepopulatedComponent) => {
    // Check if a section matching comp.defaultSection exists, else create it or add to last
    setSections((prev) => {
      let targetSectionIndex = prev.findIndex(
        (s) => s.title.toLowerCase().includes(comp.defaultSection.toLowerCase().slice(0, 10))
      );

      const maxSn = Math.max(0, ...prev.flatMap((s) => s.items.map((i) => i.sn)));
      const newItem: ChecklistItem = {
        id: `cst-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sn: maxSn + 1,
        name: comp.name,
        notes: comp.defaultNotes || '',
        status: comp.defaultStatusType === 'pass_fail' ? 'pass' : comp.defaultStatusType === 'yes_no' ? 'yes' : comp.defaultStatusType === 'ok_faulty' ? 'ok' : 'good',
        statusType: comp.defaultStatusType,
      };

      if (targetSectionIndex >= 0) {
        const updated = [...prev];
        updated[targetSectionIndex] = {
          ...updated[targetSectionIndex],
          items: [...updated[targetSectionIndex].items, newItem],
        };
        return updated;
      } else {
        // Create new section with this item
        const newSec: ChecklistSection = {
          id: `sec-${Date.now()}`,
          title: `${prev.length + 1}. ${comp.defaultSection}`,
          items: [newItem],
        };
        return [...prev, newSec];
      }
    });

    setSavedSuccessMessage(`Added "${comp.name}" to checklist.`);
    setTimeout(() => setSavedSuccessMessage(null), 2500);
  };

  // Add a blank custom section
  const handleAddSection = () => {
    const newSec: ChecklistSection = {
      id: `sec-${Date.now()}`,
      title: `${sections.length + 1}. New Inspection Section`,
      items: [],
    };
    setSections([...sections, newSec]);
  };

  // Remove section
  const handleRemoveSection = (sectionId: string) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    // Renumber SNs
    let currentSn = 1;
    const renumbered = updated.map((sec) => ({
      ...sec,
      items: sec.items.map((item) => ({ ...item, sn: currentSn++ })),
    }));
    setSections(renumbered);
  };

  // Update section title
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map((s) => (s.id === sectionId ? { ...s, title } : s)));
  };

  // Add blank item to section
  const handleAddItemToSection = (sectionId: string) => {
    const maxSn = Math.max(0, ...sections.flatMap((s) => s.items.map((i) => i.sn)));
    const newItem: ChecklistItem = {
      id: `cst-item-${Date.now()}`,
      sn: maxSn + 1,
      name: 'Custom Inspection Check',
      notes: '',
      status: 'good',
      statusType: 'good_repair_replace',
    };

    setSections(
      sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: [...sec.items, newItem],
        };
      })
    );
  };

  // Remove item
  const handleRemoveItem = (sectionId: string, itemId: string) => {
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        items: sec.items.filter((i) => i.id !== itemId),
      };
    });

    let currentSn = 1;
    const renumbered = updated.map((sec) => ({
      ...sec,
      items: sec.items.map((item) => ({ ...item, sn: currentSn++ })),
    }));
    setSections(renumbered);
  };

  // Update item field
  const handleUpdateItem = (
    sectionId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ) => {
    setSections(
      sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, ...updates };
          }),
        };
      })
    );
  };

  // Build the template object
  const buildCurrentTemplate = (customTypeId?: string): ReportTemplate => {
    const typeId = customTypeId || `custom_${Date.now()}`;
    return {
      type: typeId,
      title: templateTitle.trim() || 'Custom Machinery Inspection',
      defaultCategory: assetCategory.trim() || 'Heavy Industrial Equipment',
      description: description.trim() || 'Custom checklist built by technician.',
      defaultModelYear: modelYear.trim() || 'Dale Automation',
      sections: sections,
    };
  };

  // Save template
  const handleSaveTemplate = () => {
    if (sections.length === 0 || totalItemsCount === 0) {
      setErrorMessage('Please add at least one section and checklist item before saving.');
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }
    const template = buildCurrentTemplate();
    storageService.saveCustomTemplate(template);
    setCustomTemplates(storageService.getCustomTemplates());
    setSavedSuccessMessage(`Template "${template.title}" saved successfully to database!`);
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  // Save & Start
  const handleSaveAndStart = () => {
    if (sections.length === 0 || totalItemsCount === 0) {
      setErrorMessage('Please add at least one section and checklist item before starting.');
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }
    const template = buildCurrentTemplate();
    storageService.saveCustomTemplate(template);
    onStartReportWithTemplate(template);
  };

  // Load a previously saved template for editing
  const handleLoadCustomTemplate = (tpl: ReportTemplate) => {
    setTemplateTitle(tpl.title);
    setAssetCategory(tpl.defaultCategory);
    setModelYear(tpl.defaultModelYear);
    setDescription(tpl.description);
    setSections(JSON.parse(JSON.stringify(tpl.sections)));
    setSavedSuccessMessage(`Loaded "${tpl.title}"`);
    setTimeout(() => setSavedSuccessMessage(null), 2500);
  };

  // Delete a saved custom template
  const handleDeleteCustomTemplate = (templateType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteCustomTemplate(templateType);
    setCustomTemplates(storageService.getCustomTemplates());
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
                <Sliders className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Custom Inspection Sheet Builder
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Build custom Dale Automation check sheets using pre-populated industrial machinery components or import existing PDF, Excel, and CSV templates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <UploadCloud className="h-4 w-4 text-red-600" />
              Import File (PDF / Excel / CSV)
            </button>
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Save className="h-4 w-4 text-slate-600" />
              Save Template
            </button>
            <button
              type="button"
              onClick={handleSaveAndStart}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Play className="h-4 w-4" />
              Start Inspection Now
            </button>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Banner */}
        {savedSuccessMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Column = Prepopulated Library | Right Column = Live Checklist Canvas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Pre-Populated Component Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-red-600" />
                  Pre-Populated Component Library
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any verified Dale part to add with pre-filled technical notes &amp; dropdown type.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {filteredLibrary.length} parts
              </span>
            </div>

            {/* Search Input */}
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search components (e.g. oiler, bearing, flame, proxy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-red-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Category Segmented Filter */}
            <div className="mt-3 flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  activeCategory === 'All'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Components
              </button>
              {DALE_COMPONENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    activeCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Component Cards List */}
            <div className="mt-4 space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredLibrary.map((comp) => {
                const isSelected = selectedLibraryItem?.id === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedLibraryItem(comp)}
                    className={`group rounded-lg border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-red-500 bg-red-50/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                            {comp.category}
                          </span>
                          <span className="text-slate-300 text-[10px]">·</span>
                          <span className="text-[10px] text-slate-500">
                            {comp.defaultSection}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 mt-1">
                          {comp.name}
                        </h4>
                        {comp.defaultNotes && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                            "{comp.defaultNotes}"
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddPrepopulatedComponent(comp);
                        }}
                        className="shrink-0 flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-600 transition-colors shadow-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </div>

                    {/* Pre-populated Suggested Issues Preview */}
                    {isSelected && comp.suggestedIssues.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Pre-Populated Failure Observations:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {comp.suggestedIssues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Saved Custom Templates Quick Selector */}
          {customTemplates.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                <FolderPlus className="h-4 w-4 text-slate-600" />
                Saved Custom Inspection Sheets ({customTemplates.length})
              </h3>
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {customTemplates.map((tpl) => (
                  <div
                    key={tpl.type}
                    onClick={() => handleLoadCustomTemplate(tpl)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-red-300 transition-colors cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                        {tpl.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {tpl.defaultCategory} · {tpl.sections.reduce((a, s) => a + s.items.length, 0)} items
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartReportWithTemplate(tpl);
                        }}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                        title="Start Report"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomTemplate(tpl.type, e)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Template"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Inspection Canvas & Section Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Template Details Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
              Inspection Sheet Specifications
            </h3>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Inspection Sheet Title</label>
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-red-600 focus:outline-hidden"
                  placeholder="e.g. Albany PMB Cooler & Prover 6-Month Service"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Asset Category / Subsystem</label>
                <input
                  type="text"
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-hidden"
                  placeholder="e.g. 8000 LPH Double Drum Spiral Cooler"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Model / Year</label>
                <input
                  type="text"
                  value={modelYear}
                  onChange={(e) => setModelYear(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-hidden"
                  placeholder="e.g. Dale Automation 2026"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Scope of Work &amp; Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-hidden"
                  placeholder="Detailed inspection checklist for commissioning & service..."
                />
              </div>
            </div>
          </div>

          {/* Sections & Items Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Inspection Sections &amp; Checkpoints
                </h3>
                <p className="text-xs text-slate-500">
                  {sections.length} sections · {totalItemsCount} total checklist items configured
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 text-red-600" />
                Add New Section
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Layers className="mx-auto h-8 w-8 text-slate-400" />
                <h4 className="mt-2 text-xs font-bold text-slate-700">No Checklist Sections Added</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Click components from the library on the left or add a new section above.
                </p>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create First Section
                </button>
              </div>
            ) : (
              sections.map((section, sIdx) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                >
                  {/* Section Title Bar */}
                  <div className="flex items-center justify-between bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-white font-mono tabular-nums">
                        {sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                        className="flex-1 font-bold text-xs text-slate-900 bg-transparent px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-red-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {section.items.length} items
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddItemToSection(section.id)}
                        className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Add Item
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(section.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Section Items Table */}
                  {section.items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No items in this section. Click "+ Add Item" or choose from the catalog on the left.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-2 px-2.5 w-10 text-center">SN</th>
                            <th className="py-2 px-2.5 min-w-[200px]">Item Description</th>
                            <th className="py-2 px-2.5 min-w-[150px]">Standard / Default Note</th>
                            <th className="py-2 px-2.5 w-44 text-center">Dropdown Evaluation Type</th>
                            <th className="py-2 px-2 w-10 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              {/* SN */}
                              <td className="py-2 px-2.5 text-center font-bold text-slate-500 font-mono tabular-nums">
                                {item.sn}
                              </td>

                              {/* Item Name */}
                              <td className="py-2 px-2.5">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) =>
                                    handleUpdateItem(section.id, item.id, { name: e.target.value })
                                  }
                                  className="w-full rounded border border-transparent hover:border-slate-300 focus:border-red-600 focus:bg-white px-1.5 py-0.5 font-medium text-xs text-slate-900 focus:outline-hidden"
                                />
                              </td>

                              {/* Notes */}
                              <td className="py-2 px-2.5">
                                <input
                                  type="text"
                                  value={item.notes}
                                  placeholder="Standard observation note..."
                                  onChange={(e) =>
                                    handleUpdateItem(section.id, item.id, { notes: e.target.value })
                                  }
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 placeholder-slate-400 focus:border-red-600 focus:bg-white focus:outline-hidden"
                                />
                              </td>

                              {/* Dropdown Evaluation Type Selector */}
                              <td className="py-2 px-2.5 text-center">
                                <select
                                  value={item.statusType}
                                  onChange={(e) =>
                                    handleUpdateItem(section.id, item.id, {
                                      statusType: e.target.value as StatusType,
                                    })
                                  }
                                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 focus:border-red-600 focus:outline-hidden"
                                >
                                  <option value="good_repair_replace">Good / Repair / Replace / NA</option>
                                  <option value="pass_fail">Pass / Fail / NA</option>
                                  <option value="yes_no">Yes / No / NA</option>
                                  <option value="ok_faulty">OK / Faulty / NA</option>
                                  <option value="readings_only">Readings Only (Numeric)</option>
                                </select>
                              </td>

                              {/* Remove Item */}
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(section.id, item.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Delete Item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Template Import Modal (PDF, Excel, CSV) */}
      <TemplateImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onTemplateImportedAndSaved={(tmpl) => {
          handleLoadCustomTemplate(tmpl);
          setCustomTemplates(storageService.getCustomTemplates());
          setSavedSuccessMessage(`Imported "${tmpl.title}" and loaded into editor!`);
          setTimeout(() => setSavedSuccessMessage(null), 3000);
        }}
        onStartReportWithTemplate={onStartReportWithTemplate}
      />
    </div>
  );
};

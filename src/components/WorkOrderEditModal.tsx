import React, { useState, useEffect } from 'react';
import {
  Edit3,
  X,
  Save,
  AlertCircle,
  Calendar,
  User,
  Shield,
  Layers,
  FileCheck,
} from 'lucide-react';
import { WorkOrder, ReportType } from '../types';
import { USERS } from '../data/initialData';
import { REPORT_TEMPLATES } from '../data/reportTemplates';
import { storageService } from '../services/storageService';
import { SiteEquipmentDropdown } from './SiteEquipmentDropdown';

interface WorkOrderEditModalProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWO: WorkOrder) => void;
}

export const WorkOrderEditModal: React.FC<WorkOrderEditModalProps> = ({
  workOrder,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Routine'>('Urgent');
  const [status, setStatus] = useState<'assigned' | 'in_progress' | 'completed' | 'cancelled'>('assigned');
  const [clientName, setClientName] = useState('');
  const [facility, setFacility] = useState('');
  const [location, setLocation] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetNumber, setAssetNumber] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [templateType, setTemplateType] = useState<ReportType>('spiral_cooler_double_drum');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (workOrder) {
      setTitle(workOrder.title || '');
      setWorkOrderNumber(workOrder.workOrderNumber || '');
      setPriority(workOrder.priority || 'Medium');
      setStatus(workOrder.status || 'assigned');
      setClientName(workOrder.clientName || '');
      setFacility(workOrder.facility || '');
      setLocation(workOrder.location || '');
      setAssetName(workOrder.assetName || '');
      setAssetNumber(workOrder.assetNumber || '');
      setAssignedTo(workOrder.assignedTo || '');
      // Ensure dueDate is formatted as YYYY-MM-DD
      const rawDate = workOrder.dueDate ? new Date(workOrder.dueDate) : new Date();
      setDueDate(!isNaN(rawDate.getTime()) ? rawDate.toISOString().split('T')[0] : '');
      setTemplateType(workOrder.templateType || 'spiral_cooler_double_drum');
      setDescription(workOrder.description || '');
    }
  }, [workOrder]);

  if (!isOpen || !workOrder) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: WorkOrder = {
      ...workOrder,
      title: title.trim(),
      workOrderNumber: workOrderNumber.trim() || workOrder.workOrderNumber,
      priority,
      status,
      clientName: clientName.trim(),
      facility: facility.trim(),
      location: location.trim(),
      assetName: assetName.trim(),
      assetNumber: assetNumber.trim(),
      assignedTo: assignedTo.trim(),
      dueDate: dueDate || workOrder.dueDate,
      templateType,
      description: description.trim(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Edit3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
                  Admin Edit
                </span>
                <span className="font-mono-numbers text-xs font-bold text-slate-500">
                  {workOrder.workOrderNumber}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Edit Work Order Specification</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title & Number */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              Work Order Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inspect & re-weld drum rings"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Work Order #</label>
            <input
              type="text"
              value={workOrderNumber}
              onChange={(e) => setWorkOrderNumber(e.target.value)}
              placeholder="WO-2026-089"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono-numbers text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-hidden"
            >
              <option value="Urgent">🚨 Urgent</option>
              <option value="High">⚠️ High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Routine">Routine Service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Workflow Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
            >
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">Assigned Technician</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-hidden"
            >
              {USERS.map((user) => (
                <option key={user.id} value={user.name}>
                  {user.name} ({user.role.toUpperCase()} - {user.title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono-numbers text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Site & Equipment Catalog Dropdown */}
        <div className="rounded-lg border border-red-200 bg-red-50/30 p-2.5">
          <SiteEquipmentDropdown
            selectedAssetNumber={assetNumber}
            selectedFacilityName={facility || clientName}
            label="Select Official Facility Site & Machinery Asset"
            onSelect={(selected) => {
              setClientName(selected.clientGroup);
              setFacility(`${selected.facilityName}, ${selected.region}`);
              setLocation(selected.locationAddress);
              setAssetName(selected.assetName);
              setAssetNumber(selected.assetNumber);
            }}
          />
        </div>

        {/* Client & Facility */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">Client / Customer</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Albany Bakeries"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Facility / Site</label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              placeholder="e.g. Albany Pietermaritzburg Plant"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Asset Details */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700">Machinery Asset</label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g. Double Drum Spiral Cooler"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Asset Serial / Tag #</label>
            <input
              type="text"
              value={assetNumber}
              onChange={(e) => setAssetNumber(e.target.value)}
              placeholder="e.g. DSS 211-8"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono-numbers text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Physical Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Pietermaritzburg, KZN"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Template Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700">
            Linked Inspection Report Checklist
          </label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as ReportType)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
          >
            {storageService.getAllTemplates().map((tmpl) => (
              <option key={tmpl.type} value={tmpl.type}>
                {tmpl.title} ({tmpl.sections.length} inspection sections) {tmpl.type.startsWith('custom_') ? '(Custom)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Detailed Scope & Directives */}
        <div>
          <label className="block text-xs font-bold text-slate-700">
            Work Order Directives &amp; Technical Scope
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Specify replacement parts, welding requirements, safety lockout protocols..."
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

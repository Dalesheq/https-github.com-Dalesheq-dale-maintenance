/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { ReportsList } from './components/ReportsList';
import { ReportEditor } from './components/ReportEditor';
import { ReportViewerModal } from './components/ReportViewerModal';
import { ManagerDashboard } from './components/ManagerDashboard';
import { WorkOrdersList } from './components/WorkOrdersList';
import { OfflineSyncCenter } from './components/OfflineSyncCenter';
import { CustomTemplateBuilder } from './components/CustomTemplateBuilder';
import { AnalyticsTrendsDashboard } from './components/AnalyticsTrendsDashboard';
import { storageService } from './services/storageService';
import { Report, WorkOrder, PushNotification } from './types';
import { ReportTemplate, REPORT_TEMPLATES } from './data/reportTemplates';
import { Bell, AlertTriangle, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('reports');
  const [reports, setReports] = useState<Report[]>(storageService.getReports());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(storageService.getWorkOrders());
  const [selectedReportForView, setSelectedReportForView] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activePushBanner, setActivePushBanner] = useState<PushNotification | null>(null);

  // Sync state subscription
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setReports(storageService.getReports());
      setWorkOrders(storageService.getWorkOrders());
    });

    // Real-time Push Notification alert listener
    const unsubNotifs = storageService.onNotification((notif) => {
      setActivePushBanner(notif);
      // Auto-hide banner after 7 seconds
      const timer = setTimeout(() => {
        setActivePushBanner((current) => (current?.id === notif.id ? null : current));
      }, 7000);
      return () => clearTimeout(timer);
    });

    return () => {
      unsub();
      unsubNotifs();
    };
  }, []);

  // Create report from template
  const handleCreateReportFromTemplate = (template: ReportTemplate) => {
    const currentUser = storageService.getCurrentUser();
    const nextNumber = `Dale Automation ${2800 + reports.length + 1}`;

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reportNumber: nextNumber,
      title: template.title,
      reportType: template.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inspectionDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspectorName: currentUser.name,
      location: 'South Africa',
      gps: {
        latitude: -26.2573,
        longitude: 27.9892,
        accuracy: 4.0,
        altitude: 1720,
        facilityName: 'Premier Foods - Blue Ribbon Aeroton Plant 2',
        address: 'Adcock Ingram Ave, Aeroton, Johannesburg',
        timestamp: new Date().toISOString(),
      },
      assetDetails: {
        category: template.defaultCategory,
        name: 'Industrial Plant Line 1',
        assetNumber: `DSS ${Math.floor(200 + Math.random() * 200)}-${Math.floor(1 + Math.random() * 9)}`,
        meterReading: '0 Hours',
        modelYear: template.defaultModelYear,
      },
      sections: JSON.parse(JSON.stringify(template.sections)),
      photos: [],
      summary: {
        overallCondition: 'Good Condition',
        assetSafeToUse: true,
        maintenanceRequired: false,
        assetStatus: 'Commissioned',
        maintenancePriority: 'Low',
        additionalNotes: '',
        customBusinessFields: {
          clientName: 'Plant Maintenance Engineering',
          contactDetails: '0114620044',
        },
      },
      signatures: {
        technician: {
          signatureImage: '',
          signedByName: currentUser.name,
          signedAt: '',
          designation: currentUser.title,
        },
        client: {
          signatureImage: '',
          signedByName: '',
          signedAt: '',
          designation: 'Plant Representative',
        },
      },
      approvalStatus: 'draft',
      syncStatus: storageService.isOnline() ? 'synced' : 'pending_sync',
      offlineCreated: !storageService.isOnline(),
      preparedBy: 'sheq@spiralsystems.co.za',
      website: 'www.daleautomation.co.za',
    };

    setEditingReport(newReport);
  };

  // Start report from an assigned Work Order
  const handleStartReportFromWorkOrder = (wo: WorkOrder) => {
    const template = REPORT_TEMPLATES[wo.templateType] || REPORT_TEMPLATES.spiral_cooler_double_drum;
    const currentUser = storageService.getCurrentUser();
    const nextNumber = `Dale Automation ${2800 + reports.length + 1}`;

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reportNumber: nextNumber,
      title: `${wo.title} (${template.title})`,
      reportType: wo.templateType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inspectionDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspectorName: currentUser.name,
      location: wo.location,
      gps: {
        latitude: wo.gpsCoordinates?.latitude || -26.1887,
        longitude: wo.gpsCoordinates?.longitude || 28.3206,
        accuracy: 3.8,
        altitude: 1640,
        facilityName: wo.facility,
        address: wo.location,
        timestamp: new Date().toISOString(),
      },
      assetDetails: {
        category: template.defaultCategory,
        name: wo.assetName,
        assetNumber: wo.assetNumber,
        meterReading: '0 Hours',
        modelYear: template.defaultModelYear,
      },
      sections: JSON.parse(JSON.stringify(template.sections)),
      photos: [],
      summary: {
        overallCondition: wo.priority === 'Urgent' ? 'Major Repair required' : 'Good Condition',
        assetSafeToUse: wo.priority !== 'Urgent',
        maintenanceRequired: true,
        assetStatus: 'Maintenance Required',
        maintenancePriority: wo.priority === 'Routine' ? 'Low' : wo.priority,
        additionalNotes: `Work Order ${wo.workOrderNumber}: ${wo.description}`,
        customBusinessFields: {
          clientName: wo.clientName,
          contactDetails: '0114620044',
        },
      },
      signatures: {
        technician: {
          signatureImage: '',
          signedByName: currentUser.name,
          signedAt: '',
          designation: currentUser.title,
        },
        client: {
          signatureImage: '',
          signedByName: '',
          signedAt: '',
          designation: 'Plant Representative',
        },
      },
      approvalStatus: 'draft',
      syncStatus: storageService.isOnline() ? 'synced' : 'pending_sync',
      offlineCreated: !storageService.isOnline(),
      preparedBy: 'sheq@spiralsystems.co.za',
      website: 'www.daleautomation.co.za',
    };

    // Update work order to in_progress and link report
    wo.status = 'in_progress';
    wo.associatedReportId = newReport.id;
    storageService.saveWorkOrder(wo);

    setEditingReport(newReport);
  };

  const handleSelectReportById = (reportId: string) => {
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      setSelectedReportForView(rep);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    storageService.deleteReport(reportId);
    if (editingReport?.id === reportId) {
      setEditingReport(null);
    }
    if (selectedReportForView?.id === reportId) {
      setSelectedReportForView(null);
    }
  };

  const handlePushBannerClick = () => {
    if (!activePushBanner) return;
    storageService.markNotificationAsRead(activePushBanner.id);

    if (activePushBanner.workOrderId) {
      setCurrentTab('work-orders');
    } else if (activePushBanner.reportId) {
      handleSelectReportById(activePushBanner.reportId);
    }
    setActivePushBanner(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Real-time Push Notification Floating Toast Banner */}
      {activePushBanner && (
        <div className="fixed top-16 right-4 z-50 max-w-md animate-bounce-short">
          <div
            onClick={handlePushBannerClick}
            className={`cursor-pointer rounded-xl border p-4 shadow-2xl flex items-start gap-3 backdrop-blur-md transition-all ${
              activePushBanner.priority === 'Urgent'
                ? 'bg-rose-950/95 border-rose-500 text-white'
                : 'bg-slate-900/95 border-blue-500 text-white'
            }`}
          >
            <div className={`p-2 rounded-lg ${activePushBanner.priority === 'Urgent' ? 'bg-rose-600' : 'bg-blue-600'}`}>
              <Bell className="h-5 w-5 text-white animate-pulse" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  {activePushBanner.priority} Push Notification
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePushBanner(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h4 className="mt-0.5 text-sm font-bold text-white">{activePushBanner.title}</h4>
              <p className="mt-1 text-xs text-slate-200 line-clamp-2">{activePushBanner.message}</p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky-300">
                <span>View Details</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setEditingReport(null);
          setCurrentTab(tab);
        }}
        onNewReport={() => setIsTemplateModalOpen(true)}
        onSelectWorkOrder={(woId) => setCurrentTab('work-orders')}
        onSelectReport={(repId) => handleSelectReportById(repId)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {editingReport ? (
          <ReportEditor
            initialReport={editingReport}
            onBack={() => setEditingReport(null)}
            onPreview={(rep) => setSelectedReportForView(rep)}
            onDelete={handleDeleteReport}
          />
        ) : currentTab === 'reports' ? (
          <ReportsList
            reports={reports}
            onSelectReport={(rep) => setSelectedReportForView(rep)}
            onEditReport={(rep) => setEditingReport(rep)}
            onDeleteReport={handleDeleteReport}
            onCreateReportFromTemplate={handleCreateReportFromTemplate}
            isTemplateModalOpen={isTemplateModalOpen}
            setIsTemplateModalOpen={setIsTemplateModalOpen}
            onOpenCustomBuilder={() => setCurrentTab('template-builder')}
          />
        ) : currentTab === 'template-builder' ? (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <CustomTemplateBuilder
              onStartReportWithTemplate={(tpl) => {
                handleCreateReportFromTemplate(tpl);
              }}
              onNavigateToReports={() => setCurrentTab('reports')}
            />
          </div>
        ) : currentTab === 'trends-dashboard' ? (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <AnalyticsTrendsDashboard
              reports={reports}
              workOrders={workOrders}
              onCreateWorkOrder={() => setCurrentTab('manager-dashboard')}
            />
          </div>
        ) : currentTab === 'work-orders' ? (
          <WorkOrdersList
            workOrders={workOrders}
            onStartReportFromWO={handleStartReportFromWorkOrder}
            onViewReportById={handleSelectReportById}
            onNewWorkOrderClick={() => setCurrentTab('manager-dashboard')}
          />
        ) : currentTab === 'manager-dashboard' ? (
          <ManagerDashboard
            reports={reports}
            workOrders={workOrders}
            onViewReport={(rep) => setSelectedReportForView(rep)}
            onEditReport={(rep) => setEditingReport(rep)}
            onDeleteReport={handleDeleteReport}
          />
        ) : (
          <OfflineSyncCenter />
        )}
      </main>

      {/* Official Report High-Fidelity Viewer Modal (PDF preview and export) */}
      <ReportViewerModal
        report={selectedReportForView}
        isOpen={Boolean(selectedReportForView)}
        onClose={() => setSelectedReportForView(null)}
        onEdit={(rep) => {
          setSelectedReportForView(null);
          setEditingReport(rep);
        }}
        onDelete={handleDeleteReport}
      />
    </div>
  );
}

import { Report, WorkOrder, PushNotification, UserProfile } from '../types';
import { INITIAL_REPORTS, INITIAL_WORK_ORDERS, INITIAL_NOTIFICATIONS, USERS } from '../data/initialData';
import { playAlertChime } from './audioNotification';
import { REPORT_TEMPLATES, ReportTemplate } from '../data/reportTemplates';

const STORAGE_KEYS = {
  REPORTS: 'dale_reports_v1',
  WORK_ORDERS: 'dale_work_orders_v1',
  NOTIFICATIONS: 'dale_notifications_v1',
  CURRENT_USER_ID: 'dale_current_user_id',
  SIMULATE_OFFLINE: 'dale_simulate_offline',
  LAST_SYNCED: 'dale_last_synced_timestamp',
  SYNC_QUEUE: 'dale_sync_queue_ids',
  CUSTOM_TEMPLATES: 'dale_custom_templates_v1',
};

class StorageService {
  private listeners: Set<() => void> = new Set();
  private notificationListeners: Set<(notif: PushNotification) => void> = new Set();
  private isSimulatingOffline = false;
  private isCurrentlySyncing = false;

  constructor() {
    this.isSimulatingOffline = localStorage.getItem(STORAGE_KEYS.SIMULATE_OFFLINE) === 'true';

    // Auto-sync listener when browser reconnects
    window.addEventListener('online', () => {
      if (!this.isSimulatingOffline) {
        this.triggerCloudSync();
      }
    });

    window.addEventListener('offline', () => {
      this.notifyListeners();
    });
  }

  // Subscribe to storage changes
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Subscribe to new incoming push notifications
  public onNotification(listener: (notif: PushNotification) => void): () => void {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  // Network State
  public isOnline(): boolean {
    if (this.isSimulatingOffline) return false;
    return navigator.onLine;
  }

  public getSimulateOffline(): boolean {
    return this.isSimulatingOffline;
  }

  public setSimulateOffline(simulate: boolean) {
    this.isSimulatingOffline = simulate;
    localStorage.setItem(STORAGE_KEYS.SIMULATE_OFFLINE, String(simulate));
    this.notifyListeners();

    // If switching back to online, trigger automatic syncing
    if (!simulate && navigator.onLine) {
      setTimeout(() => {
        this.triggerCloudSync();
      }, 500);
    }
  }

  // Current User & Admin Rights
  public getCurrentUser(): UserProfile {
    const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    // If not set or was old default 'user-tech-1', immediately switch to Admin 'user-sheq-1'
    if (!userId || userId === 'user-tech-1') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-sheq-1');
      const adminUser = USERS.find((u) => u.id === 'user-sheq-1');
      if (adminUser) return adminUser;
    }
    const found = USERS.find((u) => u.id === userId);
    return found || USERS.find((u) => u.role === 'admin') || USERS[0];
  }

  public setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    this.notifyListeners();
  }

  public isAdmin(): boolean {
    return this.getCurrentUser().role === 'admin';
  }

  public canEditReport(report?: Report): boolean {
    const user = this.getCurrentUser();
    if (user.role === 'admin') return true;
    if (user.role === 'manager') return true;
    if (!report) return true;
    return report.approvalStatus === 'draft' || report.approvalStatus === 'revision_requested';
  }

  public canDeleteReport(report?: Report): boolean {
    const user = this.getCurrentUser();
    if (user.role === 'admin') return true;
    if (user.role === 'manager') return true;
    return true; // Allow delete for all authorized field engineers
  }

  // Reports Management
  public getReports(): Report[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) {
        this.saveReports(INITIAL_REPORTS);
        return INITIAL_REPORTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_REPORTS;
    }
  }

  public getReportById(id: string): Report | undefined {
    return this.getReports().find((r) => r.id === id);
  }

  public saveReport(report: Report, isDraft = false): { report: Report; synced: boolean } {
    const reports = this.getReports();
    const existingIndex = reports.findIndex((r) => r.id === report.id);

    const isOnlineNow = this.isOnline();
    const updatedReport: Report = {
      ...report,
      updatedAt: new Date().toISOString(),
      offlineCreated: report.offlineCreated ?? !isOnlineNow,
      syncStatus: isOnlineNow ? 'synced' : 'pending_sync',
    };

    if (existingIndex >= 0) {
      reports[existingIndex] = updatedReport;
    } else {
      reports.unshift(updatedReport);
    }

    this.saveReports(reports);

    if (!isOnlineNow) {
      this.addToSyncQueue(updatedReport.id);
    } else {
      this.removeFromSyncQueue(updatedReport.id);
      this.updateLastSyncedTime();
    }

    this.notifyListeners();
    return { report: updatedReport, synced: isOnlineNow };
  }

  public deleteReport(id: string) {
    const reports = this.getReports().filter((r) => r.id !== id);
    this.saveReports(reports);
    this.removeFromSyncQueue(id);
    this.notifyListeners();
  }

  private saveReports(reports: Report[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn('LocalStorage quota warning. Attempting to trim:', e);
    }
  }

  // Manager Approval Workflow
  public approveReport(reportId: string, managerName: string, notes: string): Report | null {
    const reports = this.getReports();
    const report = reports.find((r) => r.id === reportId);
    if (!report) return null;

    report.approvalStatus = 'approved';
    report.managerApproval = {
      approvedBy: managerName,
      approvedAt: new Date().toISOString(),
      decision: 'approved',
      notes,
    };
    report.updatedAt = new Date().toISOString();

    if (!this.isOnline()) {
      report.syncStatus = 'pending_sync';
      this.addToSyncQueue(report.id);
    } else {
      report.syncStatus = 'synced';
    }

    this.saveReports(reports);

    // Push notification to technician
    this.dispatchPushNotification({
      title: 'Report Approved by Operations',
      message: `${managerName} approved report ${report.reportNumber} (${report.assetDetails.name}).`,
      reportId: report.id,
      priority: 'Info',
    });

    this.notifyListeners();
    return report;
  }

  public requestRevision(reportId: string, managerName: string, notes: string): Report | null {
    const reports = this.getReports();
    const report = reports.find((r) => r.id === reportId);
    if (!report) return null;

    report.approvalStatus = 'revision_requested';
    report.managerApproval = {
      approvedBy: managerName,
      approvedAt: new Date().toISOString(),
      decision: 'revision_requested',
      notes,
    };
    report.updatedAt = new Date().toISOString();

    if (!this.isOnline()) {
      report.syncStatus = 'pending_sync';
      this.addToSyncQueue(report.id);
    } else {
      report.syncStatus = 'synced';
    }

    this.saveReports(reports);

    // Push notification to technician
    this.dispatchPushNotification({
      title: 'Revision Requested on Report',
      message: `${managerName} requested revisions on ${report.reportNumber}: "${notes}"`,
      reportId: report.id,
      priority: 'High',
    });

    this.notifyListeners();
    return report;
  }

  // Work Orders Management
  public getWorkOrders(): WorkOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
      if (!data) {
        this.saveWorkOrders(INITIAL_WORK_ORDERS);
        return INITIAL_WORK_ORDERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_WORK_ORDERS;
    }
  }

  public saveWorkOrder(wo: WorkOrder) {
    const list = this.getWorkOrders();
    const index = list.findIndex((w) => w.id === wo.id);
    if (index >= 0) {
      list[index] = wo;
    } else {
      list.unshift(wo);
    }
    this.saveWorkOrders(list);
    this.notifyListeners();
  }

  public dispatchUrgentWorkOrder(woData: Omit<WorkOrder, 'id' | 'assignedAt' | 'isPushNotified'>): WorkOrder {
    const newId = `wo-${Date.now()}`;
    const newWo: WorkOrder = {
      ...woData,
      id: newId,
      assignedAt: new Date().toISOString(),
      isPushNotified: true,
    };

    const orders = this.getWorkOrders();
    orders.unshift(newWo);
    this.saveWorkOrders(orders);

    // Trigger urgent real-time push notification
    this.dispatchPushNotification({
      title: woData.priority === 'Urgent' ? '🚨 URGENT WORK ORDER DISPATCHED' : '📋 NEW WORK ORDER ASSIGNED',
      message: `${woData.assignedBy} assigned ${newWo.workOrderNumber}: ${newWo.title} at ${newWo.facility}.`,
      workOrderId: newId,
      priority: woData.priority === 'Urgent' ? 'Urgent' : 'High',
    });

    this.notifyListeners();
    return newWo;
  }

  private saveWorkOrders(orders: WorkOrder[]) {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(orders));
  }

  // Push Notifications
  public getNotifications(): PushNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) {
        this.saveNotifications(INITIAL_NOTIFICATIONS);
        return INITIAL_NOTIFICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public markNotificationAsRead(id: string) {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      this.saveNotifications(notifs);
      this.notifyListeners();
    }
  }

  public markAllNotificationsAsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(notifs);
    this.notifyListeners();
  }

  public dispatchPushNotification(payload: Omit<PushNotification, 'id' | 'timestamp' | 'read'>): PushNotification {
    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...payload,
    };

    const list = this.getNotifications();
    list.unshift(notif);
    this.saveNotifications(list);

    // Audio chime
    playAlertChime(payload.priority === 'Urgent');

    // Notify listeners
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notif);
      } catch (e) {
        console.error(e);
      }
    });

    // Native browser Notification API if supported and granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(payload.title, {
          body: payload.message,
          icon: '/favicon.ico',
        });
      } catch {
        // Safe ignore
      }
    }

    this.notifyListeners();
    return notif;
  }

  private saveNotifications(list: PushNotification[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  // Sync Queue & Cloud Syncing
  public getSyncQueue(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getPendingSyncCount(): number {
    return this.getReports().filter((r) => r.syncStatus === 'pending_sync').length;
  }

  private addToSyncQueue(reportId: string) {
    const queue = new Set(this.getSyncQueue());
    queue.add(reportId);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(Array.from(queue)));
  }

  private removeFromSyncQueue(reportId: string) {
    const queue = new Set(this.getSyncQueue());
    queue.delete(reportId);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(Array.from(queue)));
  }

  public getLastSyncedTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
  }

  private updateLastSyncedTime() {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, new Date().toISOString());
  }

  public async triggerCloudSync(): Promise<{ syncedCount: number; message: string }> {
    if (this.isCurrentlySyncing) {
      return { syncedCount: 0, message: 'Sync in progress' };
    }
    if (!this.isOnline()) {
      return { syncedCount: 0, message: 'Device is offline. Changes kept safely in local storage.' };
    }

    this.isCurrentlySyncing = true;
    this.notifyListeners();

    try {
      // Simulate real cloud handshake latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const reports = this.getReports();
      let updatedCount = 0;

      reports.forEach((report) => {
        if (report.syncStatus === 'pending_sync' || report.syncStatus === 'offline_cached') {
          report.syncStatus = 'synced';
          updatedCount++;
        }
      });

      this.saveReports(reports);
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      this.updateLastSyncedTime();

      return {
        syncedCount: updatedCount,
        message: updatedCount > 0
          ? `Successfully synchronized ${updatedCount} report${updatedCount > 1 ? 's' : ''} with Dale Automation central cloud database.`
          : 'All reports are up to date and in sync with the central server.',
      };
    } finally {
      this.isCurrentlySyncing = false;
      this.notifyListeners();
    }
  }

  public isSyncing(): boolean {
    return this.isCurrentlySyncing;
  }

  // Backup & Restore
  public exportBackupJson(): string {
    const backup = {
      appName: 'Dale Automation Field Reporting System',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      reports: this.getReports(),
      workOrders: this.getWorkOrders(),
      notifications: this.getNotifications(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.reports && Array.isArray(data.reports)) {
        this.saveReports(data.reports);
      }
      if (data.workOrders && Array.isArray(data.workOrders)) {
        this.saveWorkOrders(data.workOrders);
      }
      if (data.notifications && Array.isArray(data.notifications)) {
        this.saveNotifications(data.notifications);
      }
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  // Custom Templates Management
  public getCustomTemplates(): ReportTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveCustomTemplate(template: ReportTemplate): void {
    const list = this.getCustomTemplates();
    const existingIndex = list.findIndex((t) => t.type === template.type);
    if (existingIndex >= 0) {
      list[existingIndex] = template;
    } else {
      list.unshift(template);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(list));
    this.notifyListeners();
  }

  public deleteCustomTemplate(templateType: string): void {
    const list = this.getCustomTemplates().filter((t) => t.type !== templateType);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(list));
    this.notifyListeners();
  }

  public getAllTemplates(): ReportTemplate[] {
    const builtIn = Object.values(REPORT_TEMPLATES);
    const custom = this.getCustomTemplates();
    // Return custom first, then built-in
    return [...custom, ...builtIn];
  }

  public resetToFactoryDefaults() {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.WORK_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
    this.saveReports(INITIAL_REPORTS);
    this.saveWorkOrders(INITIAL_WORK_ORDERS);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    this.notifyListeners();
  }
}

export const storageService = new StorageService();

export type ReportType =
  | 'spiral_cooler_double_drum'
  | 'spiral_cooler_edge_drive'
  | 'spiral_freezer'
  | 'oven_inspection'
  | 'commissioning_chiller_pump'
  | 'belt_pre_inspection'
  | 'prover_inspection'
  | 'training_register'
  | 'service_van_tools'
  | 'prover_steam_conditioning'
  | 'tunnel_oven_gas_train'
  | 'depanner_slat_infeed'
  | 'ammonia_refrigeration_station'
  | 'custom'
  | string;

export type ItemStatus =
  | 'good'
  | 'repair'
  | 'replace'
  | 'na'
  | 'pass'
  | 'fail'
  | 'yes'
  | 'no'
  | 'ok'
  | 'faulty'
  | 'uninspected';

export type StatusType =
  | 'good_repair_replace'
  | 'yes_no'
  | 'pass_fail'
  | 'ok_faulty'
  | 'readings_only';

export interface ChecklistItem {
  id: string;
  sn: number;
  name: string;
  notes: string;
  status: ItemStatus;
  statusType: StatusType;
  readings?: string;
  photoIds?: string[];
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude?: number;
  facilityName: string;
  address?: string;
  timestamp: string;
}

export interface PhotoAttachment {
  id: string;
  url: string; // base64 or static url
  caption: string;
  snItem?: number;
  itemName?: string;
  timestamp: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
}

export interface SignatureData {
  signatureImage: string; // base64 PNG data URL
  signedByName: string;
  signedAt: string;
  designation?: string;
}

export type OverallCondition =
  | 'Excellent Condition'
  | 'Good Condition'
  | 'A little wear'
  | 'Minor Repair required'
  | 'Major Repair required'
  | 'Critical - Shut Down Immediately';

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type AssetStatus =
  | 'Available'
  | 'Maintenance Required'
  | 'Awaiting Parts'
  | 'Commissioned'
  | 'Decommissioned';

export type ApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export type SyncStatus = 'synced' | 'pending_sync' | 'syncing' | 'offline_cached';

export interface ReportSummary {
  overallCondition: OverallCondition;
  assetSafeToUse: boolean;
  maintenanceRequired: boolean;
  assetStatus: AssetStatus;
  maintenancePriority: MaintenancePriority;
  additionalNotes: string;
  customBusinessFields: {
    clientName: string;
    contactDetails: string;
  };
}

export interface ManagerApproval {
  approvedBy: string;
  approvedAt: string;
  decision: 'approved' | 'rejected' | 'revision_requested';
  notes: string;
  remedialWorkOrderCreated?: boolean;
}

export interface Report {
  id: string;
  reportNumber: string; // e.g. "Dale Automation 2773"
  title: string;
  reportType: ReportType;
  createdAt: string;
  updatedAt: string;
  inspectionDate: string;
  inspectorName: string;
  location: string;
  gps: GPSLocation;
  assetDetails: {
    category: string;
    name: string;
    assetNumber: string;
    meterReading: string;
    modelYear: string;
  };
  sections: ChecklistSection[];
  photos: PhotoAttachment[];
  summary: ReportSummary;
  signatures: {
    technician: SignatureData;
    client: SignatureData;
  };
  approvalStatus: ApprovalStatus;
  managerApproval?: ManagerApproval;
  syncStatus: SyncStatus;
  offlineCreated: boolean;
  preparedBy: string;
  website: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string; // e.g. "WO-2026-089"
  title: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Routine';
  clientName: string;
  facility: string;
  assetName: string;
  assetNumber: string;
  location: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  dueDate: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  templateType: ReportType;
  associatedReportId?: string;
  isPushNotified: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  workOrderId?: string;
  reportId?: string;
  priority: 'Urgent' | 'High' | 'Info';
  timestamp: string;
  read: boolean;
}

export type UserRole = 'technician' | 'manager' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
}

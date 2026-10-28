import React, { useState, useMemo } from 'react';
import { Report, WorkOrder } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  BarChart3,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  Wrench,
  Filter,
  PlusCircle,
  Lock,
  ShieldCheck,
  UserCheck,
  Users,
  Award,
  FileText,
  Briefcase,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ManagementLoginModal } from './ManagementLoginModal';
import { USERS } from '../data/initialData';

interface AnalyticsTrendsDashboardProps {
  reports: Report[];
  workOrders: WorkOrder[];
  onCreateWorkOrder: () => void;
  onNavigateToReports?: () => void;
  onNavigateToWorkOrders?: () => void;
}

export const AnalyticsTrendsDashboard: React.FC<AnalyticsTrendsDashboardProps> = ({
  reports,
  workOrders,
  onCreateWorkOrder,
  onNavigateToReports,
  onNavigateToWorkOrders,
}) => {
  const currentUser = storageService.getCurrentUser();
  const isManagement = storageService.isManagement();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('All');
  const [selectedInspectorFilter, setSelectedInspectorFilter] = useState<string>('All');

  // Technician list for management leaderboard and filter
  const technicianUsers = useMemo(() => {
    return USERS.filter((u) => u.role === 'technician');
  }, []);

  // Unique inspector names from reports
  const inspectorOptions = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.inspectorName) set.add(r.inspectorName);
    });
    technicianUsers.forEach((t) => set.add(t.name));
    return Array.from(set);
  }, [reports, technicianUsers]);

  // Unique plants list for filter
  const plantOptions = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.assetDetails.name) set.add(r.assetDetails.name);
    });
    return Array.from(set);
  }, [reports]);

  // Personal statistics for technicians when restricted
  const personalStats = useMemo(() => {
    const myReports = reports.filter((r) =>
      r.inspectorName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
    const myOrders = workOrders.filter((w) =>
      w.assignedTo.toLowerCase().includes(currentUser.name.toLowerCase())
    );
    const safeCount = myReports.filter((r) => r.summary.assetSafeToUse).length;
    const safeRate = myReports.length > 0 ? Math.round((safeCount / myReports.length) * 100) : 100;

    let defectsCount = 0;
    myReports.forEach((r) => {
      r.sections.forEach((s) => {
        s.items.forEach((item) => {
          if (
            item.status === 'replace' ||
            item.status === 'repair' ||
            item.status === 'fail' ||
            item.status === 'faulty'
          ) {
            defectsCount++;
          }
        });
      });
    });

    const pendingOrders = myOrders.filter((w) => w.status !== 'completed');
    const urgentOrders = myOrders.filter((w) => w.priority === 'Urgent' && w.status !== 'completed');

    return {
      myReports,
      myOrders,
      safeRate,
      defectsCount,
      pendingOrdersCount: pendingOrders.length,
      urgentOrdersCount: urgentOrders.length,
    };
  }, [reports, workOrders, currentUser]);

  // Filtered reports for Management View
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesPlant =
        selectedPlantFilter === 'All' ||
        r.assetDetails.name.toLowerCase().includes(selectedPlantFilter.toLowerCase()) ||
        r.location.toLowerCase().includes(selectedPlantFilter.toLowerCase());

      const matchesInspector =
        selectedInspectorFilter === 'All' ||
        r.inspectorName.toLowerCase().includes(selectedInspectorFilter.toLowerCase());

      return matchesPlant && matchesInspector;
    });
  }, [reports, selectedPlantFilter, selectedInspectorFilter]);

  // Aggregate stats for Management View
  const stats = useMemo(() => {
    const totalReports = filteredReports.length;
    const safeToUseCount = filteredReports.filter((r) => r.summary.assetSafeToUse).length;
    const safeRate = totalReports > 0 ? Math.round((safeToUseCount / totalReports) * 100) : 100;
    const maintenanceRequiredCount = filteredReports.filter((r) => r.summary.maintenanceRequired).length;
    const urgentWorkOrdersCount = workOrders.filter((w) => w.priority === 'Urgent' && w.status !== 'completed').length;

    // Defects and categories
    let totalDefects = 0;
    let criticalReplaceCount = 0;
    let repairCount = 0;
    const componentDefectMap: Record<string, { name: string; count: number; category: string; examples: string[] }> = {};

    filteredReports.forEach((report) => {
      report.sections.forEach((sec) => {
        sec.items.forEach((item) => {
          const isDefect =
            item.status === 'replace' ||
            item.status === 'repair' ||
            item.status === 'fail' ||
            item.status === 'faulty' ||
            item.status === 'no';

          if (isDefect) {
            totalDefects++;
            if (item.status === 'replace' || item.status === 'fail') {
              criticalReplaceCount++;
            } else {
              repairCount++;
            }

            // Categorize into subsystems
            let category = 'Mechanical & Drive';
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes('oiler') || nameLower.includes('lubricat') || nameLower.includes('grease') || nameLower.includes('festo')) {
              category = 'Lubrication & Oilers';
            } else if (nameLower.includes('tube') || nameLower.includes('burner') || nameLower.includes('refractory') || nameLower.includes('combustion')) {
              category = 'Burners & Flame Tubes';
            } else if (nameLower.includes('bearing') || nameLower.includes('shaft') || nameLower.includes('collar')) {
              category = 'Bearings & Shafts';
            } else if (nameLower.includes('wear') || nameLower.includes('strip') || nameLower.includes('guide')) {
              category = 'Wear Strips & Guides';
            } else if (nameLower.includes('belt') || nameLower.includes('link') || nameLower.includes('chain') || nameLower.includes('slat')) {
              category = 'Belts, Chains & Slats';
            } else if (nameLower.includes('safety') || nameLower.includes('e-stop') || nameLower.includes('tilt') || nameLower.includes('lockout') || nameLower.includes('interlock')) {
              category = 'Safeties & Interlocks';
            } else if (nameLower.includes('valve') || nameLower.includes('coil') || nameLower.includes('pump') || nameLower.includes('strainer')) {
              category = 'Refrigeration & Piping';
            }

            if (!componentDefectMap[category]) {
              componentDefectMap[category] = { name: category, count: 0, category, examples: [] };
            }
            componentDefectMap[category].count++;
            if (componentDefectMap[category].examples.length < 3 && item.notes) {
              componentDefectMap[category].examples.push(item.notes);
            }
          }
        });
      });
    });

    const defectSubsystems = Object.values(componentDefectMap).sort((a, b) => b.count - a.count);

    // Group by Plant
    const plantMap: Record<string, { plant: string; total: number; safe: number; unsafe: number; majorRepairs: number }> = {};
    filteredReports.forEach((r) => {
      const plantKey = r.assetDetails.name || 'Unknown Facility';
      if (!plantMap[plantKey]) {
        plantMap[plantKey] = { plant: plantKey, total: 0, safe: 0, unsafe: 0, majorRepairs: 0 };
      }
      plantMap[plantKey].total++;
      if (r.summary.assetSafeToUse) {
        plantMap[plantKey].safe++;
      } else {
        plantMap[plantKey].unsafe++;
      }
      if (r.summary.overallCondition.includes('Major') || r.summary.overallCondition.includes('Critical')) {
        plantMap[plantKey].majorRepairs++;
      }
    });

    const plantRankings = Object.values(plantMap).sort((a, b) => b.majorRepairs - a.majorRepairs);

    // Condition Breakdown
    const conditionBreakdown: Record<string, number> = {
      'Excellent Condition': 0,
      'Good Condition': 0,
      'A little wear': 0,
      'Minor Repair required': 0,
      'Major Repair required': 0,
      'Critical - Shut Down Immediately': 0,
    };
    filteredReports.forEach((r) => {
      const cond = r.summary.overallCondition;
      if (conditionBreakdown[cond] !== undefined) {
        conditionBreakdown[cond]++;
      }
    });

    return {
      totalReports,
      safeRate,
      maintenanceRequiredCount,
      urgentWorkOrdersCount,
      totalDefects,
      criticalReplaceCount,
      repairCount,
      defectSubsystems,
      plantRankings,
      conditionBreakdown,
    };
  }, [filteredReports, workOrders]);

  // Management Inspector Leaderboard metrics
  const inspectorLeaderboard = useMemo(() => {
    return technicianUsers.map((tech) => {
      const techReports = reports.filter((r) =>
        r.inspectorName.toLowerCase().includes(tech.name.toLowerCase())
      );
      const techOrders = workOrders.filter((w) =>
        w.assignedTo.toLowerCase().includes(tech.name.toLowerCase())
      );
      const safeCount = techReports.filter((r) => r.summary.assetSafeToUse).length;
      const safePct = techReports.length > 0 ? Math.round((safeCount / techReports.length) * 100) : 100;

      let defectTotal = 0;
      let criticalTotal = 0;
      techReports.forEach((r) => {
        r.sections.forEach((s) => {
          s.items.forEach((item) => {
            if (
              item.status === 'replace' ||
              item.status === 'repair' ||
              item.status === 'fail' ||
              item.status === 'faulty'
            ) {
              defectTotal++;
              if (item.status === 'replace' || item.status === 'fail') {
                criticalTotal++;
              }
            }
          });
        });
      });

      const openOrders = techOrders.filter((w) => w.status !== 'completed').length;
      const completedOrders = techOrders.filter((w) => w.status === 'completed').length;

      return {
        user: tech,
        reportsCount: techReports.length,
        safePct,
        defectTotal,
        criticalTotal,
        openOrders,
        completedOrders,
        totalOrders: techOrders.length,
      };
    });
  }, [reports, workOrders, technicianUsers]);

  // Non-Management View: Clean Access Gate + Personal Scoped Metrics
  if (!isManagement) {
    return (
      <div className="space-y-6">
        {/* Access Barrier Banner */}
        <div className="rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 via-white to-red-50 p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-300 text-amber-700">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Management Category Required for Fleet Diagnostics
                  </h2>
                  <span className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                    Restricted Scope
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Per the Dale Automation data governance policy, field service engineers only have access to reports, tickets, and inspections pertaining directly to them. Cross-plant reliability statistics, company-wide defect diagnostics, and QA manager leaderboards are restricted to the <strong>Management &amp; Executive Category</strong> (Nico van Wyk / SHEQ Director).
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Switch to Management Category</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Personal Scoped Statistics */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Your Personal Field Service Record
                </h3>
                <p className="text-xs text-slate-500">
                  {currentUser.name} &bull; {currentUser.title}
                </p>
              </div>
            </div>

            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              Personal Scope Active
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">My Inspections Conducted</span>
                <FileText className="h-4 w-4 text-slate-700" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {personalStats.myReports.length}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Authored by you</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Safe-To-Use Compliance</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {personalStats.safeRate}%
              </div>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">Plant operation sign-off</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Defects Flagged</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {personalStats.defectsCount}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Component repair/replace items</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Assigned Remedial Orders</span>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {personalStats.pendingOrdersCount}
              </div>
              <p className="mt-1 text-[11px] text-blue-600 font-medium">
                {personalStats.urgentOrdersCount} urgent pending
              </p>
            </div>
          </div>

          {/* Quick links to personal items */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            {onNavigateToReports && (
              <button
                type="button"
                onClick={onNavigateToReports}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span>Go to My Reports ({personalStats.myReports.length})</span>
              </button>
            )}
            {onNavigateToWorkOrders && (
              <button
                type="button"
                onClick={onNavigateToWorkOrders}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                <span>Go to My Work Orders ({personalStats.pendingOrdersCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
            >
              <span>Manager PIN Bypass (1234)</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
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

  // Management Category View: Full Fleet Diagnostics + Inspector Filtering + Quality Leaderboard
  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Equipment Reliability &amp; Failure Trends
                  </h2>
                  <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-800">
                    Management Portal
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">
                  Executive analytics across Dale Automation commissioning and maintenance inspections. Active Manager: <strong>{currentUser.name}</strong> ({currentUser.title}).
                </p>
              </div>
            </div>
          </div>

          {/* Plant & Inspector Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Plant Filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium text-slate-600">Plant:</span>
              <select
                value={selectedPlantFilter}
                onChange={(e) => setSelectedPlantFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-hidden"
              >
                <option value="All">All Client Plants ({plantOptions.length})</option>
                {plantOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Inspector Filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
              <UserCheck className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium text-slate-600">Inspector:</span>
              <select
                value={selectedInspectorFilter}
                onChange={(e) => setSelectedInspectorFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-hidden"
              >
                <option value="All">All Field Engineers ({inspectorOptions.length})</option>
                {inspectorOptions.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters if filtered */}
            {(selectedPlantFilter !== 'All' || selectedInspectorFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlantFilter('All');
                  setSelectedInspectorFilter('All');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3 w-3 text-slate-500" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCreateWorkOrder}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Create Remedial Ticket
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Safe-To-Use Compliance</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.safeRate}%
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Target &gt;90%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                stats.safeRate >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${stats.safeRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Critical Defect Flags</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
              {stats.criticalReplaceCount}
            </span>
            <span className="text-[11px] text-slate-500">
              Immediate replacement
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Plus {stats.repairCount} minor repair items
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Audited Reports Sample</span>
            <BarChart3 className="h-4 w-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.totalReports}
            </span>
            <span className="text-[11px] text-slate-500">
              Across {plantOptions.length} Plants
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {stats.maintenanceRequiredCount} flagged maintenance
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Open Remedial Tickets</span>
            <Wrench className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {workOrders.filter((w) => w.status !== 'completed').length}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">
              {stats.urgentWorkOrdersCount} Urgent
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Dispatched to Field Engineers
          </p>
        </div>
      </div>

      {/* Field Service Engineers Quality & Workload Leaderboard */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-xs">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Field Service Engineers — Quality, Safety &amp; Workload Leaderboard
              </h3>
              <p className="text-xs text-slate-500">
                Performance metrics, inspection volumes, and remedial tickets per technician
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-slate-500">
            Showing {inspectorLeaderboard.length} Field Service Engineers
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-semibold">Engineer</th>
                <th className="pb-3 font-semibold text-center">Inspections</th>
                <th className="pb-3 font-semibold text-center">Safe Compliance</th>
                <th className="pb-3 font-semibold text-center">Critical Defects</th>
                <th className="pb-3 font-semibold text-center">Active Work Orders</th>
                <th className="pb-3 font-semibold text-right">Quick Filter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspectorLeaderboard.map((row) => {
                const isSelected = selectedInspectorFilter === row.user.name;
                return (
                  <tr
                    key={row.user.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isSelected ? 'bg-red-50/60' : ''
                    }`}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white">
                          {row.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{row.user.name}</span>
                            {isSelected && (
                              <span className="rounded-sm bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                Filtered
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{row.user.title}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {row.reportsCount}
                    </td>

                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold tabular-nums">
                        <span
                          className={
                            row.safePct >= 85
                              ? 'text-emerald-700'
                              : row.safePct >= 70
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {row.safePct}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-center font-mono tabular-nums">
                      <span
                        className={`font-bold ${
                          row.criticalTotal > 0 ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {row.criticalTotal}
                      </span>
                      <span className="text-slate-400 text-[11px]"> ({row.defectTotal} total)</span>
                    </td>

                    <td className="py-3 text-center font-mono tabular-nums">
                      <span
                        className={`font-bold ${
                          row.openOrders > 0 ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      >
                        {row.openOrders} Open
                      </span>
                      <span className="text-slate-400 text-[11px]"> / {row.totalOrders} total</span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedInspectorFilter(isSelected ? 'All' : row.user.name)
                        }
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors shadow-2xs ${
                          isSelected
                            ? 'border-red-300 bg-red-600 text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? 'Clear Filter' : 'Filter Stats'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure Breakdown & High Risk Assets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subsystem Failure Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Recurring Failure Bottlenecks (Defect Subsystems)
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {stats.totalDefects} Total Flagged
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {stats.defectSubsystems.map((sub, idx) => {
              const pct = stats.totalDefects > 0 ? Math.round((sub.count / stats.totalDefects) * 100) : 0;
              return (
                <div key={sub.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {idx + 1}. {sub.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {sub.count} flags ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-rose-600'
                          : idx === 1
                          ? 'bg-amber-500'
                          : idx === 2
                          ? 'bg-blue-600'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {sub.examples.length > 0 && (
                    <p className="text-[11px] text-slate-500 truncate italic">
                      &quot;{sub.examples[0]}&quot;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plant Reliability Ranking */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Plant Reliability Rankings &amp; Wear Hotspots
            </h3>
            <span className="text-xs font-medium text-slate-500">
              By Critical / Major Repairs
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {stats.plantRankings.map((p, idx) => {
              const safePct = p.total > 0 ? Math.round((p.safe / p.total) * 100) : 100;
              return (
                <div
                  key={p.plant}
                  className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-900">{p.plant}</span>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        p.majorRepairs > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {p.majorRepairs} Major/Critical
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>
                      {p.total} Audits ({p.safe} Safe / {p.unsafe} Unsafe)
                    </span>
                    <span className="font-bold text-slate-700">{safePct}% Safe Compliance</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engineering Root-Cause Insights & Condition Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Actionable Engineering Root-Cause Fixes */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Actionable Preventative Engineering Prescriptions
            </h3>
            <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Reliability Advisory</span>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {/* Insight 1: Lubrication & Wear Strips */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5">
              <div className="flex items-start gap-2.5">
                <Wrench className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Festo Oiler Blockages Accelerating Wear Strips
                  </h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    In 75% of inspected double drum spirals (Albany PMB, Blue Ribbon Mthatha), clogged oiler blocks directly caused severe HDPE rail wear strip grooving.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Action: Mandate bi-weekly Festo splitter flushing &amp; Habotec FG46 verification.
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 2: Flame Tube Refractory Degradation */}
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3.5">
              <div className="flex items-start gap-2.5">
                <Flame className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Oven 2.4m Flame Tube Refractory Spalling
                  </h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    Sunbake Benoni and Sasko Duens continuous tunnel ovens report refractory cracking away from the steel flame tubes, causing hot-spot inefficiencies.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-red-900 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Action: Dispatch welding team to sleeve throat rings before winter peak bake runs.
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 3: Bolt Corrosion in High Humidity */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Internal Drum Fasteners Rusting
                  </h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    Mild steel bolts on internal drum spokes corrode under damp CIP washdown cycles.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Action: Standardize on A4-80 316 Stainless fasteners on all new installations.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Overall Condition Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
            Overall Asset Condition Spectrum
          </h3>

          <div className="mt-3 space-y-2">
            {Object.entries(stats.conditionBreakdown).map(([cond, count]) => {
              const countPct = stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0;
              const isMajor = cond.includes('Major') || cond.includes('Critical');
              const isGood = cond.includes('Excellent') || cond.includes('Good');
              return (
                <div key={cond} className="flex items-center justify-between text-xs py-1">
                  <span className={`font-medium ${isMajor ? 'text-rose-700' : isGood ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {cond}
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-bold text-slate-900">{count}</span>
                    <span className="text-slate-400 w-10 text-right">({countPct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
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
};

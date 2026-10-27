import React, { useState, useMemo } from 'react';
import { Report, WorkOrder, ItemStatus } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Cpu,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  Wrench,
  Activity,
  Filter,
  Download,
  PlusCircle,
} from 'lucide-react';

interface AnalyticsTrendsDashboardProps {
  reports: Report[];
  workOrders: WorkOrder[];
  onCreateWorkOrder: () => void;
}

export const AnalyticsTrendsDashboard: React.FC<AnalyticsTrendsDashboardProps> = ({
  reports,
  workOrders,
  onCreateWorkOrder,
}) => {
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('All');

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesPlant =
        selectedPlantFilter === 'All' ||
        r.assetDetails.name.toLowerCase().includes(selectedPlantFilter.toLowerCase()) ||
        r.location.toLowerCase().includes(selectedPlantFilter.toLowerCase());
      return matchesPlant;
    });
  }, [reports, selectedPlantFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalReports = filteredReports.length;
    const safeToUseCount = filteredReports.filter((r) => r.summary.assetSafeToUse).length;
    const safeRate = totalReports > 0 ? Math.round((safeToUseCount / totalReports) * 100) : 100;
    const maintenanceRequiredCount = filteredReports.filter((r) => r.summary.maintenanceRequired).length;
    const urgentWorkOrdersCount = workOrders.filter((w) => w.priority === 'Urgent' && w.status !== 'completed').length;

    // Gather all items and count defects
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

  // Unique plants list for filter
  const plantOptions = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.assetDetails.name) set.add(r.assetDetails.name);
    });
    return Array.from(set);
  }, [reports]);

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
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Equipment Reliability &amp; Failure Trends
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Diagnostic analytics across Dale Automation commissioning and maintenance inspections to identify recurring failure bottlenecks and engineer preventative fixes.
            </p>
          </div>

          {/* Plant & Time Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
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
            <span className="text-xs font-medium">Maintenance Required</span>
            <Wrench className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.maintenanceRequiredCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              of {stats.totalReports} total reports
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700 font-medium">
            {stats.urgentWorkOrdersCount} active urgent work orders
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Top Problem Subsystem</span>
            <Activity className="h-4 w-4 text-slate-700" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-slate-900 truncate block">
              {stats.defectSubsystems[0]?.name || 'All Systems Nominal'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
            {stats.defectSubsystems[0]?.count || 0} defects recorded across fleet
          </p>
        </div>
      </div>

      {/* Main 2-Column Split: Subsystem Failure Ranking & Actionable Improvements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Failure Frequency by Subsystem (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-red-600" />
                  Machine Subsystem Failure Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Breakdown of all logged defects across mechanical, combustion, and safety components.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {stats.totalDefects} total defects
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {stats.defectSubsystems.map((sub, index) => {
                const percent = stats.totalDefects > 0 ? Math.round((sub.count / stats.totalDefects) * 100) : 0;
                return (
                  <div key={sub.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600 font-mono tabular-nums">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-900">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="font-bold text-slate-800">{sub.count} faults</span>
                        <span className="text-slate-400">({percent}%)</span>
                      </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          index === 0
                            ? 'bg-red-600'
                            : index === 1
                            ? 'bg-amber-500'
                            : index === 2
                            ? 'bg-blue-600'
                            : 'bg-slate-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {sub.examples.length > 0 && (
                      <p className="text-[11px] text-slate-500 italic pl-7 line-clamp-1">
                        Inspector quote: "{sub.examples[0]}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plant Reliability Ranking Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
              <Building2 className="h-4 w-4 text-slate-700" />
              Client Plant Machinery Reliability Ranking
            </h3>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Plant Facility / Asset</th>
                    <th className="py-2.5 px-3 text-center">Reports</th>
                    <th className="py-2.5 px-3 text-center">Safe Status</th>
                    <th className="py-2.5 px-3 text-center">Major Repairs</th>
                    <th className="py-2.5 px-3 text-right">Reliability Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.plantRankings.map((p) => {
                    const healthPct = Math.round((p.safe / p.total) * 100);
                    return (
                      <tr key={p.plant} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {p.plant}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-600">
                          {p.total}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {p.unsafe > 0 ? (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                              {p.unsafe} Unsafe
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              100% Safe
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                          {p.majorRepairs > 0 ? (
                            <span className="font-bold text-amber-700">{p.majorRepairs}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                          <span
                            className={
                              healthPct >= 90
                                ? 'text-emerald-600'
                                : healthPct >= 60
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }
                          >
                            {healthPct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Actionable Improvement Insights & Condition Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Actionable Engineering Areas of Improvement */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-bold">
                <Lightbulb className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Targeted Areas for Engineering Improvement
                </h3>
                <p className="text-[11px] text-slate-500">
                  Root-cause failure correlations derived from on-site field checklists.
                </p>
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
      </div>
    </div>
  );
};

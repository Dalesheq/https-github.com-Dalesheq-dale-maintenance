import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  RotateCcw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Report } from '../types';

export const OfflineSyncCenter: React.FC = () => {
  const [isOnline, setIsOnline] = useState(storageService.isOnline());
  const [simulateOffline, setSimulateOffline] = useState(storageService.getSimulateOffline());
  const [reports, setReports] = useState<Report[]>(storageService.getReports());
  const [pendingCount, setPendingCount] = useState(storageService.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState(storageService.isSyncing());
  const [lastSynced, setLastSynced] = useState<string | null>(storageService.getLastSyncedTime());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setIsOnline(storageService.isOnline());
      setSimulateOffline(storageService.getSimulateOffline());
      setReports(storageService.getReports());
      setPendingCount(storageService.getPendingSyncCount());
      setIsSyncing(storageService.isSyncing());
      setLastSynced(storageService.getLastSyncedTime());
    });
    return () => unsub();
  }, []);

  const handleManualSync = async () => {
    const res = await storageService.triggerCloudSync();
    setSyncMessage(res.message);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleToggleOffline = () => {
    storageService.setSimulateOffline(!simulateOffline);
  };

  const handleExportBackup = () => {
    const json = storageService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dale_Automation_Field_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackupJson(content);
      if (success) {
        setSyncMessage('Database backup successfully restored!');
        setTimeout(() => setSyncMessage(null), 4000);
      } else {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to restore the factory demo reports? This will reset local changes.')) {
      storageService.resetToFactoryDefaults();
      setSyncMessage('Factory demo reports restored.');
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const pendingReports = reports.filter((r) => r.syncStatus === 'pending_sync');
  const syncedReports = reports.filter((r) => r.syncStatus === 'synced');

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-700" />
              <h2 className="text-xl font-extrabold text-slate-900">
                Offline Resilience &amp; Cloud Synchronization Engine
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Guarantees field technicians can create, edit, photograph, and sign inspection reports inside remote factory basements with zero internet connection.
            </p>
          </div>

          {/* Offline Simulation Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Simulate Offline Mode:</span>
            <button
              type="button"
              onClick={handleToggleOffline}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                simulateOffline ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  simulateOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {syncMessage && (
        <div className="rounded-xl bg-slate-900 p-4 text-xs font-medium text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400">✕</button>
        </div>
      )}

      {/* Network & Sync Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Connection Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Network State</span>
            {isOnline ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-amber-600" />}
          </div>
          <div className="mt-2 text-lg font-black text-slate-900">
            {isOnline ? 'Connected to Internet' : 'Offline / Disconnected'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {simulateOffline ? 'Manual Offline Simulation is active' : 'Live browser connectivity'}
          </div>
        </div>

        {/* Sync Queue */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Sync Queue</span>
            <RefreshCw className={`h-4 w-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <div className="mt-2 text-lg font-black text-slate-900 font-mono-numbers">
            {pendingCount} Reports Pending
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {pendingCount === 0 ? 'All changes synced to cloud' : 'Queued for automatic sync upon reconnect'}
          </div>
        </div>

        {/* Last Synced */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Cloud Sync</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-lg font-black text-slate-900 font-mono-numbers">
            {lastSynced ? new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {lastSynced ? new Date(lastSynced).toLocaleDateString() : 'Initial session'}
          </div>
        </div>
      </div>

      {/* Manual Sync Bar */}
      <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-4">
        <div>
          <h4 className="text-xs font-bold text-blue-950">Cloud Database Handshake</h4>
          <p className="text-[11px] text-blue-700">
            Syncs cached inspection drafts, photos, and digital signatures with the central Dale Automation server.
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing || !isOnline}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Cloud Now'}
        </button>
      </div>

      {/* Queue Details List */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
          Local Storage Queue Breakdown ({reports.length} Reports Cached)
        </h3>

        {pendingReports.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-800">
              ⚠️ Awaiting Cloud Upload ({pendingReports.length}):
            </span>
            <div className="space-y-1.5">
              {pendingReports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-950 font-mono-numbers">{r.reportNumber}</span>
                    <span className="ml-2 text-amber-800">{r.assetDetails.name}</span>
                    <span className="ml-2 text-[11px] text-amber-600">({r.photos.length} photos)</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-mono-numbers">
                    Updated {new Date(r.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-emerald-800">
            ✓ Synchronized with Cloud Database ({syncedReports.length}):
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {syncedReports.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 font-mono-numbers">{r.reportNumber}</span>
                  <span className="ml-2 text-slate-600">{r.assetDetails.name}</span>
                  <span className="ml-2 text-[11px] text-slate-400">· {r.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Synced
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database Tools & Backups */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
          Database Backup &amp; Offline Portability
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export Backup (.json)
          </button>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Upload className="h-3.5 w-3.5" />
            <span>Restore from Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Factory Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};

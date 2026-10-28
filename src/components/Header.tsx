import React, { useState, useEffect } from 'react';
import {
  FileText,
  ClipboardList,
  ShieldCheck,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
  Plus,
  UserCheck,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Lock,
  KeyRound,
  Users,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { PushNotification, UserProfile } from '../types';
import { USERS } from '../data/initialData';
import { ManagementLoginModal } from './ManagementLoginModal';

export type NavTab =
  | 'reports'
  | 'work-orders'
  | 'template-builder'
  | 'trends-dashboard'
  | 'manager-dashboard'
  | 'sync-center';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewReport: () => void;
  onSelectWorkOrder?: (woId: string) => void;
  onSelectReport?: (reportId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onNewReport,
  onSelectWorkOrder,
  onSelectReport,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getCurrentUser());
  const [isOnline, setIsOnline] = useState<boolean>(storageService.isOnline());
  const [simulateOffline, setSimulateOffline] = useState<boolean>(storageService.getSimulateOffline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(storageService.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(storageService.isSyncing());
  const [notifications, setNotifications] = useState<PushNotification[]>(storageService.getNotifications());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCurrentUser(storageService.getCurrentUser());
      setIsOnline(storageService.isOnline());
      setSimulateOffline(storageService.getSimulateOffline());
      setPendingSyncCount(storageService.getPendingSyncCount());
      setIsSyncing(storageService.isSyncing());
      setNotifications(storageService.getNotifications());
    });
    return () => unsubscribe();
  }, []);

  const isManagement = currentUser.role === 'manager' || currentUser.role === 'admin';
  const visibleNotifications = storageService.getNotificationsForUser(currentUser);
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const visibleWorkOrders = storageService.getWorkOrdersForUser(currentUser);
  const pendingWorkOrdersCount = visibleWorkOrders.filter((w) => w.status !== 'completed').length;

  const handleSyncNow = async () => {
    const res = await storageService.triggerCloudSync();
    setSyncToastMessage(res.message);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  const handleToggleOffline = () => {
    storageService.setSimulateOffline(!simulateOffline);
  };

  const handleSwitchUser = (user: UserProfile) => {
    storageService.setCurrentUser(user);
    setIsUserMenuOpen(false);
    if ((user.role === 'manager' || user.role === 'admin') && currentTab === 'reports') {
      onTabChange('trends-dashboard');
    }
  };

  const handleNotificationClick = (notif: PushNotification) => {
    storageService.markNotificationAsRead(notif.id);
    setIsNotifOpen(false);
    if (notif.workOrderId && onSelectWorkOrder) {
      onTabChange('work-orders');
      onSelectWorkOrder(notif.workOrderId);
    } else if (notif.reportId && onSelectReport) {
      onTabChange('reports');
      onSelectReport(notif.reportId);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Zone 1: Dale Automation Wordmark Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('reports')}>
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                <div className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                <div className="absolute bottom-1 left-1 h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-black tracking-tighter">DA</span>
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                  Dale Automation
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-slate-400">
                  Heavy Industrial Field Ops
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Tailored to Role) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('reports')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'reports'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              {isManagement ? 'All Reports' : 'My Reports'}
            </button>

            <button
              onClick={() => onTabChange('work-orders')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'work-orders'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              {isManagement ? 'Work Orders' : 'My Work Orders'}
              {pendingWorkOrdersCount > 0 && (
                <span className="ml-0.5 rounded-sm bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                  {pendingWorkOrdersCount}
                </span>
              )}
            </button>

            {/* Management-Only Tabs: Approvals & Stats */}
            {isManagement ? (
              <>
                <button
                  onClick={() => onTabChange('manager-dashboard')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'manager-dashboard'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-purple-700" />
                  Approvals
                </button>

                <button
                  onClick={() => onTabChange('trends-dashboard')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === 'trends-dashboard'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Fleet Stats &amp; Trends
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsManagementModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/80 px-2.5 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-100 transition-colors shadow-2xs"
                title="Log in to management category to view company-wide statistics"
              >
                <Lock className="h-3.5 w-3.5 text-purple-700" />
                <span>Management Login / Stats</span>
              </button>
            )}

            <button
              onClick={() => onTabChange('template-builder')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'template-builder'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="h-4 w-4 text-red-600" />
              Checklist Builder
            </button>

            <button
              onClick={() => onTabChange('sync-center')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'sync-center'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              Sync
              {pendingSyncCount > 0 && (
                <span className="ml-0.5 rounded-sm bg-amber-100 px-1 py-0.2 text-[10px] font-bold text-amber-800">
                  {pendingSyncCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Interactive Controls & Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Online / Offline Status Button */}
            <button
              type="button"
              onClick={handleToggleOffline}
              title={simulateOffline ? 'Currently Simulating Offline Mode. Click to go online.' : 'Click to simulate offline mode'}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                isOnline
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              )}
            </button>

            {/* Quick Sync Button if pending items */}
            {pendingSyncCount > 0 && isOnline && (
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync {pendingSyncCount}</span>
              </button>
            )}

            {/* Push Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-slate-800" />
                      <h4 className="text-xs font-bold text-slate-900">
                        {isManagement ? 'Fleet Notifications & Alerts' : 'My Notifications & Alerts'}
                      </h4>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => storageService.markAllNotificationsAsRead()}
                        className="text-[11px] font-medium text-blue-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {visibleNotifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications for your profile
                      </div>
                    ) : (
                      visibleNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`cursor-pointer p-2.5 transition-colors hover:bg-slate-50 ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono-numbers">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Menu Categorized by Management vs Field Engineers */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs text-slate-800 transition-colors ${
                  isManagement
                    ? 'border-purple-300 bg-purple-50/70 hover:bg-purple-100/70'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-700 text-white'
                    : currentUser.role === 'manager'
                    ? 'bg-purple-900 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 leading-tight">{currentUser.name}</span>
                    <span className={`rounded-sm px-1 py-0.2 text-[9px] font-extrabold uppercase ${
                      isManagement ? 'bg-purple-200 text-purple-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'manager' ? 'Manager' : 'Field Tech'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{currentUser.title}</div>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl z-50 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      User Accounts by Access Category
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsManagementModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-purple-700 hover:underline flex items-center gap-1"
                    >
                      <Lock className="h-3 w-3" />
                      Management Portal
                    </button>
                  </div>

                  {/* Category 1: Management & Executive (Full Stats & Approvals) */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 rounded bg-purple-50 text-[10px] font-extrabold uppercase tracking-wider text-purple-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
                        Management Category (Stats &amp; QA)
                      </span>
                      <span className="text-[9px] font-bold text-purple-700">Fleet Scope</span>
                    </div>

                    {USERS.filter((u) => u.role === 'manager' || u.role === 'admin').map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user)}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          currentUser.id === user.id
                            ? 'bg-purple-900 text-white font-semibold shadow-2xs'
                            : 'text-slate-700 hover:bg-purple-50/70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{user.name}</span>
                            <span className={`rounded-sm px-1 py-0.2 text-[9px] font-extrabold uppercase ${
                              currentUser.id === user.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <div className={`text-[10px] ${currentUser.id === user.id ? 'text-purple-200' : 'text-slate-400'}`}>
                            {user.title}
                          </div>
                        </div>
                        {currentUser.id === user.id && <UserCheck className="h-3.5 w-3.5 text-purple-300" />}
                      </button>
                    ))}
                  </div>

                  {/* Category 2: Field Service Engineers (Personal Task Scope) */}
                  <div className="space-y-1 pt-1">
                    <div className="px-2 py-1 rounded bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-600" />
                        Field Service Engineers
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">Personal Scope</span>
                    </div>

                    {USERS.filter((u) => u.role === 'technician').map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user)}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          currentUser.id === user.id
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{user.name}</span>
                          </div>
                          <div className={`text-[10px] ${currentUser.id === user.id ? 'text-slate-300' : 'text-slate-400'}`}>
                            {user.title}
                          </div>
                        </div>
                        {currentUser.id === user.id && <UserCheck className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>

                  {/* Direct Management Switcher CTA */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsManagementModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white py-2 text-xs font-bold transition-colors shadow-xs"
                    >
                      <Lock className="h-3.5 w-3.5 text-purple-200" />
                      Login as Management for Full Stats
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button: New Report */}
            <button
              type="button"
              onClick={onNewReport}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>New Report</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-100 px-3 py-1.5 bg-slate-50 overflow-x-auto gap-2">
          <button
            onClick={() => onTabChange('reports')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              currentTab === 'reports' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            {isManagement ? 'Reports' : 'My Reports'}
          </button>
          <button
            onClick={() => onTabChange('work-orders')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              currentTab === 'work-orders' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            {isManagement ? 'Work Orders' : 'My Work Orders'}
            {pendingWorkOrdersCount > 0 && ` (${pendingWorkOrdersCount})`}
          </button>

          {isManagement ? (
            <>
              <button
                onClick={() => onTabChange('manager-dashboard')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
                  currentTab === 'manager-dashboard' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Approvals
              </button>
              <button
                onClick={() => onTabChange('trends-dashboard')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
                  currentTab === 'trends-dashboard' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Fleet Stats
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsManagementModalOpen(true)}
              className="px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap bg-purple-100 text-purple-900"
            >
              Management Login
            </button>
          )}

          <button
            onClick={() => onTabChange('template-builder')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              currentTab === 'template-builder' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            Checklists
          </button>

          <button
            onClick={() => onTabChange('sync-center')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
              currentTab === 'sync-center' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            Sync ({pendingSyncCount})
          </button>
        </div>
      </header>

      {/* Dedicated Management Login Modal */}
      <ManagementLoginModal
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
        onLoginSuccess={(managerUser, targetDest) => {
          setCurrentUser(managerUser);
          onTabChange(targetDest === 'approvals' ? 'manager-dashboard' : 'trends-dashboard');
          setSyncToastMessage(`Logged in as ${managerUser.name}. Management access active.`);
          setTimeout(() => setSyncToastMessage(null), 3500);
        }}
      />

      {/* Sync / Action confirmation Toast */}
      {syncToastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{syncToastMessage}</span>
        </div>
      )}
    </>
  );
};

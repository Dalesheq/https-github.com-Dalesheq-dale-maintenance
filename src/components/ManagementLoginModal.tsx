import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  UserCheck,
  X,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { UserProfile } from '../types';
import { USERS } from '../data/initialData';
import { storageService } from '../services/storageService';

interface ManagementLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, targetDestination?: 'trends' | 'approvals') => void;
}

export const ManagementLoginModal: React.FC<ManagementLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const managementUsers = USERS.filter((u) => u.role === 'manager' || u.role === 'admin');
  const [selectedUser, setSelectedUser] = useState<UserProfile>(managementUsers[0]);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = (targetUser: UserProfile, destination: 'trends' | 'approvals') => {
    storageService.setCurrentUser(targetUser);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onLoginSuccess(targetUser, destination);
      onClose();
    }, 400);
  };

  const handlePinSubmit = (e: React.FormEvent, destination: 'trends' | 'approvals') => {
    e.preventDefault();
    setErrorMsg(null);

    // Standard supervisory PIN for Dale Automation is 1234 or empty in dev
    if (pin && pin !== '1234') {
      setErrorMsg('Invalid Supervisor PIN. Default management PIN is 1234.');
      return;
    }

    storageService.setCurrentUser(selectedUser);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onLoginSuccess(selectedUser, destination);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Management Portal Login</h3>
                <span className="rounded bg-purple-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200 border border-purple-800/60">
                  Executive Category
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Unlock fleet analytics, commissioning trends, and manager signoff controls.
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
        <div className="p-6 space-y-5">
          {/* Information box */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3.5 text-xs text-purple-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-purple-950">
              <Lock className="h-3.5 w-3.5 text-purple-700" />
              Role-Based Privacy &amp; Stats Oversight
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              Field Engineers are restricted to viewing only reports and work orders pertaining to them. Management login grants company-wide statistics, inspector performance reviews, and QA signoff rights.
            </p>
          </div>

          {/* Management Profiles Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Management Account
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {managementUsers.map((mUser) => {
                const isSelected = selectedUser.id === mUser.id;
                return (
                  <div
                    key={mUser.id}
                    onClick={() => setSelectedUser(mUser)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{mUser.name}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                          {mUser.role === 'admin' ? 'Admin' : 'Manager'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{mUser.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">{mUser.email}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-purple-700">
                      <span>{isSelected ? 'Selected' : 'Select'}</span>
                      {isSelected ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supervisor Verification Form */}
          <form onSubmit={(e) => handlePinSubmit(e, 'trends')} className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                  Supervisor PIN (Default: 1234)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Quick sign-in available below</span>
              </div>
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 1234 or click Quick Sign-In"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono tracking-widest text-slate-900 focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Management credentials verified. Accessing statistics...</span>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(selectedUser, 'trends')}
                className="flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-800 transition-colors shadow-xs"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Login &amp; View Fleet Stats</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(selectedUser, 'approvals')}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                <span>Login &amp; View Approvals</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <span className="text-[11px] text-slate-500">
            Current active user: <strong>{storageService.getCurrentUser().name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

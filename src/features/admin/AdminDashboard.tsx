/**
 * Admin Portal Workspace Dashboard
 * Central hub for fleet monitoring, captain approvals, fare configuration, and audit logging
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminOverview } from './AdminOverview';
import { CaptainManagement } from './CaptainManagement';
import { RideMonitoring } from './RideMonitoring';
import { FareRulesConfig } from './FareRulesConfig';
import { PromotionsManager } from './PromotionsManager';
import { AuditLogsView } from './AuditLogsView';
import { AppwriteConsoleGuide } from './AppwriteConsoleGuide';
import { RealtimeDashboardView } from './RealtimeDashboardView';
import {
  LayoutDashboard,
  Shield,
  Activity,
  DollarSign,
  Tag,
  ShieldCheck,
  Database,
  Lock,
  Radio,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, role, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'captains' | 'rides' | 'pricing' | 'promotions' | 'audit' | 'realtime' | 'setup'
  >('overview');

  // Strict Role Gate: If not admin, render secure promotion / switch screen
  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center space-y-4 shadow-2xl text-xs">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Restricted Administrator Area</h2>
        <p className="text-neutral-400 leading-relaxed">
          You are currently signed in as a <strong className="text-white capitalize">{role}</strong>.
          Only authenticated administrators have permission to access fleet operations and fare controls.
        </p>
        <div className="pt-2">
          <button
            onClick={() => switchDemoRole('admin')}
            className="w-full py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer text-xs"
          >
            Switch to Fleet Admin Profile (Demo Mode)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-neutral-950">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-neutral-800 bg-neutral-950 p-4 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="px-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
              Fleet Command Center
            </span>
            <h2 className="text-sm font-bold text-white mt-0.5">Admin Workspace</h2>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'overview'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('captains')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'captains'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Captain Approvals & Fleet</span>
            </button>

            <button
              onClick={() => setActiveTab('rides')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'rides'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Live Ride Monitoring</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'pricing'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <span>Fare Formulas & Surge</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'promotions'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Tag className="w-4 h-4 text-rose-400" />
              <span>Promotions & Coupons</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'audit'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Security Audit Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('realtime')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'realtime'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Realtime WebSocket Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('setup')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'setup'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Database className="w-4 h-4 text-pink-400" />
              <span>Appwrite Setup Guide</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-neutral-900 text-[10px] text-neutral-500 font-mono">
          RideFlow Admin Core v2.4
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'captains' && <CaptainManagement />}
        {activeTab === 'rides' && <RideMonitoring />}
        {activeTab === 'pricing' && <FareRulesConfig />}
        {activeTab === 'promotions' && <PromotionsManager />}
        {activeTab === 'audit' && <AuditLogsView />}
        {activeTab === 'realtime' && <RealtimeDashboardView />}
        {activeTab === 'setup' && <AppwriteConsoleGuide />}
      </main>
    </div>
  );
};

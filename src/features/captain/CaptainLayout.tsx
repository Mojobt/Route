/**
 * Captain Portal Layout Shell with Sub-Navigation
 */

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Navigation, DollarSign, FileCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CaptainLayout: React.FC = () => {
  const location = useLocation();
  const { captainProfile } = useAuth();

  const isCurrent = (path: string) => {
    if (path === '/captain' && location.pathname === '/captain') return true;
    if (path !== '/captain' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-950">
      {/* Sub-Navigation Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs py-2 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/captain"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isCurrent('/captain')
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Drive & Dispatch</span>
            </Link>

            <Link
              to="/captain/earnings"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isCurrent('/captain/earnings')
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Earnings & Payouts</span>
            </Link>

            <Link
              to="/captain/onboarding"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isCurrent('/captain/onboarding')
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Onboarding & Documents</span>
            </Link>
          </div>

          {captainProfile && captainProfile.approvalStatus !== 'approved' && (
            <div className="hidden sm:flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-amber-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Status: {captainProfile.approvalStatus.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

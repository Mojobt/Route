/**
 * Passenger Portal Layout Shell with Sub-Navigation
 */

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MapPin, History, User } from 'lucide-react';

export const PassengerLayout: React.FC = () => {
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === '/passenger' && location.pathname === '/passenger') return true;
    if (path !== '/passenger' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-950">
      {/* Sub-Navigation Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 text-xs py-2 overflow-x-auto">
          <Link
            to="/passenger"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              isCurrent('/passenger')
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Book a Ride</span>
          </Link>

          <Link
            to="/passenger/history"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              isCurrent('/passenger/history')
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Trip History & Receipts</span>
          </Link>

          <Link
            to="/passenger/profile"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              isCurrent('/passenger/profile')
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Saved Places & Profile</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

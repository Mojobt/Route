/**
 * RideFlow Unified Top Navigation
 * Complies with Top Bar Contract: 3 distinct zones, whitespace-nowrap links, single-line brand.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Database, User, Shield, Car, LogOut, ChevronDown, Check } from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenAppwriteSetup: () => void;
  onOpenRealtimeMonitor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAppwriteSetup, onOpenRealtimeMonitor }) => {
  const { user, role, logout, switchDemoRole, isAppwriteConnected } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    switchDemoRole(newRole);
    setMenuOpen(false);
    if (newRole === 'passenger') navigate('/passenger');
    else if (newRole === 'captain') navigate('/captain');
    else if (newRole === 'admin') navigate('/admin');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold text-lg tracking-tight shadow-sm group-hover:scale-105 transition-transform">
            RF
          </div>
          <span className="text-lg font-bold tracking-tight text-white">RideFlow</span>
        </Link>

        {/* Zone 2: Navigation Links (Single line, 1-2 words) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/passenger"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              isActive('/passenger')
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Passenger
          </Link>
          <Link
            to="/captain"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              isActive('/captain')
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Captain
          </Link>
          <Link
            to="/admin"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              isActive('/admin')
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Admin
          </Link>
          <button
            onClick={onOpenRealtimeMonitor}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Realtime Live</span>
          </button>
          <button
            onClick={onOpenAppwriteSetup}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Appwrite Backend</span>
            {isAppwriteConnected ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-0.5" title="Connected" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-0.5" title="Setup Ready" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Profile / Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-medium text-white text-[11px]">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-medium truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-neutral-400 capitalize">{role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-neutral-800">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-neutral-400 truncate text-[11px]">{user.email}</p>
                  </div>

                  <div className="px-3 py-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Switch Role (Demo Mode)
                    </span>
                    <button
                      onClick={() => handleRoleSwitch('passenger')}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                        role === 'passenger' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>Passenger Portal</span>
                      </div>
                      {role === 'passenger' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('captain')}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                        role === 'captain' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        <span>Captain Portal</span>
                      </div>
                      {role === 'captain' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                        role === 'admin' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Admin Portal</span>
                      </div>
                      {role === 'admin' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>

                  <div className="border-t border-neutral-800 pt-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-neutral-800/60 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-white rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * RideFlow Main Landing Page & Portal Selection
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  User,
  Shield,
  ArrowRight,
  Database,
  Navigation,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAppwriteSetup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAppwriteSetup }) => {
  const { user, role, switchDemoRole } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Unified Appwrite Engine · 3 Workspaces · Real-time Dispatch</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Next-generation ride sharing, architected with <span className="text-pink-400">Appwrite</span>.
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          RideFlow provides a single production codebase powering high-frequency passenger bookings,
          captain driving telemetry, and centralized administrative fleet management.
        </p>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/passenger"
            className="px-6 py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4 text-neutral-950" />
            <span>Launch Passenger Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onOpenAppwriteSetup}
            className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4 text-pink-400" />
            <span>Appwrite Backend Console</span>
          </button>
        </div>
      </section>

      {/* 3 Workspaces Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="text-center mb-8">
          <span className="text-xs uppercase font-mono tracking-widest text-neutral-500">
            Dedicated Workspaces
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            One Shared Backend. Three Tailored Portals.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passenger Portal Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-colors group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold tracking-wider">
                  /passenger
                </span>
                <h3 className="text-lg font-bold text-white">Passenger Workspace</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Interactive Leaflet map routing, upfront transparent fare calculation, 3 vehicle tiers (Economy, Comfort, XL), real-time driver GPS tracking, safety PIN, and instant in-app trip chat.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Click-to-set pickup and dropoff</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Real-time driver location updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Trip receipts & star ratings</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/80 mt-6">
              <Link
                to="/passenger"
                onClick={() => switchDemoRole('passenger')}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Passenger Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Captain Portal Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-colors group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider">
                  /captain
                </span>
                <h3 className="text-lg font-bold text-white">Captain (Driver) Workspace</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Driver qualification onboarding, vehicle specs registration, online availability toggle, 20s countdown dispatch alerts, passenger OTP validation, step-by-step navigation, and earnings ledger.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Online/Offline availability toggle</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Incoming dispatch radar alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Daily & weekly earnings dashboard</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/80 mt-6">
              <Link
                to="/captain"
                onClick={() => switchDemoRole('captain')}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Captain Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-colors group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                  /admin
                </span>
                <h3 className="text-lg font-bold text-white">Admin Portal</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Centralized command console for reviewing pending driver applications, monitoring live trips, adjusting dynamic surge fare matrices, managing promotional codes, and auditing administrative actions.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Driver & document verification queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Global live ride monitoring & dispute tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tamper-evident audit trail</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/80 mt-6">
              <Link
                to="/admin"
                onClick={() => switchDemoRole('admin')}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Admin Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 px-4 text-center text-xs text-neutral-500">
        <p>RideFlow Mobility Architecture · Connected to Unified Appwrite Backend</p>
      </footer>
    </div>
  );
};

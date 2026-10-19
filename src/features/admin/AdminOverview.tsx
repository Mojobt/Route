/**
 * Admin Overview & Fleet Metrics Dashboard
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService } from '../../services/rideflowService';
import {
  Users,
  Car,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Shield,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const profiles = RideFlowService.getProfiles();
  const captains = RideFlowService.getCaptains();
  const rides = RideFlowService.getRides();
  const payments = RideFlowService.getPayments();

  const totalPassengers = profiles.filter((p) => p.role === 'passenger').length;
  const totalCaptains = captains.length;
  const approvedCaptains = captains.filter((c) => c.approvalStatus === 'approved').length;
  const pendingCaptains = captains.filter((c) => c.approvalStatus === 'pending').length;
  const onlineCaptains = captains.filter((c) => c.isOnline && c.approvalStatus === 'approved').length;

  const totalRides = rides.length;
  const activeRides = rides.filter((r) =>
    ['requested', 'searching', 'accepted', 'captain_arriving', 'in_progress'].includes(r.status)
  ).length;
  const completedRides = rides.filter((r) => r.status === 'completed').length;

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const platformRevenue = totalRevenue * 0.15; // 15% platform take

  return (
    <div className="space-y-6 text-xs">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold">Active Fleet</span>
            <Car className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{onlineCaptains}</span>
            <span className="text-neutral-500 text-[11px]">/ {approvedCaptains} approved</span>
          </div>
          <p className="text-[10px] text-neutral-500">
            {pendingCaptains > 0 ? (
              <span className="text-amber-400 font-semibold">{pendingCaptains} drivers pending review</span>
            ) : (
              'All applications reviewed'
            )}
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold">Active Trips Now</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{activeRides}</span>
            <span className="text-neutral-500 text-[11px]">in progress</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-mono">
            {completedRides} total journeys completed
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold">Platform Gross GMV</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">
            Net Commission: ${platformRevenue.toFixed(2)} (15%)
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold">Registered Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{totalPassengers}</span>
            <span className="text-neutral-500 text-[11px]">passengers</span>
          </div>
          <p className="text-[10px] text-neutral-500">{totalCaptains} total registered drivers</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Trips and Driver Verification Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Rides Table */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Live Rides Feed</h2>
            <span className="text-[11px] text-neutral-500 font-mono">Real-time sync</span>
          </div>

          {rides.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 space-y-1">
              <Clock className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No rides requested yet.</p>
              <p className="text-[10px]">Use the Passenger portal to book a ride.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] uppercase text-neutral-500">
                    <th className="pb-2 font-semibold">Ride ID</th>
                    <th className="pb-2 font-semibold">Passenger</th>
                    <th className="pb-2 font-semibold">Captain</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-right">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {rides.slice(0, 6).map((r) => (
                    <tr key={r.$id} className="hover:bg-neutral-950/40 transition-colors">
                      <td className="py-2.5 font-mono text-[11px] text-neutral-400">{r.$id.slice(0, 10)}</td>
                      <td className="py-2.5 font-medium text-white">{r.passengerName}</td>
                      <td className="py-2.5 text-neutral-300">{r.captainName || '— Unassigned —'}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded ${
                            r.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : r.status === 'cancelled'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-white tabular-nums">
                        ${(r.finalFare || r.estimatedFare).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Approvals Strip */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Driver Verification Queue</h2>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              {pendingCaptains} Pending
            </span>
          </div>

          {pendingCaptains === 0 ? (
            <div className="py-8 text-center text-neutral-500 space-y-2">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 opacity-80" />
              <p className="text-xs text-neutral-300 font-medium">All Captains Up to Date</p>
              <p className="text-[10px] text-neutral-500">
                New driver registrations will automatically appear here for verification.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {captains
                .filter((c) => c.approvalStatus === 'pending')
                .map((cap) => (
                  <div
                    key={cap.$id}
                    className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{cap.name}</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Exp: {cap.experienceYears}y
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Vehicle: {cap.vehicle ? `${cap.vehicle.make} ${cap.vehicle.model}` : 'Not registered'}
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      License: {cap.licenseNumber}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

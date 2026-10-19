/**
 * Admin Ride Monitoring & Dispute Management
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService } from '../../services/rideflowService';
import { Ride, RideStatus } from '../../types';
import { Activity, Search, AlertTriangle, Eye, X, Check } from 'lucide-react';

export const RideMonitoring: React.FC = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>(RideFlowService.getRides());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  const [forceCancelModal, setForceCancelModal] = useState<Ride | null>(null);
  const [cancelReason, setCancelReason] = useState('Administrative intervention / System dispatch dispute');

  const refreshRides = () => {
    setRides(RideFlowService.getRides());
  };

  const handleForceCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !forceCancelModal) return;
    try {
      RideFlowService.cancelRide(user, forceCancelModal.$id, cancelReason);
      refreshRides();
      setForceCancelModal(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = rides.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.$id.toLowerCase().includes(q) ||
        r.passengerName.toLowerCase().includes(q) ||
        (r.captainName && r.captainName.toLowerCase().includes(q)) ||
        r.pickupAddress.toLowerCase().includes(q) ||
        r.dropoffAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto">
          {['all', 'searching', 'accepted', 'in_progress', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by ID, passenger, captain, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs w-full sm:w-72 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[10px] uppercase text-neutral-500">
                <th className="px-4 py-3 font-semibold">Ride ID</th>
                <th className="px-4 py-3 font-semibold">Passenger</th>
                <th className="px-4 py-3 font-semibold">Captain</th>
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Fare</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.map((r) => (
                <tr key={r.$id} className="hover:bg-neutral-950/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-400">
                    {r.$id.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{r.passengerName}</p>
                    <p className="text-[10px] text-neutral-500">{r.passengerPhone || 'No phone'}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {r.captainName ? (
                      <div>
                        <p className="font-medium text-white">{r.captainName}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">{r.vehicleInfo}</p>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-medium italic">Dispatch searching...</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-white text-[11px] font-medium">{r.pickupAddress}</p>
                    <p className="truncate text-neutral-400 text-[10px]">{r.dropoffAddress}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        r.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : r.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white tabular-nums">
                    ${(r.finalFare || r.estimatedFare).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedRide(r)}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg"
                        title="View Full Trip Telemetry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {['requested', 'searching', 'accepted', 'captain_arriving', 'in_progress'].includes(
                        r.status
                      ) && (
                        <button
                          onClick={() => setForceCancelModal(r)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs"
                          title="Force Cancel Ride"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Force Cancel Modal */}
      {forceCancelModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleForceCancel}
            className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-rose-400 text-sm">Force Cancel Ride #{forceCancelModal.$id.slice(0, 8)}</h3>
              <button
                type="button"
                onClick={() => setForceCancelModal(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-neutral-400 text-xs">
              Administrative cancellation immediately terminates the active trip and logs the action.
            </p>
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Cancellation & Dispute Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForceCancelModal(null)}
                className="flex-1 py-2 bg-neutral-800 text-white rounded-lg"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trip Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Trip #{selectedRide.$id}</h3>
                <span className="text-[10px] text-neutral-400 uppercase font-mono">{selectedRide.rideType} Tier</span>
              </div>
              <button
                onClick={() => setSelectedRide(null)}
                className="text-neutral-400 hover:text-white p-1 rounded bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div>
                <span className="text-[10px] uppercase text-neutral-500">Passenger</span>
                <p className="font-semibold text-white">{selectedRide.passengerName}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-500">Captain</span>
                <p className="font-semibold text-white">{selectedRide.captainName || 'None assigned'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-500">Safety OTP PIN</span>
                <p className="font-mono text-amber-400 font-bold">{selectedRide.otpCode}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-500">Calculated Fare</span>
                <p className="font-mono text-white font-bold">${selectedRide.estimatedFare.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Pickup</span>
                  <p className="text-white text-xs">{selectedRide.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-300 mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Destination</span>
                  <p className="text-neutral-300 text-xs">{selectedRide.dropoffAddress}</p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2 flex justify-between font-mono">
              <span>Distance: {selectedRide.distanceKm} km</span>
              <span>Duration: ~{selectedRide.durationMins} mins</span>
              <span>Status: {selectedRide.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

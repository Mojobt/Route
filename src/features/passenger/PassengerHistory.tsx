/**
 * Passenger Trip History & Invoices
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService } from '../../services/rideflowService';
import { MapPin, Calendar, Clock, DollarSign, Download, Star, Shield, Car } from 'lucide-react';
import { Ride } from '../../types';

export const PassengerHistory: React.FC = () => {
  const { user } = useAuth();
  const allRides = RideFlowService.getRides();
  const myRides = allRides.filter((r) => r.passengerId === user?.userId);
  const [selectedReceipt, setSelectedReceipt] = useState<Ride | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Your Trips</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Review past journey history, download receipts, and view payment details
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-500 block">Total Completed</span>
          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {myRides.filter((r) => r.status === 'completed').length}
          </span>
        </div>
      </div>

      {myRides.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
          <Car className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No trips taken yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Your completed and past rides will appear here with transparent receipt breakdowns.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myRides.map((ride) => (
            <div
              key={ride.$id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      ride.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : ride.status === 'cancelled'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {ride.status}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {new Date(ride.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-xs text-neutral-500 uppercase font-mono">· {ride.rideType}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate max-w-md">{ride.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <span className="w-2 h-2 rounded-sm bg-neutral-400 shrink-0" />
                    <span className="truncate max-w-md">{ride.dropoffAddress}</span>
                  </div>
                </div>

                {ride.captainName && (
                  <p className="text-[11px] text-neutral-400">
                    Captain: <strong className="text-neutral-200">{ride.captainName}</strong> ({ride.vehicleInfo || 'Vehicle'})
                  </p>
                )}
              </div>

              <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                <div className="text-right">
                  <span className="text-base font-bold text-white font-mono tabular-nums block">
                    ${(ride.finalFare || ride.estimatedFare).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {ride.distanceKm} km · {ride.durationMins}m
                  </span>
                </div>

                <button
                  onClick={() => setSelectedReceipt(ride)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">RideFlow Receipt</h3>
                <p className="text-[11px] text-neutral-400 font-mono">Trip #{selectedReceipt.$id}</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex justify-between text-neutral-400">
                <span>Date & Time</span>
                <span className="text-neutral-200 font-mono">
                  {new Date(selectedReceipt.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Captain</span>
                <span className="text-neutral-200">{selectedReceipt.captainName || 'Assigned Driver'}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Distance Traveled</span>
                <span className="text-neutral-200 font-mono">{selectedReceipt.distanceKm} km</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Trip Duration</span>
                <span className="text-neutral-200 font-mono">{selectedReceipt.durationMins} minutes</span>
              </div>
            </div>

            <div className="border-t border-b border-neutral-800 py-3 space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Base Fare & Distance</span>
                <span className="font-mono tabular-nums">
                  ${((selectedReceipt.finalFare || selectedReceipt.estimatedFare) * 0.9).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Service Fee & Taxes</span>
                <span className="font-mono tabular-nums">
                  ${((selectedReceipt.finalFare || selectedReceipt.estimatedFare) * 0.1).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-neutral-800">
                <span>Total Charged</span>
                <span className="text-base font-mono tabular-nums">
                  ${(selectedReceipt.finalFare || selectedReceipt.estimatedFare).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 text-center">
              Paid via Appwrite Unified Ledger · Electronic Receipt
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

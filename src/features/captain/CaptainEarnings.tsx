/**
 * Captain Earnings Dashboard
 * Detailed breakdown of daily, weekly, and monthly earnings, platform fees, and trip receipts
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService } from '../../services/rideflowService';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

export const CaptainEarnings: React.FC = () => {
  const { captainProfile } = useAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [payoutRequested, setPayoutRequested] = useState(false);

  const earnings = RideFlowService.getCaptainEarnings(captainProfile?.userId);

  // Compute metrics
  const totalNet = earnings.reduce((sum, e) => sum + e.netEarnings, 0);
  const totalGross = earnings.reduce((sum, e) => sum + e.grossFare, 0);
  const totalCommission = earnings.reduce((sum, e) => sum + e.platformCommission, 0);

  const handleRequestPayout = () => {
    setPayoutRequested(true);
    setTimeout(() => setPayoutRequested(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Captain Earnings & Payouts</h1>
          <p className="text-neutral-400 mt-0.5">
            Real-time ledger of completed journeys, service fees, and weekly direct deposits
          </p>
        </div>

        <button
          onClick={handleRequestPayout}
          disabled={payoutRequested || (captainProfile?.walletBalance || 0) <= 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
        >
          <Wallet className="w-4 h-4" />
          <span>{payoutRequested ? 'Payout Initiated' : 'Request Instant Payout'}</span>
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 font-semibold">Available Balance</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums block">
            ${(captainProfile?.walletBalance || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-neutral-400">Ready for instant transfer</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 font-semibold">Total Net Earned</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums block">
            ${(totalNet + (captainProfile?.walletBalance || 0)).toFixed(2)}
          </span>
          <span className="text-[10px] text-neutral-400">After 15% platform cut</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 font-semibold">Platform Fee (15%)</span>
          <span className="text-2xl font-bold text-neutral-300 font-mono tabular-nums block">
            ${totalCommission.toFixed(2)}
          </span>
          <span className="text-[10px] text-neutral-500">Fixed commission</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 font-semibold">Total Completed</span>
          <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums block">
            {captainProfile?.totalRides || 0}
          </span>
          <span className="text-[10px] text-neutral-400">Lifetime trips</span>
        </div>
      </div>

      {/* Breakdown Filter */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Earnings History</h2>
          <div className="flex gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPeriod(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                  period === t ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {earnings.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 space-y-1">
            <TrendingUp className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs">No trip earnings recorded yet in this period.</p>
            <p className="text-[10px]">Complete rides to see transparent fare breakdowns and deposits.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.map((e) => (
              <div
                key={e.$id}
                className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between hover:border-neutral-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Trip #{e.rideId.slice(0, 10)}</span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                      {e.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(e.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-bold text-emerald-400 font-mono text-sm tabular-nums">
                    +${e.netEarnings.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    Gross: ${e.grossFare.toFixed(2)} · Fee: -${e.platformCommission.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

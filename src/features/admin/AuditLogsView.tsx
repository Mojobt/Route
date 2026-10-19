/**
 * Admin Tamper-Evident Audit Logs View
 */

import React, { useState } from 'react';
import { RideFlowService } from '../../services/rideflowService';
import { AuditLog } from '../../types';
import { ShieldCheck, Search, Clock, Key } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const logs = RideFlowService.getAuditLogs();
  const [search, setSearch] = useState('');

  const filtered = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.adminEmail.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.targetId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 text-xs max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Security & Compliance Audit Logs</span>
          </h1>
          <p className="text-neutral-400 mt-0.5">
            Immutable log of all administrative interventions, driver approvals, and rate adjustments
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs w-full sm:w-64 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[10px] uppercase text-neutral-500">
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Admin Account</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Target</th>
                <th className="px-4 py-3 font-semibold">Execution Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.map((l) => (
                <tr key={l.$id} className="hover:bg-neutral-950/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-neutral-400 whitespace-nowrap text-[11px]">
                    {new Date(l.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-200">{l.adminEmail}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-300">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 capitalize font-mono text-[11px]">
                    {l.targetType}: {l.targetId.slice(0, 12)}
                  </td>
                  <td className="px-4 py-3 text-neutral-300 max-w-sm">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

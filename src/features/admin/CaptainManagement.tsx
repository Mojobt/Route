/**
 * Admin Captain Management & Document Verification
 * Approve, reject, or suspend captains with tamper-evident audit logging
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService } from '../../services/rideflowService';
import { CaptainProfile, CaptainApprovalStatus } from '../../types';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertOctagon,
  FileText,
  Car,
  Search,
  Check,
  X,
} from 'lucide-react';

export const CaptainManagement: React.FC = () => {
  const { user } = useAuth();
  const [captains, setCaptains] = useState<CaptainProfile[]>(RideFlowService.getCaptains());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
  const [search, setSearch] = useState('');

  // Review modal
  const [selectedCaptain, setSelectedCaptain] = useState<CaptainProfile | null>(null);
  const [reviewAction, setReviewAction] = useState<CaptainApprovalStatus>('approved');
  const [reviewNotes, setReviewNotes] = useState('');

  const refreshList = () => {
    setCaptains(RideFlowService.getCaptains());
  };

  const handleOpenReview = (captain: CaptainProfile, action: CaptainApprovalStatus) => {
    setSelectedCaptain(captain);
    setReviewAction(action);
    setReviewNotes(
      action === 'approved'
        ? 'Verified commercial driver license and vehicle inspection certificates.'
        : action === 'rejected'
        ? 'Documents failed validation criteria.'
        : 'Temporary suspension pending inquiry.'
    );
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCaptain) return;
    try {
      RideFlowService.adminReviewCaptain(user, selectedCaptain.userId, reviewAction, reviewNotes);
      refreshList();
      setSelectedCaptain(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = captains.filter((c) => {
    if (filter !== 'all' && c.approvalStatus !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.licenseNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {(['all', 'pending', 'approved', 'suspended'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                filter === tab ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search captain by name, email, or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs w-full sm:w-64 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Captains Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[10px] uppercase text-neutral-500">
                <th className="px-4 py-3 font-semibold">Captain</th>
                <th className="px-4 py-3 font-semibold">License</th>
                <th className="px-4 py-3 font-semibold">Vehicle Specs</th>
                <th className="px-4 py-3 font-semibold">Documents</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.map((c) => (
                <tr key={c.$id} className="hover:bg-neutral-950/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-neutral-400 text-[11px] font-mono">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-300">
                    {c.licenseNumber}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {c.vehicle ? (
                      <div>
                        <span className="font-medium text-white">
                          {c.vehicle.year} {c.vehicle.make} {c.vehicle.model}
                        </span>
                        <span className="text-[10px] text-neutral-500 block font-mono">
                          {c.vehicle.plateNumber} · {c.vehicle.color}
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-500 italic">No vehicle</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                      <FileText className="w-3 h-3 text-blue-400" />
                      {c.documents?.length || 0} files
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        c.approvalStatus === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.approvalStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {c.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleOpenReview(c, 'approved')}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {c.approvalStatus === 'approved' && (
                        <button
                          onClick={() => handleOpenReview(c, 'suspended')}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {c.approvalStatus === 'pending' && (
                        <button
                          onClick={() => handleOpenReview(c, 'rejected')}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        >
                          Reject
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

      {/* Review Modal */}
      {selectedCaptain && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmReview}
            className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  {reviewAction === 'approved'
                    ? 'Approve Captain Account'
                    : reviewAction === 'suspended'
                    ? 'Suspend Captain'
                    : 'Reject Application'}
                </h3>
                <p className="text-[11px] text-neutral-400">{selectedCaptain.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaptain(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Administrative Audit Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Recorded into tamper-evident audit logs with your admin signature.
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCaptain(null)}
                className="flex-1 py-2 bg-neutral-800 text-white rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 py-2 text-white font-bold rounded-lg cursor-pointer transition-colors ${
                  reviewAction === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Confirm {reviewAction.toUpperCase()}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

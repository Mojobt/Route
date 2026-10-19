/**
 * Admin Promotions & Coupon Code Manager
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService } from '../../services/rideflowService';
import { Promotion } from '../../types';
import { Tag, Plus, Check, Trash2 } from 'lucide-react';

export const PromotionsManager: React.FC = () => {
  const { user } = useAuth();
  const [promos, setPromos] = useState<Promotion[]>(RideFlowService.getPromotions());
  const [showAdd, setShowAdd] = useState(false);

  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [maxDiscount, setMaxDiscount] = useState(10);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code) return;
    const newPromo: Promotion = {
      $id: 'promo_' + Math.random().toString(36).substring(2, 9),
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      maxDiscount: Number(maxDiscount),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      active: true,
      usageCount: 0,
    };
    RideFlowService.savePromotion(newPromo, user);
    setPromos(RideFlowService.getPromotions());
    setCode('');
    setShowAdd(false);
  };

  const toggleStatus = (promo: Promotion) => {
    if (!user) return;
    const updated = { ...promo, active: !promo.active };
    RideFlowService.savePromotion(updated, user);
    setPromos(RideFlowService.getPromotions());
  };

  return (
    <div className="space-y-6 text-xs max-w-4xl">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Promotions & Discount Codes</h1>
          <p className="text-neutral-400 mt-0.5">
            Create coupon codes to incentivize new passengers and track redemptions
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Promo Code</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Create Promotional Campaign</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. SUMMER30"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white uppercase font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Discount %</label>
              <input
                type="number"
                min={5}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Max Cap ($)</label>
              <input
                type="number"
                min={1}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
            >
              Save Campaign
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promos.map((p) => (
          <div
            key={p.$id}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-sm tracking-wider">{p.code}</span>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    p.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {p.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                {p.discountPercent}% off (up to ${p.maxDiscount.toFixed(2)})
              </p>
              <p className="text-neutral-500 text-[10px] font-mono">
                Used: {p.usageCount} times · Expires {new Date(p.expiryDate).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => toggleStatus(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                p.active
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {p.active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

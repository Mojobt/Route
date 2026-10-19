/**
 * Admin Fare Rules & Dynamic Pricing Configuration
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService, DEFAULT_FARE_RULES } from '../../services/rideflowService';
import { FareRule, RideType } from '../../types';
import { DollarSign, Zap, Check, Shield, RotateCcw } from 'lucide-react';

export const FareRulesConfig: React.FC = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<Record<RideType, FareRule>>(RideFlowService.getFareRules());
  const [savedSuccess, setSavedSuccess] = useState<RideType | null>(null);

  const handleUpdate = (type: RideType, field: keyof FareRule, val: number | string) => {
    setRules((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: typeof val === 'string' && field !== 'name' && field !== 'description' ? Number(val) : val,
      },
    }));
  };

  const handleSave = (type: RideType) => {
    if (!user) return;
    try {
      RideFlowService.updateFareRule(rules[type], user);
      setSavedSuccess(type);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 text-xs max-w-4xl">
      <div className="pb-3 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Fare Rules & Dynamic Pricing</h1>
        <p className="text-neutral-400 mt-0.5">
          Configure base fares, per-kilometer rates, minute charges, and surge multipliers for each vehicle tier
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(['economy', 'comfort', 'xl'] as RideType[]).map((type) => {
          const rule = rules[type] || DEFAULT_FARE_RULES[type];
          return (
            <div
              key={type}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h3 className="font-bold text-white text-sm capitalize">{rule.name}</h3>
                  <span className="text-[10px] font-mono uppercase bg-neutral-950 px-2 py-0.5 rounded text-neutral-400">
                    {rule.capacity} Seats
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-neutral-400 mb-1">Base Fare ($)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={rule.baseFare}
                      onChange={(e) => handleUpdate(type, 'baseFare', e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Rate per KM ($)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={rule.perKmRate}
                      onChange={(e) => handleUpdate(type, 'perKmRate', e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Rate per Minute ($)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={rule.perMinuteRate}
                      onChange={(e) => handleUpdate(type, 'perMinuteRate', e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Minimum Trip Fare ($)</label>
                    <input
                      type="number"
                      step="0.50"
                      value={rule.minimumFare}
                      onChange={(e) => handleUpdate(type, 'minimumFare', e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 flex items-center justify-between">
                      <span>Surge Multiplier</span>
                      <span className="text-amber-400 font-bold font-mono">x{rule.surgeMultiplier}</span>
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={rule.surgeMultiplier}
                      onChange={(e) => handleUpdate(type, 'surgeMultiplier', e.target.value)}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                {savedSuccess === type ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" /> Updated
                  </span>
                ) : <span />}

                <button
                  onClick={() => handleSave(type)}
                  className="px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                >
                  Save Tier Rule
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

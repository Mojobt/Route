/**
 * Passenger Main Booking Dashboard
 * Interactive pickup & dropoff selection, fare estimation, and live ride dispatch
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { InteractiveMap } from '../../components/common/InteractiveMap';
import { ActiveRideView } from './ActiveRideView';
import { RideFlowService, DEFAULT_FARE_RULES } from '../../services/rideflowService';
import { RideType } from '../../types';
import {
  MapPin,
  Navigation,
  Car,
  Clock,
  Tag,
  Shield,
  ArrowRight,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';

const PRESET_DESTINATIONS = [
  {
    name: 'SFO International Airport',
    address: 'San Francisco International Airport (SFO), Terminal 2',
    lat: 37.6213,
    lng: -122.3790,
    distanceKm: 19.4,
    durationMins: 22,
  },
  {
    name: 'Union Square & Market St',
    address: '333 Post St, Union Square, San Francisco, CA',
    lat: 37.7879,
    lng: -122.4075,
    distanceKm: 2.8,
    durationMins: 9,
  },
  {
    name: 'Fisherman’s Wharf & Pier 39',
    address: 'The Embarcadero, Pier 39, San Francisco, CA',
    lat: 37.8087,
    lng: -122.4098,
    distanceKm: 5.2,
    durationMins: 14,
  },
  {
    name: 'Golden Gate Park & De Young',
    address: '50 Hagiwara Tea Garden Dr, Golden Gate Park, CA',
    lat: 37.7715,
    lng: -122.4687,
    distanceKm: 6.8,
    durationMins: 16,
  },
];

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activePassengerRide, requestRide, captainCoords } = useRide();

  // Booking Form State
  const [pickupAddress, setPickupAddress] = useState('Current Location (Market & 4th St)');
  const [pickupCoords, setPickupCoords] = useState({ lat: 37.7858, lng: -122.4065 });

  const [dropoffAddress, setDropoffAddress] = useState('San Francisco International Airport (SFO)');
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 37.6213, lng: -122.3790 });

  const [distanceKm, setDistanceKm] = useState(19.4);
  const [durationMins, setDurationMins] = useState(22);

  const [selectedType, setSelectedType] = useState<RideType>('economy');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [selectingPoint, setSelectingPoint] = useState<'pickup' | 'dropoff' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available online captains for radar markers
  const nearbyCaptains = RideFlowService.getCaptains()
    .filter((c) => c.isOnline && c.approvalStatus === 'approved')
    .map((c) => ({ id: c.$id, lat: c.currentLat, lng: c.currentLng }));

  // Fare calculation for all three tiers
  const fareRules = RideFlowService.getFareRules();

  const handleSelectPreset = (preset: typeof PRESET_DESTINATIONS[0]) => {
    setDropoffAddress(preset.address);
    setDropoffCoords({ lat: preset.lat, lng: preset.lng });
    setDistanceKm(preset.distanceKm);
    setDurationMins(preset.durationMins);
  };

  const handleMapCoordinateSelect = (coords: { lat: number; lng: number }) => {
    if (selectingPoint === 'pickup') {
      setPickupCoords(coords);
      setPickupAddress(`Custom Point (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      setSelectingPoint(null);
    } else if (selectingPoint === 'dropoff') {
      setDropoffCoords(coords);
      setDropoffAddress(`Custom Destination (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      // Recalculate estimated distance based on euclidean delta
      const dLat = (coords.lat - pickupCoords.lat) * 111;
      const dLng = (coords.lng - pickupCoords.lng) * 88;
      const dist = Math.max(1.5, Math.round(Math.hypot(dLat, dLng) * 10) / 10);
      setDistanceKm(dist);
      setDurationMins(Math.max(4, Math.round(dist * 1.6)));
      setSelectingPoint(null);
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoCode.trim()) return;

    const promos = RideFlowService.getPromotions();
    const matched = promos.find((p) => p.code.toUpperCase() === promoCode.trim().toUpperCase() && p.active);
    if (matched) {
      setAppliedPromo(matched.code);
      setPromoError(null);
    } else {
      setPromoError('Invalid or expired coupon code. Try "RIDEFLOW20".');
    }
  };

  const handleBookRide = async () => {
    setIsSubmitting(true);
    try {
      await requestRide({
        pickup: { address: pickupAddress, ...pickupCoords },
        dropoff: { address: dropoffAddress, ...dropoffCoords },
        rideType: selectedType,
        distanceKm,
        durationMins,
        promoCode: appliedPromo || undefined,
      });
    } catch (err: any) {
      alert(err.message || 'Unable to book ride');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-neutral-950">
      {/* Left Control Panel: Search & Booking or Active Ride */}
      <div className="w-full lg:w-[460px] xl:w-[500px] h-full overflow-y-auto border-r border-neutral-800 p-4 sm:p-6 bg-neutral-950 flex flex-col justify-between shrink-0 z-20">
        {activePassengerRide ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h2 className="text-lg font-bold text-white tracking-tight">Active Journey</h2>
              <span className="text-[11px] font-mono uppercase bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                Live Appwrite Realtime
              </span>
            </div>
            <ActiveRideView onRideCompletedDismiss={() => window.location.reload()} />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Where are you heading?</h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                On-demand rides dispatched directly from verified nearby captains
              </p>
            </div>

            {/* Address Form */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-lg">
              {/* Pickup Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400 flex items-center justify-between">
                  <span>Pickup Location</span>
                  <button
                    onClick={() => setSelectingPoint('pickup')}
                    className="text-emerald-400 hover:underline cursor-pointer"
                  >
                    Select on Map
                  </button>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="Enter pickup point"
                  />
                </div>
              </div>

              {/* Destination Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400 flex items-center justify-between">
                  <span>Destination</span>
                  <button
                    onClick={() => setSelectingPoint('dropoff')}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Select on Map
                  </button>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 w-2.5 h-2.5 rounded-sm bg-neutral-200" />
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    placeholder="Enter destination"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1.5">
                  Popular San Francisco Destinations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_DESTINATIONS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleSelectPreset(p)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        dropoffAddress === p.address
                          ? 'bg-neutral-800 border-neutral-600 text-white font-medium'
                          : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vehicle Options / Fare Comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Choose Ride Tier</span>
                <span className="text-neutral-500 font-mono tabular-nums">
                  {distanceKm} km · ~{durationMins} mins
                </span>
              </div>

              <div className="space-y-2">
                {(['economy', 'comfort', 'xl'] as RideType[]).map((type) => {
                  const rule = fareRules[type] || DEFAULT_FARE_RULES[type];
                  const { estimatedFare } = RideFlowService.calculateFare(
                    type,
                    distanceKm,
                    durationMins,
                    appliedPromo ? 5 : 0
                  );
                  const isSelected = selectedType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 border-white shadow-lg ring-1 ring-white/10'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-white text-neutral-950' : 'bg-neutral-900 text-neutral-400'
                          }`}
                        >
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{rule.name}</span>
                            <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded font-mono">
                              {rule.capacity} seats
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-1">{rule.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white font-mono tabular-nums block">
                          ${estimatedFare.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {type === 'economy' ? '3 min away' : type === 'comfort' ? '4 min away' : '6 min away'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Promo Code (e.g. RIDEFLOW20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs focus:outline-none uppercase font-mono"
              />
              {appliedPromo ? (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Applied
                </span>
              ) : (
                <button
                  type="submit"
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              )}
            </form>
            {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}

            {/* Request Ride Button */}
            <button
              onClick={handleBookRide}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{isSubmitting ? 'Dispatching Captains...' : `Request ${DEFAULT_FARE_RULES[selectedType].name}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-4 mt-auto border-t border-neutral-900 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Safe rides · Verified Captains</span>
          <span className="font-mono">Appwrite Realtime Engine</span>
        </div>
      </div>

      {/* Right Map Canvas */}
      <div className="flex-1 h-full relative">
        <InteractiveMap
          pickup={pickupCoords}
          dropoff={dropoffCoords}
          captainCoords={captainCoords}
          nearbyCaptains={nearbyCaptains}
          isSelectingPoint={selectingPoint}
          onSelectCoordinates={handleMapCoordinateSelect}
          className="h-full w-full"
        />
      </div>
    </div>
  );
};

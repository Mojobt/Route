/**
 * Captain (Driver) Live Dispatch & Driving Dashboard
 * Availability toggle, incoming ride alerts, step-by-step trip execution, and live GPS broadcast
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRide } from '../../context/RideContext';
import { RideFlowService } from '../../services/rideflowService';
import { InteractiveMap } from '../../components/common/InteractiveMap';
import {
  Car,
  Power,
  Navigation,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Shield,
  KeyRound,
  X,
  Phone,
  MessageSquare,
  Play,
  FileCheck,
} from 'lucide-react';

export const CaptainDashboard: React.FC = () => {
  const { user, captainProfile, refreshCaptainProfile } = useAuth();
  const {
    activeCaptainRide,
    incomingOffer,
    acceptOffer,
    declineOffer,
    updateStatus,
    captainCoords,
    toggleMovementSimulation,
    isSimulatingMovement,
  } = useRide();

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [offerTimer, setOfferTimer] = useState(20);

  // Incoming offer countdown
  useEffect(() => {
    if (!incomingOffer) {
      setOfferTimer(20);
      return;
    }
    const timer = setInterval(() => {
      setOfferTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          declineOffer();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingOffer]);

  if (!captainProfile) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
        <Car className="w-12 h-12 text-neutral-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">Captain Profile Needed</h2>
        <p className="text-xs text-neutral-400">
          Complete driver onboarding to register your vehicle and documents.
        </p>
      </div>
    );
  }

  const isApproved = captainProfile.approvalStatus === 'approved';
  const isOnline = captainProfile.isOnline;

  const handleToggleOnline = () => {
    if (!isApproved) {
      alert('Your captain account is pending administrator review. You will be able to go online once approved.');
      return;
    }
    try {
      RideFlowService.updateCaptainStatus(captainProfile.userId, !isOnline);
      refreshCaptainProfile();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStartTripWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!activeCaptainRide) return;
    if (otpInput.trim() !== activeCaptainRide.otpCode) {
      setOtpError('Incorrect 4-digit Passenger PIN. Please verify with the passenger.');
      return;
    }
    const success = await updateStatus('in_progress', otpInput.trim());
    if (success) {
      setOtpInput('');
    }
  };

  const trip = activeCaptainRide;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-neutral-950">
      {/* Left Driving Console */}
      <div className="w-full lg:w-[440px] xl:w-[480px] h-full overflow-y-auto border-r border-neutral-800 p-4 sm:p-6 bg-neutral-950 flex flex-col justify-between shrink-0 z-20">
        <div className="space-y-4">
          {/* Header & Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Captain Console</h1>
              <p className="text-[11px] text-neutral-400">
                Vehicle: {captainProfile.vehicle ? `${captainProfile.vehicle.make} ${captainProfile.vehicle.model}` : 'Standard'}
              </p>
            </div>

            {/* Online Toggle Switch */}
            <button
              onClick={handleToggleOnline}
              disabled={!isApproved}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>
          </div>

          {/* Pending Approval Notice if not approved */}
          {!isApproved && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Account Approval Status: {captainProfile.approvalStatus.toUpperCase()}</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Your driver documentation is currently in the verification queue. An administrator
                will review your commercial license and vehicle registration.
              </p>
              <div className="pt-1">
                <span className="text-[10px] text-neutral-400">
                  Tip: Use the Admin Portal to review & approve your captain profile.
                </span>
              </div>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Today Earnings</span>
              <span className="text-sm font-bold text-white font-mono tabular-nums">
                ${captainProfile.walletBalance.toFixed(2)}
              </span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Rating</span>
              <span className="text-sm font-bold text-amber-400 font-mono tabular-nums">
                ★ {captainProfile.rating.toFixed(2)}
              </span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Completed</span>
              <span className="text-sm font-bold text-white font-mono tabular-nums">
                {captainProfile.totalRides} trips
              </span>
            </div>
          </div>

          {/* Active Assigned Trip Card */}
          {trip ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white uppercase text-[10px] tracking-wider text-blue-400">
                  Current Assigned Trip
                </span>
                <span className="font-bold text-white font-mono text-sm">
                  ${trip.estimatedFare.toFixed(2)}
                </span>
              </div>

              {/* Passenger Details */}
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{trip.passengerName}</p>
                  <p className="text-[11px] text-neutral-400">{trip.passengerPhone || '+1 (555) 234-5678'}</p>
                </div>
                <div className="flex gap-2">
                  {trip.passengerPhone && (
                    <a
                      href={`tel:${trip.passengerPhone}`}
                      className="p-2 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Pickup Address</span>
                    <p className="text-white font-medium">{trip.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Destination Address</span>
                    <p className="text-neutral-300 font-medium">{trip.dropoffAddress}</p>
                  </div>
                </div>
              </div>

              {/* Trip Progression Step Buttons */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                {trip.status === 'accepted' && (
                  <button
                    onClick={() => updateStatus('captain_arriving')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>I Have Arrived at Pickup</span>
                  </button>
                )}

                {trip.status === 'captain_arriving' && (
                  <form onSubmit={handleStartTripWithOtp} className="space-y-2">
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                        <KeyRound className="w-4 h-4" />
                        <span>Enter Passenger 4-Digit Safety PIN to Start</span>
                      </div>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-center font-mono text-base font-bold text-white tracking-widest focus:outline-none focus:border-amber-400"
                        required
                      />
                      {otpError && <p className="text-[11px] text-rose-400">{otpError}</p>}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
                    >
                      Verify PIN & Start Trip
                    </button>
                  </form>
                )}

                {trip.status === 'in_progress' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Trip & Collect Payment</span>
                  </button>
                )}

                {/* Simulate Driver Movement Along Route */}
                <button
                  onClick={() => toggleMovementSimulation()}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isSimulatingMovement
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isSimulatingMovement ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingMovement ? 'GPS Telemetry Broadcasting...' : 'Simulate Live Car GPS Movement'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 text-center space-y-2">
              <div
                className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                  isOnline ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">
                {isOnline ? 'Searching for nearby trips...' : 'You are currently Offline'}
              </h3>
              <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                {isOnline
                  ? 'Stay on this screen. New passenger requests will pop up on your dispatch radar with immediate alert.'
                  : 'Toggle online above to start receiving trip requests in your service area.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-auto border-t border-neutral-900 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>License: {captainProfile.licenseNumber}</span>
          <span className="font-mono">Realtime GPS Connected</span>
        </div>
      </div>

      {/* Right Map Canvas */}
      <div className="flex-1 h-full relative">
        <InteractiveMap
          pickup={trip ? { lat: trip.pickupLat, lng: trip.pickupLng, address: trip.pickupAddress } : null}
          dropoff={trip ? { lat: trip.dropoffLat, lng: trip.dropoffLng, address: trip.dropoffAddress } : null}
          captainCoords={captainCoords || { lat: captainProfile.currentLat, lng: captainProfile.currentLng }}
          className="h-full w-full"
        />
      </div>

      {/* INCOMING RIDE REQUEST DISPATCH MODAL */}
      {incomingOffer && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border-2 border-amber-400/80 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 text-xs animate-in fade-in zoom-in-95">
            {/* Header & Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Car className="w-5 h-5 animate-bounce" />
                <span>Incoming Ride Offer!</span>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-amber-400 flex items-center justify-center font-bold text-amber-400 text-sm font-mono">
                {offerTimer}s
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                <span className="text-neutral-400">Estimated Gross Fare</span>
                <span className="text-xl font-bold text-white font-mono tabular-nums">
                  ${incomingOffer.estimatedFare.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-400 pt-1">
                <span>Trip Distance & ETA</span>
                <span className="text-white font-mono tabular-nums font-semibold">
                  {incomingOffer.distanceKm} km · ~{incomingOffer.durationMins} mins
                </span>
              </div>
            </div>

            {/* Waypoints */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Pickup</span>
                  <p className="text-white font-medium">{incomingOffer.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-300 mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Dropoff</span>
                  <p className="text-neutral-300 font-medium">{incomingOffer.dropoffAddress}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={declineOffer}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={() => acceptOffer(incomingOffer.$id)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

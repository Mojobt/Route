/**
 * Passenger Active Ride View
 * Live ride status progression, assigned captain details, live chat, and safety PIN
 */

import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import {
  Car,
  Star,
  Phone,
  Shield,
  MessageSquare,
  AlertCircle,
  X,
  Send,
  Navigation,
  Clock,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { RideStatus } from '../../types';

interface ActiveRideViewProps {
  onRideCompletedDismiss: () => void;
}

export const ActiveRideView: React.FC<ActiveRideViewProps> = ({ onRideCompletedDismiss }) => {
  const { user } = useAuth();
  const {
    activePassengerRide,
    messages,
    captainCoords,
    cancelCurrentRide,
    sendChatMessage,
    submitTripRating,
    toggleMovementSimulation,
    isSimulatingMovement,
  } = useRide();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');

  // Rating modal state
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  if (!activePassengerRide) return null;

  const ride = activePassengerRide;

  const getStatusBadge = (status: RideStatus) => {
    switch (status) {
      case 'searching':
      case 'requested':
        return (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Connecting with nearby captains...</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Captain confirmed & en route</span>
          </div>
        );
      case 'captain_arriving':
        return (
          <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-medium">
            <Navigation className="w-3.5 h-3.5 animate-bounce" />
            <span>Captain has arrived at pickup</span>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium">
            <Car className="w-3.5 h-3.5" />
            <span>Trip in progress to destination</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Trip successfully completed</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Trip cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendChatMessage(chatText);
    setChatText('');
  };

  const handleCancelSubmit = async () => {
    await cancelCurrentRide(cancelReason);
    setCancelModalOpen(false);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTripRating(ratingStars, ratingFeedback);
    setRatingSubmitted(true);
    setTimeout(() => {
      onRideCompletedDismiss();
    }, 1500);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div>{getStatusBadge(ride.status)}</div>
        <div className="text-right">
          <span className="text-neutral-400 block text-[11px]">Estimated Fare</span>
          <span className="text-white font-bold text-base font-mono tabular-nums">
            ${ride.estimatedFare.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Safety PIN Verification Card */}
      {ride.status !== 'completed' && ride.status !== 'cancelled' && (
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-900 text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-400">Safety Verification PIN</p>
              <p className="text-xs text-neutral-200">Share with captain upon entering car</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-lg text-amber-400 font-mono font-bold text-base tracking-widest tabular-nums">
            {ride.otpCode}
          </div>
        </div>
      )}

      {/* Assigned Captain & Vehicle Information */}
      {ride.captainId ? (
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-sm">
                {ride.captainName?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{ride.captainName}</span>
                  <span className="flex items-center text-amber-400 text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current mr-0.5" />
                    {ride.captainRating || '4.9'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">
                  {ride.vehicleInfo || 'Toyota Camry Hybrid (Silver)'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen(true)}
                className="relative p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Trip Chat"
              >
                <MessageSquare className="w-4 h-4" />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {messages.length}
                  </span>
                )}
              </button>

              {ride.captainPhone && (
                <a
                  href={`tel:${ride.captainPhone}`}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  title="Call Captain"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Real-time Telemetry Demonstration Button */}
          {['accepted', 'captain_arriving', 'in_progress'].includes(ride.status) && (
            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">
                Captain GPS Coordinates:{' '}
                <span className="font-mono text-neutral-200">
                  {captainCoords ? `${captainCoords.lat.toFixed(4)}, ${captainCoords.lng.toFixed(4)}` : 'Syncing...'}
                </span>
              </span>
              <button
                onClick={() => toggleMovementSimulation()}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  isSimulatingMovement
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Play className={`w-3 h-3 ${isSimulatingMovement ? 'animate-spin' : ''}`} />
                <span>{isSimulatingMovement ? 'GPS Live Tracking Active' : 'Simulate Live Driver GPS'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center animate-spin">
            <Car className="w-4 h-4" />
          </div>
          <p className="font-semibold text-white">Broadcasting to Available Captains</p>
          <p className="text-[11px] text-neutral-400">
            Open the <strong className="text-amber-400">Captain Portal</strong> in a new tab or use the role switcher to accept this trip!
          </p>
        </div>
      )}

      {/* Trip Route Details */}
      <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2.5">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="w-0.5 h-6 bg-neutral-800 my-0.5"></span>
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-200"></span>
          </div>
          <div className="space-y-3 flex-1 overflow-hidden">
            <div>
              <p className="text-[10px] uppercase text-neutral-500 font-semibold">Pickup</p>
              <p className="text-white font-medium truncate">{ride.pickupAddress}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-neutral-500 font-semibold">Destination</p>
              <p className="text-white font-medium truncate">{ride.dropoffAddress}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-neutral-400 text-[11px]">
          <span className="flex items-center gap-1 font-mono tabular-nums">
            <Navigation className="w-3 h-3 text-neutral-500" /> {ride.distanceKm} km
          </span>
          <span className="flex items-center gap-1 font-mono tabular-nums">
            <Clock className="w-3 h-3 text-neutral-500" /> ~{ride.durationMins} mins
          </span>
          <span className="capitalize px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 font-medium text-[10px]">
            {ride.rideType}
          </span>
        </div>
      </div>

      {/* Trip Completed Rating State */}
      {ride.status === 'completed' && !ratingSubmitted && (
        <form onSubmit={handleRatingSubmit} className="bg-neutral-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
          <div className="text-center space-y-1">
            <h4 className="text-sm font-bold text-white">How was your ride with {ride.captainName}?</h4>
            <p className="text-[11px] text-neutral-400">Rate your experience to support quality captains.</p>
          </div>

          <div className="flex justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRatingStars(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'
                  }`}
                />
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Add an optional compliment or note..."
            value={ratingFeedback}
            onChange={(e) => setRatingFeedback(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRideCompletedDismiss}
              className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg font-medium transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/20"
            >
              Submit Rating
            </button>
          </div>
        </form>
      )}

      {ratingSubmitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center text-emerald-400 font-medium">
          Thank you! Your rating and receipt have been recorded.
        </div>
      )}

      {/* Cancel Ride Action */}
      {['requested', 'searching', 'accepted'].includes(ride.status) && (
        <div className="pt-1">
          <button
            onClick={() => setCancelModalOpen(true)}
            className="w-full py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors font-medium text-xs"
          >
            Cancel Ride Request
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-sm w-full rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Cancel Ride?</h4>
              <button onClick={() => setCancelModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-neutral-400 text-xs">
              Please choose a reason so we can improve our service:
            </p>
            <div className="space-y-2">
              {[
                'Change of plans',
                'Wait time too long',
                'Captain is too far away',
                'Booked by mistake',
              ].map((r) => (
                <button
                  key={r}
                  onClick={() => setCancelReason(r)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    cancelReason === r
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2 bg-neutral-800 text-white rounded-lg font-medium"
              >
                Keep Ride
              </button>
              <button
                onClick={handleCancelSubmit}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Live Trip Chat Drawer/Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white text-xs">
                  {ride.captainName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{ride.captainName || 'Trip Chat'}</h4>
                  <span className="text-[10px] text-neutral-400">Assigned Driver</span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 space-y-1">
                  <MessageSquare className="w-8 h-8 opacity-40" />
                  <p className="text-xs">No messages yet.</p>
                  <p className="text-[10px]">Send a note about pickup directions or arrival.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.userId;
                  return (
                    <div
                      key={m.$id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-neutral-800 text-neutral-100 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-neutral-500 mt-1 px-1">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-neutral-800 bg-neutral-950 flex gap-2">
              <input
                type="text"
                placeholder="Type a message to your captain..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

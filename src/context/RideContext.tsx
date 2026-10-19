/**
 * RideFlow Ride & Dispatch Context
 * Shared real-time state for ride requests, assignments, GPS tracking, and chat
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Ride, RideType, RideStatus, ChatMessage, CaptainProfile, RideLocation } from '../types';
import { RideFlowService } from '../services/rideflowService';
import { useAuth } from './AuthContext';

interface RideContextType {
  activePassengerRide: Ride | null;
  activeCaptainRide: Ride | null;
  incomingOffer: Ride | null;
  messages: ChatMessage[];
  captainCoords: { lat: number; lng: number } | null;
  isSimulatingMovement: boolean;
  requestRide: (params: {
    pickup: { address: string; lat: number; lng: number };
    dropoff: { address: string; lat: number; lng: number };
    rideType: RideType;
    distanceKm: number;
    durationMins: number;
    promoCode?: string;
  }) => Promise<Ride>;
  acceptOffer: (rideId: string) => Promise<boolean>;
  declineOffer: () => void;
  updateStatus: (nextStatus: RideStatus, otpCode?: string) => Promise<boolean>;
  cancelCurrentRide: (reason: string) => Promise<boolean>;
  sendChatMessage: (text: string) => void;
  submitTripRating: (stars: number, feedback?: string) => Promise<void>;
  toggleMovementSimulation: (enable?: boolean) => void;
  clearIncomingOffer: () => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, captainProfile, role } = useAuth();
  const [activePassengerRide, setActivePassengerRide] = useState<Ride | null>(null);
  const [activeCaptainRide, setActiveCaptainRide] = useState<Ride | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [captainCoords, setCaptainCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(false);

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active ride state on user change
  useEffect(() => {
    if (!user) {
      setActivePassengerRide(null);
      setActiveCaptainRide(null);
      setMessages([]);
      return;
    }

    if (user.role === 'passenger') {
      const active = RideFlowService.getActiveRideForPassenger(user.userId);
      setActivePassengerRide(active);
      if (active) {
        setMessages(RideFlowService.getMessages(active.$id));
      }
    } else if (user.role === 'captain') {
      const active = RideFlowService.getActiveRideForCaptain(user.userId);
      setActiveCaptainRide(active);
      if (active) {
        setMessages(RideFlowService.getMessages(active.$id));
      }

      // Check if there are unassigned searching rides to offer
      if (captainProfile?.isOnline && captainProfile?.approvalStatus === 'approved' && !active) {
        checkForIncomingRides();
      }
    }
  }, [user?.userId, user?.role, captainProfile?.isOnline, captainProfile?.approvalStatus]);

  const checkForIncomingRides = () => {
    if (role !== 'captain' || !captainProfile?.isOnline || captainProfile?.approvalStatus !== 'approved') {
      return;
    }
    const rides = RideFlowService.getRides();
    const available = rides.find((r) => ['requested', 'searching'].includes(r.status) && !r.captainId);
    if (available && (!incomingOffer || incomingOffer.$id !== available.$id)) {
      setIncomingOffer(available);
    }
  };

  // Real-time Event Subscription
  useEffect(() => {
    const unsubscribe = RideFlowService.subscribeToEvents((event) => {
      const { type, payload } = event;

      if (type === 'RIDE_REQUESTED') {
        const ride = payload as Ride;
        // If logged in as passenger who created it
        if (user && user.userId === ride.passengerId) {
          setActivePassengerRide(ride);
        }
        // If logged in as captain who is online and available
        if (
          user &&
          user.role === 'captain' &&
          captainProfile?.isOnline &&
          captainProfile?.approvalStatus === 'approved' &&
          !activeCaptainRide
        ) {
          setIncomingOffer(ride);
        }
      } else if (type === 'RIDE_ACCEPTED') {
        const ride = payload as Ride;
        if (user && user.userId === ride.passengerId) {
          setActivePassengerRide(ride);
        }
        if (user && user.userId === ride.captainId) {
          setActiveCaptainRide(ride);
          setIncomingOffer(null);
          // Set initial captain coordinate
          setCaptainCoords({ lat: ride.pickupLat + 0.006, lng: ride.pickupLng + 0.005 });
        } else if (incomingOffer?.$id === ride.$id) {
          // Ride was taken by another captain
          setIncomingOffer(null);
        }
      } else if (type === 'RIDE_STATUS_UPDATED') {
        const ride = payload as Ride;
        if (user && user.userId === ride.passengerId) {
          setActivePassengerRide(ride);
        }
        if (user && user.userId === ride.captainId) {
          setActiveCaptainRide(ride);
        }
        if (ride.status === 'completed' || ride.status === 'cancelled') {
          if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
            setIsSimulatingMovement(false);
          }
        }
      } else if (type === 'RIDE_CANCELLED') {
        const ride = payload as Ride;
        if (user && user.userId === ride.passengerId) {
          setActivePassengerRide(ride);
        }
        if (user && user.userId === ride.captainId) {
          setActiveCaptainRide(null);
        }
        if (incomingOffer?.$id === ride.$id) {
          setIncomingOffer(null);
        }
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          setIsSimulatingMovement(false);
        }
      } else if (type === 'NEW_CHAT_MESSAGE') {
        const msg = payload as ChatMessage;
        const currentRideId = activePassengerRide?.$id || activeCaptainRide?.$id;
        if (currentRideId && msg.rideId === currentRideId) {
          setMessages((prev) => {
            if (prev.some((m) => m.$id === msg.$id)) return prev;
            return [...prev, msg];
          });
        }
      } else if (type === 'RIDE_LOCATION_PING') {
        const loc = payload as RideLocation;
        const currentRideId = activePassengerRide?.$id || activeCaptainRide?.$id;
        if (currentRideId && loc.rideId === currentRideId) {
          setCaptainCoords({ lat: loc.lat, lng: loc.lng });
        }
      }
    });

    return () => {
      unsubscribe();
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [user?.userId, user?.role, captainProfile?.isOnline, captainProfile?.approvalStatus, incomingOffer, activeCaptainRide, activePassengerRide]);

  // Request a ride
  const requestRide = async (params: {
    pickup: { address: string; lat: number; lng: number };
    dropoff: { address: string; lat: number; lng: number };
    rideType: RideType;
    distanceKm: number;
    durationMins: number;
    promoCode?: string;
  }): Promise<Ride> => {
    if (!user) throw new Error('Must be logged in to request a ride');
    const ride = RideFlowService.requestRide({
      passenger: user,
      ...params,
    });
    setActivePassengerRide(ride);
    return ride;
  };

  // Captain accepts offer
  const acceptOffer = async (rideId: string): Promise<boolean> => {
    if (!captainProfile) return false;
    try {
      const ride = RideFlowService.acceptRide(captainProfile, rideId);
      setActiveCaptainRide(ride);
      setIncomingOffer(null);
      setCaptainCoords({ lat: ride.pickupLat + 0.005, lng: ride.pickupLng + 0.004 });
      return true;
    } catch (err: any) {
      alert(err.message || 'Unable to accept ride');
      setIncomingOffer(null);
      return false;
    }
  };

  const declineOffer = () => {
    setIncomingOffer(null);
  };

  // Status update
  const updateStatus = async (nextStatus: RideStatus, otpCode?: string): Promise<boolean> => {
    if (!user || !activeCaptainRide) return false;
    try {
      const updated = RideFlowService.updateRideStatus(user.userId, activeCaptainRide.$id, nextStatus, otpCode);
      setActiveCaptainRide(updated);
      return true;
    } catch (err: any) {
      alert(err.message || 'Status update error');
      return false;
    }
  };

  // Cancel
  const cancelCurrentRide = async (reason: string): Promise<boolean> => {
    if (!user) return false;
    const ride = activePassengerRide || activeCaptainRide;
    if (!ride) return false;
    try {
      const cancelled = RideFlowService.cancelRide(user, ride.$id, reason);
      if (user.role === 'passenger') setActivePassengerRide(cancelled);
      if (user.role === 'captain') setActiveCaptainRide(null);
      return true;
    } catch (err: any) {
      alert(err.message || 'Cancellation error');
      return false;
    }
  };

  // Chat
  const sendChatMessage = (text: string) => {
    if (!user) return;
    const currentRide = activePassengerRide || activeCaptainRide;
    if (!currentRide) return;
    RideFlowService.sendMessage(user, currentRide.$id, text);
  };

  // Submit Rating
  const submitTripRating = async (stars: number, feedback?: string) => {
    if (!user || !activePassengerRide) return;
    if (!activePassengerRide.captainId) return;
    RideFlowService.submitRating({
      rideId: activePassengerRide.$id,
      fromUser: user,
      toUserId: activePassengerRide.captainId,
      role: 'passenger',
      stars,
      feedback,
    });
  };

  // GPS Movement Simulation
  const toggleMovementSimulation = (enable?: boolean) => {
    const ride = activeCaptainRide || activePassengerRide;
    if (!ride) return;

    const shouldEnable = enable !== undefined ? enable : !isSimulatingMovement;

    if (!shouldEnable) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulatingMovement(false);
      return;
    }

    setIsSimulatingMovement(true);

    // Target coordinates: if accepted/captain_arriving -> moving towards pickup; if in_progress -> moving towards dropoff
    const target =
      ride.status === 'in_progress'
        ? { lat: ride.dropoffLat, lng: ride.dropoffLng }
        : { lat: ride.pickupLat, lng: ride.pickupLng };

    let current = captainCoords || {
      lat: ride.pickupLat + (Math.random() - 0.5) * 0.015,
      lng: ride.pickupLng + (Math.random() - 0.5) * 0.015,
    };

    simulationIntervalRef.current = setInterval(() => {
      // Step 8% closer to target each tick
      const stepFactor = 0.08;
      const nextLat = current.lat + (target.lat - current.lat) * stepFactor;
      const nextLng = current.lng + (target.lng - current.lng) * stepFactor;

      current = { lat: nextLat, lng: nextLng };
      setCaptainCoords(current);

      RideFlowService.updateRideLocation({
        rideId: ride.$id,
        captainId: ride.captainId || 'usr-captain-1',
        lat: nextLat,
        lng: nextLng,
        timestamp: new Date().toISOString(),
      });

      // If within 10 meters, stop
      const diff = Math.hypot(target.lat - nextLat, target.lng - nextLng);
      if (diff < 0.0002) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        setIsSimulatingMovement(false);
      }
    }, 1200);
  };

  return (
    <RideContext.Provider
      value={{
        activePassengerRide,
        activeCaptainRide,
        incomingOffer,
        messages,
        captainCoords,
        isSimulatingMovement,
        requestRide,
        acceptOffer,
        declineOffer,
        updateStatus,
        cancelCurrentRide,
        sendChatMessage,
        submitTripRating,
        toggleMovementSimulation,
        clearIncomingOffer: () => setIncomingOffer(null),
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

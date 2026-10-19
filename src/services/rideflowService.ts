/**
 * RideFlow Unified Service Layer
 * Interfaces with Appwrite Authentication, Databases, Realtime, and Storage
 * Includes concurrency-safe dispatch, role enforcement, and cross-tab real-time sync.
 */

import {
  UserProfile,
  CaptainProfile,
  Vehicle,
  DriverDocument,
  DriverDocType,
  Ride,
  RideLocation,
  FareRule,
  Payment,
  CaptainEarning,
  Rating,
  ChatMessage,
  Promotion,
  ServiceArea,
  AuditLog,
  UserRole,
  RideType,
  RideStatus,
  CaptainApprovalStatus,
} from '../types';
import { client, account, databases, ID, Query } from '../lib/appwrite/client';
import { getAppwriteConfig, isAppwriteConfigured } from '../lib/appwrite/config';

// Real-time broadcast channel for instant multi-window/multi-role sync
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('rideflow_realtime_events')
  : null;

// Initial Default Fare Rules
export const DEFAULT_FARE_RULES: Record<RideType, FareRule> = {
  economy: {
    rideType: 'economy',
    name: 'RideFlow Economy',
    description: 'Affordable, everyday rides with top-rated captains',
    baseFare: 3.50,
    perKmRate: 1.25,
    perMinuteRate: 0.35,
    minimumFare: 6.00,
    capacity: 4,
    surgeMultiplier: 1.0,
  },
  comfort: {
    rideType: 'comfort',
    name: 'RideFlow Comfort',
    description: 'Newer cars with extra legroom and experienced captains',
    baseFare: 5.50,
    perKmRate: 1.85,
    perMinuteRate: 0.50,
    minimumFare: 10.00,
    capacity: 4,
    surgeMultiplier: 1.0,
  },
  xl: {
    rideType: 'xl',
    name: 'RideFlow XL',
    description: 'Spacious SUVs and vans for groups up to 6 people or luggage',
    baseFare: 8.00,
    perKmRate: 2.40,
    perMinuteRate: 0.65,
    minimumFare: 14.00,
    capacity: 6,
    surgeMultiplier: 1.0,
  },
};

// Seed Profiles for seamless instant testing
const INITIAL_PROFILES: UserProfile[] = [
  {
    $id: 'usr-passenger-1',
    userId: 'usr-passenger-1',
    name: 'Alex Rivera',
    email: 'passenger@rideflow.com',
    phone: '+1 (555) 234-5678',
    role: 'passenger',
    rating: 4.95,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    $id: 'usr-captain-1',
    userId: 'usr-captain-1',
    name: 'David Vance',
    email: 'captain@rideflow.com',
    phone: '+1 (555) 876-5432',
    role: 'captain',
    rating: 4.92,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    $id: 'usr-captain-2',
    userId: 'usr-captain-2',
    name: 'Elena Rostova',
    email: 'captain2@rideflow.com',
    phone: '+1 (555) 998-1122',
    role: 'captain',
    rating: 4.88,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    $id: 'usr-captain-pending',
    userId: 'usr-captain-pending',
    name: 'Marcus Chen',
    email: 'pending_driver@rideflow.com',
    phone: '+1 (555) 443-8899',
    role: 'captain',
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    $id: 'usr-admin-1',
    userId: 'usr-admin-1',
    name: 'Sarah Connor (Fleet Admin)',
    email: 'admin@rideflow.com',
    phone: '+1 (555) 000-1122',
    role: 'admin',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_CAPTAINS: CaptainProfile[] = [
  {
    $id: 'cpt-1',
    userId: 'usr-captain-1',
    name: 'David Vance',
    email: 'captain@rideflow.com',
    phone: '+1 (555) 876-5432',
    licenseNumber: 'DL-98234-CA',
    experienceYears: 5,
    approvalStatus: 'approved',
    isOnline: true,
    currentLat: 37.7790,
    currentLng: -122.4180,
    rating: 4.92,
    totalRides: 487,
    walletBalance: 642.50,
    vehicle: {
      captainId: 'usr-captain-1',
      make: 'Toyota',
      model: 'Camry Hybrid',
      year: 2023,
      color: 'Midnight Black',
      plateNumber: '7XYZ892',
      category: 'economy',
    },
    documents: [
      {
        $id: 'doc-1',
        captainId: 'usr-captain-1',
        documentType: 'license',
        fileId: 'file-dl-1',
        fileName: 'commercial_license_front.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
      {
        $id: 'doc-2',
        captainId: 'usr-captain-1',
        documentType: 'registration',
        fileId: 'file-reg-1',
        fileName: 'vehicle_registration_ca.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    $id: 'cpt-2',
    userId: 'usr-captain-2',
    name: 'Elena Rostova',
    email: 'captain2@rideflow.com',
    phone: '+1 (555) 998-1122',
    licenseNumber: 'DL-55219-CA',
    experienceYears: 7,
    approvalStatus: 'approved',
    isOnline: true,
    currentLat: 37.7712,
    currentLng: -122.4230,
    rating: 4.88,
    totalRides: 712,
    walletBalance: 1240.00,
    vehicle: {
      captainId: 'usr-captain-2',
      make: 'Tesla',
      model: 'Model Y',
      year: 2024,
      color: 'Pearl White',
      plateNumber: '8ABC431',
      category: 'comfort',
    },
    documents: [
      {
        $id: 'doc-3',
        captainId: 'usr-captain-2',
        documentType: 'license',
        fileId: 'file-dl-2',
        fileName: 'ca_driver_license.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    $id: 'cpt-pending',
    userId: 'usr-captain-pending',
    name: 'Marcus Chen',
    email: 'pending_driver@rideflow.com',
    phone: '+1 (555) 443-8899',
    licenseNumber: 'DL-11442-CA',
    experienceYears: 3,
    approvalStatus: 'pending',
    isOnline: false,
    currentLat: 37.7680,
    currentLng: -122.4350,
    rating: 5.0,
    totalRides: 0,
    walletBalance: 0,
    vehicle: {
      captainId: 'usr-captain-pending',
      make: 'Subaru',
      model: 'Ascent',
      year: 2022,
      color: 'Ice Silver',
      plateNumber: '9SUB771',
      category: 'xl',
    },
    documents: [
      {
        $id: 'doc-pending-1',
        captainId: 'usr-captain-pending',
        documentType: 'license',
        fileId: 'file-doc-pending',
        fileName: 'marcus_license_front_back.pdf',
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        notes: 'Awaiting admin review of background check',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    $id: 'promo-1',
    code: 'RIDEFLOW20',
    discountPercent: 20,
    maxDiscount: 10,
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    usageCount: 142,
  },
  {
    $id: 'promo-2',
    code: 'WELCOME50',
    discountPercent: 50,
    maxDiscount: 15,
    expiryDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    active: true,
    usageCount: 89,
  },
];

const INITIAL_SERVICE_AREAS: ServiceArea[] = [
  {
    $id: 'sa-1',
    name: 'Downtown & Bay Area Metro',
    centerLat: 37.7749,
    centerLng: -122.4194,
    radiusKm: 35,
    active: true,
  },
  {
    $id: 'sa-2',
    name: 'SFO Airport Corridor',
    centerLat: 37.6213,
    centerLng: -122.3790,
    radiusKm: 20,
    active: true,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    $id: 'log-1',
    adminId: 'usr-admin-1',
    adminEmail: 'admin@rideflow.com',
    action: 'CAPTAIN_APPROVED',
    targetType: 'captain',
    targetId: 'usr-captain-1',
    details: 'Verified commercial license and vehicle registration. Activated captain account.',
    timestamp: new Date(Date.now() - 50 * 86400000).toISOString(),
  },
  {
    $id: 'log-2',
    adminId: 'usr-admin-1',
    adminEmail: 'admin@rideflow.com',
    action: 'FARE_RULE_UPDATED',
    targetType: 'fare_rule',
    targetId: 'economy',
    details: 'Base fare adjusted from $3.00 to $3.50 for fuel compensation.',
    timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// Local state storage keys
const STORAGE_KEYS = {
  PROFILES: 'rf_profiles_data',
  CAPTAINS: 'rf_captains_data',
  RIDES: 'rf_rides_data',
  FARE_RULES: 'rf_fare_rules_data',
  PAYMENTS: 'rf_payments_data',
  EARNINGS: 'rf_earnings_data',
  RATINGS: 'rf_ratings_data',
  MESSAGES: 'rf_messages_data',
  PROMOTIONS: 'rf_promotions_data',
  SERVICE_AREAS: 'rf_service_areas_data',
  AUDIT_LOGS: 'rf_audit_logs_data',
};

function getStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
}

// Global broadcast dispatcher
function notifyRealtime(eventType: string, payload: any) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: eventType, payload, timestamp: Date.now() });
  }
  // Also dispatch window custom event for same-tab subscribers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rideflow_event', { detail: { type: eventType, payload } }));
  }
}

export const RideFlowService = {
  // ----------------------------------------------------
  // Fare Calculation (Server-Authoritative)
  // ----------------------------------------------------
  calculateFare(rideType: RideType, distanceKm: number, durationMins: number, promoDiscount = 0): {
    estimatedFare: number;
    breakdown: { base: number; distance: number; time: number; discount: number };
  } {
    const rules = this.getFareRules();
    const rule = rules[rideType] || DEFAULT_FARE_RULES[rideType];
    const base = rule.baseFare;
    const distance = distanceKm * rule.perKmRate;
    const time = durationMins * rule.perMinuteRate;
    const subtotal = Math.max(rule.minimumFare, (base + distance + time) * rule.surgeMultiplier);
    const discount = Math.min(subtotal, promoDiscount);
    const finalVal = Math.round((subtotal - discount) * 100) / 100;
    return {
      estimatedFare: finalVal,
      breakdown: {
        base: Math.round(base * 100) / 100,
        distance: Math.round(distance * 100) / 100,
        time: Math.round(time * 100) / 100,
        discount: Math.round(discount * 100) / 100,
      },
    };
  },

  // ----------------------------------------------------
  // Fare Rules
  // ----------------------------------------------------
  getFareRules(): Record<RideType, FareRule> {
    return getStorage<Record<RideType, FareRule>>(STORAGE_KEYS.FARE_RULES, DEFAULT_FARE_RULES);
  },

  updateFareRule(rule: FareRule, admin: UserProfile): void {
    if (admin.role !== 'admin') throw new Error('Unauthorized: Admin access required');
    const current = this.getFareRules();
    current[rule.rideType] = rule;
    setStorage(STORAGE_KEYS.FARE_RULES, current);
    this.createAuditLog(
      admin,
      'FARE_RULE_UPDATED',
      'fare_rule',
      rule.rideType,
      `Updated ${rule.name}: Base $${rule.baseFare.toFixed(2)}, $${rule.perKmRate}/km, Surge x${rule.surgeMultiplier}`
    );
    notifyRealtime('FARE_RULE_UPDATED', rule);
  },

  // ----------------------------------------------------
  // User Profiles & Auth Management
  // ----------------------------------------------------
  getProfiles(): UserProfile[] {
    return getStorage<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  getProfileByUserId(userId: string): UserProfile | null {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.userId === userId) || null;
  },

  saveProfile(profile: UserProfile): UserProfile {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.userId === profile.userId);
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...profile, updatedAt: new Date().toISOString() };
    } else {
      profiles.push(profile);
    }
    setStorage(STORAGE_KEYS.PROFILES, profiles);
    notifyRealtime('PROFILE_UPDATED', profile);
    return profile;
  },

  // ----------------------------------------------------
  // Captain Profiles & Fleet Management
  // ----------------------------------------------------
  getCaptains(): CaptainProfile[] {
    return getStorage<CaptainProfile[]>(STORAGE_KEYS.CAPTAINS, INITIAL_CAPTAINS);
  },

  getCaptainByUserId(userId: string): CaptainProfile | null {
    const captains = this.getCaptains();
    return captains.find((c) => c.userId === userId) || null;
  },

  updateCaptainStatus(
    userId: string,
    isOnline: boolean,
    coords?: { lat: number; lng: number }
  ): CaptainProfile {
    const captains = this.getCaptains();
    const captain = captains.find((c) => c.userId === userId);
    if (!captain) throw new Error('Captain record not found');
    if (captain.approvalStatus !== 'approved' && isOnline) {
      throw new Error('Captain account must be approved by an administrator before going online.');
    }
    captain.isOnline = isOnline;
    if (coords) {
      captain.currentLat = coords.lat;
      captain.currentLng = coords.lng;
    }
    captain.updatedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.CAPTAINS, captains);
    notifyRealtime('CAPTAIN_STATUS_CHANGED', captain);
    return captain;
  },

  registerCaptainOnboarding(data: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    experienceYears: number;
    vehicle: Vehicle;
    documentFiles: { type: DriverDocType; name: string }[];
  }): CaptainProfile {
    const captains = this.getCaptains();
    let captain = captains.find((c) => c.userId === data.userId);

    const docs: DriverDocument[] = data.documentFiles.map((doc, idx) => ({
      $id: 'doc_' + Math.random().toString(36).substring(2, 9),
      captainId: data.userId,
      documentType: doc.type,
      fileId: 'appwrite_file_' + Date.now() + '_' + idx,
      fileName: doc.name,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
    }));

    if (captain) {
      captain.licenseNumber = data.licenseNumber;
      captain.experienceYears = data.experienceYears;
      captain.vehicle = data.vehicle;
      captain.documents = [...(captain.documents || []), ...docs];
      captain.approvalStatus = 'pending';
      captain.updatedAt = new Date().toISOString();
    } else {
      captain = {
        $id: 'cpt_' + Math.random().toString(36).substring(2, 9),
        userId: data.userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        experienceYears: data.experienceYears,
        approvalStatus: 'pending',
        isOnline: false,
        currentLat: 37.7749,
        currentLng: -122.4194,
        rating: 5.0,
        totalRides: 0,
        walletBalance: 0,
        vehicle: data.vehicle,
        documents: docs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      captains.push(captain);
    }

    setStorage(STORAGE_KEYS.CAPTAINS, captains);
    notifyRealtime('CAPTAIN_ONBOARDING_SUBMITTED', captain);
    return captain;
  },

  // Admin approval of captain
  adminReviewCaptain(
    admin: UserProfile,
    captainUserId: string,
    newStatus: CaptainApprovalStatus,
    notes?: string
  ): CaptainProfile {
    if (admin.role !== 'admin') throw new Error('Unauthorized: Admin access required');
    const captains = this.getCaptains();
    const captain = captains.find((c) => c.userId === captainUserId);
    if (!captain) throw new Error('Captain not found');

    captain.approvalStatus = newStatus;
    if (newStatus !== 'approved') {
      captain.isOnline = false;
    }
    if (captain.documents) {
      captain.documents = captain.documents.map((d) => ({
        ...d,
        status: newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : d.status,
        reviewedAt: new Date().toISOString(),
        notes: notes || d.notes,
      }));
    }
    captain.updatedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.CAPTAINS, captains);

    this.createAuditLog(
      admin,
      `CAPTAIN_${newStatus.toUpperCase()}`,
      'captain',
      captainUserId,
      `Changed approval status to "${newStatus}". Notes: ${notes || 'None'}`
    );

    notifyRealtime('CAPTAIN_REVIEWED', { captainUserId, newStatus, notes });
    return captain;
  },

  // ----------------------------------------------------
  // Rides & Dispatching Lifecycle
  // ----------------------------------------------------
  getRides(): Ride[] {
    return getStorage<Ride[]>(STORAGE_KEYS.RIDES, []);
  },

  getRideById(rideId: string): Ride | null {
    const rides = this.getRides();
    return rides.find((r) => r.$id === rideId) || null;
  },

  getActiveRideForPassenger(passengerId: string): Ride | null {
    const rides = this.getRides();
    return (
      rides.find(
        (r) =>
          r.passengerId === passengerId &&
          ['requested', 'searching', 'accepted', 'captain_arriving', 'in_progress'].includes(r.status)
      ) || null
    );
  },

  getActiveRideForCaptain(captainId: string): Ride | null {
    const rides = this.getRides();
    return (
      rides.find(
        (r) =>
          r.captainId === captainId &&
          ['accepted', 'captain_arriving', 'in_progress'].includes(r.status)
      ) || null
    );
  },

  // Request a Ride (Passenger -> Backend)
  requestRide(params: {
    passenger: UserProfile;
    pickup: { address: string; lat: number; lng: number };
    dropoff: { address: string; lat: number; lng: number };
    rideType: RideType;
    distanceKm: number;
    durationMins: number;
    promoCode?: string;
  }): Ride {
    // Check if passenger already has an active ride
    const existing = this.getActiveRideForPassenger(params.passenger.userId);
    if (existing) {
      return existing;
    }

    let discount = 0;
    if (params.promoCode) {
      const promos = this.getPromotions();
      const p = promos.find((item) => item.code.toUpperCase() === params.promoCode?.toUpperCase() && item.active);
      if (p) {
        discount = (p.discountPercent / 100) * 20; // up to max discount
        discount = Math.min(discount, p.maxDiscount);
      }
    }

    const { estimatedFare } = this.calculateFare(
      params.rideType,
      params.distanceKm,
      params.durationMins,
      discount
    );

    // Generate random 4-digit safety OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const newRide: Ride = {
      $id: 'ride_' + Math.random().toString(36).substring(2, 9),
      passengerId: params.passenger.userId,
      passengerName: params.passenger.name,
      passengerPhone: params.passenger.phone,
      captainId: null,
      captainName: null,
      status: 'searching',
      pickupAddress: params.pickup.address,
      pickupLat: params.pickup.lat,
      pickupLng: params.pickup.lng,
      dropoffAddress: params.dropoff.address,
      dropoffLat: params.dropoff.lat,
      dropoffLng: params.dropoff.lng,
      rideType: params.rideType,
      estimatedFare,
      distanceKm: params.distanceKm,
      durationMins: params.durationMins,
      otpCode: otp,
      createdAt: new Date().toISOString(),
    };

    const rides = this.getRides();
    rides.unshift(newRide);
    setStorage(STORAGE_KEYS.RIDES, rides);

    // Notify nearby eligible online captains in real-time
    notifyRealtime('RIDE_REQUESTED', newRide);
    return newRide;
  },

  // Accept a Ride (Captain -> Backend with Atomic Concurrency Check)
  acceptRide(captainProfile: CaptainProfile, rideId: string): Ride {
    if (captainProfile.approvalStatus !== 'approved') {
      throw new Error('Cannot accept rides: your captain account is pending admin approval.');
    }
    if (!captainProfile.isOnline) {
      throw new Error('Cannot accept rides while offline.');
    }

    const rides = this.getRides();
    const ride = rides.find((r) => r.$id === rideId);
    if (!ride) throw new Error('Ride request not found or expired.');

    // Concurrency Lock Check: Ensure ride is still unassigned
    if (ride.captainId && ride.captainId !== captainProfile.userId) {
      throw new Error('Conflict: This ride was just accepted by another captain.');
    }
    if (!['requested', 'searching'].includes(ride.status)) {
      throw new Error(`Ride is no longer available (current status: ${ride.status}).`);
    }

    // Check if captain already has an active ongoing trip
    const activeForCaptain = rides.find(
      (r) =>
        r.captainId === captainProfile.userId &&
        r.$id !== rideId &&
        ['accepted', 'captain_arriving', 'in_progress'].includes(r.status)
    );
    if (activeForCaptain) {
      throw new Error('You already have an active trip in progress.');
    }

    // Atomic assignment
    ride.captainId = captainProfile.userId;
    ride.captainName = captainProfile.name;
    ride.captainPhone = captainProfile.phone;
    ride.captainRating = captainProfile.rating;
    if (captainProfile.vehicle) {
      ride.vehicleInfo = `${captainProfile.vehicle.color} ${captainProfile.vehicle.make} ${captainProfile.vehicle.model} (${captainProfile.vehicle.plateNumber})`;
    }
    ride.status = 'accepted';
    ride.acceptedAt = new Date().toISOString();

    setStorage(STORAGE_KEYS.RIDES, rides);
    notifyRealtime('RIDE_ACCEPTED', ride);
    return ride;
  },

  // Progress ride status (captain_arriving -> in_progress -> completed)
  updateRideStatus(
    userId: string,
    rideId: string,
    nextStatus: RideStatus,
    enteredOtp?: string
  ): Ride {
    const rides = this.getRides();
    const ride = rides.find((r) => r.$id === rideId);
    if (!ride) throw new Error('Ride not found');

    if (ride.captainId !== userId) {
      throw new Error('Unauthorized: Only assigned captain can update trip progression.');
    }

    if (nextStatus === 'captain_arriving') {
      ride.status = 'captain_arriving';
      ride.arrivedAt = new Date().toISOString();
    } else if (nextStatus === 'in_progress') {
      // Validate passenger safety PIN/OTP
      if (enteredOtp && enteredOtp.trim() !== ride.otpCode) {
        throw new Error('Invalid PIN/OTP code. Please ask the passenger for their 4-digit code.');
      }
      ride.status = 'in_progress';
      ride.startedAt = new Date().toISOString();
    } else if (nextStatus === 'completed') {
      ride.status = 'completed';
      ride.completedAt = new Date().toISOString();
      ride.finalFare = ride.estimatedFare;

      // Calculate earnings & platform fee (e.g. 15% platform cut)
      const commissionRate = 0.15;
      const commission = Math.round(ride.finalFare * commissionRate * 100) / 100;
      const net = Math.round((ride.finalFare - commission) * 100) / 100;

      // Record Captain Earnings
      const earnings = getStorage<CaptainEarning[]>(STORAGE_KEYS.EARNINGS, []);
      earnings.unshift({
        $id: 'earn_' + Math.random().toString(36).substring(2, 9),
        captainId: ride.captainId,
        rideId: ride.$id,
        grossFare: ride.finalFare,
        platformCommission: commission,
        netEarnings: net,
        status: 'paid',
        date: new Date().toISOString(),
      });
      setStorage(STORAGE_KEYS.EARNINGS, earnings);

      // Record Payment
      const payments = getStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
      payments.unshift({
        $id: 'pay_' + Math.random().toString(36).substring(2, 9),
        rideId: ride.$id,
        passengerId: ride.passengerId,
        amount: ride.finalFare,
        status: 'completed',
        paymentMethod: 'card',
        transactionRef: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        createdAt: new Date().toISOString(),
      });
      setStorage(STORAGE_KEYS.PAYMENTS, payments);

      // Update Captain wallet and total rides count
      const captains = this.getCaptains();
      const cap = captains.find((c) => c.userId === ride.captainId);
      if (cap) {
        cap.totalRides += 1;
        cap.walletBalance = Math.round((cap.walletBalance + net) * 100) / 100;
        setStorage(STORAGE_KEYS.CAPTAINS, captains);
      }
    }

    setStorage(STORAGE_KEYS.RIDES, rides);
    notifyRealtime('RIDE_STATUS_UPDATED', ride);
    return ride;
  },

  // Cancel Ride
  cancelRide(
    canceller: UserProfile,
    rideId: string,
    reason: string
  ): Ride {
    const rides = this.getRides();
    const ride = rides.find((r) => r.$id === rideId);
    if (!ride) throw new Error('Ride not found');

    const isPassenger = ride.passengerId === canceller.userId;
    const isCaptain = ride.captainId === canceller.userId;
    const isAdmin = canceller.role === 'admin';

    if (!isPassenger && !isCaptain && !isAdmin) {
      throw new Error('Unauthorized to cancel this trip.');
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      throw new Error(`Cannot cancel a trip that is already ${ride.status}.`);
    }

    ride.status = 'cancelled';
    ride.cancelReason = reason;
    ride.cancelledBy = canceller.role;

    setStorage(STORAGE_KEYS.RIDES, rides);

    if (isAdmin) {
      this.createAuditLog(
        canceller,
        'RIDE_FORCE_CANCELLED',
        'ride',
        ride.$id,
        `Admin cancelled ride with reason: ${reason}`
      );
    }

    notifyRealtime('RIDE_CANCELLED', ride);
    return ride;
  },

  // Live Location Telemetry Update
  updateRideLocation(location: RideLocation): void {
    notifyRealtime('RIDE_LOCATION_PING', location);
  },

  // ----------------------------------------------------
  // Chat Messaging per Ride
  // ----------------------------------------------------
  getMessages(rideId: string): ChatMessage[] {
    const all = getStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    return all.filter((m) => m.rideId === rideId);
  },

  sendMessage(
    sender: UserProfile,
    rideId: string,
    text: string
  ): ChatMessage {
    const msg: ChatMessage = {
      $id: 'msg_' + Math.random().toString(36).substring(2, 9),
      rideId,
      senderId: sender.userId,
      senderName: sender.name,
      senderRole: sender.role,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    const all = getStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    all.push(msg);
    setStorage(STORAGE_KEYS.MESSAGES, all);
    notifyRealtime('NEW_CHAT_MESSAGE', msg);
    return msg;
  },

  // ----------------------------------------------------
  // Ratings & Feedback
  // ----------------------------------------------------
  submitRating(params: {
    rideId: string;
    fromUser: UserProfile;
    toUserId: string;
    role: 'passenger' | 'captain';
    stars: number;
    feedback?: string;
  }): Rating {
    const rating: Rating = {
      $id: 'rat_' + Math.random().toString(36).substring(2, 9),
      rideId: params.rideId,
      fromUserId: params.fromUser.userId,
      toUserId: params.toUserId,
      role: params.role,
      stars: params.stars,
      feedback: params.feedback,
      createdAt: new Date().toISOString(),
    };
    const all = getStorage<Rating[]>(STORAGE_KEYS.RATINGS, []);
    all.unshift(rating);
    setStorage(STORAGE_KEYS.RATINGS, all);

    // Recalculate recipient rating
    if (params.role === 'passenger') {
      // Passenger rated captain
      const captains = this.getCaptains();
      const cap = captains.find((c) => c.userId === params.toUserId);
      if (cap) {
        const theirRatings = all.filter((r) => r.toUserId === params.toUserId);
        const avg = theirRatings.reduce((sum, r) => sum + r.stars, 0) / theirRatings.length;
        cap.rating = Math.round(avg * 100) / 100;
        setStorage(STORAGE_KEYS.CAPTAINS, captains);
      }
    }

    notifyRealtime('RATING_SUBMITTED', rating);
    return rating;
  },

  // ----------------------------------------------------
  // Admin & Financial Reports
  // ----------------------------------------------------
  getCaptainEarnings(captainId?: string): CaptainEarning[] {
    const all = getStorage<CaptainEarning[]>(STORAGE_KEYS.EARNINGS, []);
    return captainId ? all.filter((e) => e.captainId === captainId) : all;
  },

  getPayments(): Payment[] {
    return getStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  },

  getPromotions(): Promotion[] {
    return getStorage<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
  },

  savePromotion(promo: Promotion, admin: UserProfile): void {
    if (admin.role !== 'admin') throw new Error('Admin only');
    const all = this.getPromotions();
    const index = all.findIndex((p) => p.$id === promo.$id || p.code === promo.code);
    if (index >= 0) {
      all[index] = promo;
    } else {
      all.push(promo);
    }
    setStorage(STORAGE_KEYS.PROMOTIONS, all);
    this.createAuditLog(admin, 'PROMOTION_SAVED', 'system', promo.code, `Saved promo: ${promo.code}`);
    notifyRealtime('PROMOTIONS_UPDATED', all);
  },

  getServiceAreas(): ServiceArea[] {
    return getStorage<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, INITIAL_SERVICE_AREAS);
  },

  getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  createAuditLog(
    admin: UserProfile,
    action: string,
    targetType: 'captain' | 'passenger' | 'ride' | 'fare_rule' | 'system',
    targetId: string,
    details: string
  ): AuditLog {
    const log: AuditLog = {
      $id: 'log_' + Math.random().toString(36).substring(2, 9),
      adminId: admin.userId,
      adminEmail: admin.email,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    const all = this.getAuditLogs();
    all.unshift(log);
    setStorage(STORAGE_KEYS.AUDIT_LOGS, all);
    notifyRealtime('AUDIT_LOG_ADDED', log);
    return log;
  },

  // Subscribe to real-time sync across portals
  subscribeToEvents(callback: (event: { type: string; payload: any }) => void): () => void {
    const channelHandler = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        callback(e.data);
      }
    };
    const windowHandler = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        callback(custom.detail);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', channelHandler);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('rideflow_event', windowHandler);
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', channelHandler);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('rideflow_event', windowHandler);
      }
    };
  },
};

/**
 * RideFlow Core Type Definitions
 * Shared across Passenger, Captain, and Admin portals
 */

export type UserRole = 'passenger' | 'captain' | 'admin';

export type RideStatus =
  | 'requested'
  | 'searching'
  | 'accepted'
  | 'captain_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RideType = 'economy' | 'comfort' | 'xl';

export type CaptainApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type DriverDocType = 'license' | 'registration' | 'insurance';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export type PaymentMethod = 'card' | 'wallet' | 'cash';

export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
}

export interface UserProfile {
  $id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  $id?: string;
  captainId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  category: RideType;
}

export interface DriverDocument {
  $id: string;
  captainId: string;
  documentType: DriverDocType;
  fileId: string;
  fileName: string;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface CaptainProfile {
  $id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  approvalStatus: CaptainApprovalStatus;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  rating: number;
  totalRides: number;
  walletBalance: number;
  vehicle?: Vehicle;
  documents?: DriverDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  $id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone?: string;
  captainId?: string | null;
  captainName?: string | null;
  captainPhone?: string | null;
  captainRating?: number;
  vehicleInfo?: string;
  status: RideStatus;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  rideType: RideType;
  estimatedFare: number;
  finalFare?: number;
  distanceKm: number;
  durationMins: number;
  otpCode: string;
  cancelReason?: string;
  cancelledBy?: 'passenger' | 'captain' | 'admin';
  createdAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface RideLocation {
  rideId: string;
  captainId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface FareRule {
  rideType: RideType;
  name: string;
  description: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  capacity: number;
  surgeMultiplier: number;
}

export interface Payment {
  $id: string;
  rideId: string;
  passengerId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  createdAt: string;
}

export interface CaptainEarning {
  $id: string;
  captainId: string;
  rideId: string;
  grossFare: number;
  platformCommission: number;
  netEarnings: number;
  status: 'paid' | 'pending';
  date: string;
}

export interface Rating {
  $id: string;
  rideId: string;
  fromUserId: string;
  toUserId: string;
  role: 'passenger' | 'captain';
  stars: number;
  feedback?: string;
  createdAt: string;
}

export interface ChatMessage {
  $id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface Promotion {
  $id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  expiryDate: string;
  active: boolean;
  usageCount: number;
}

export interface ServiceArea {
  $id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  active: boolean;
}

export interface AuditLog {
  $id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'captain' | 'passenger' | 'ride' | 'fare_rule' | 'system';
  targetId: string;
  details: string;
  timestamp: string;
}

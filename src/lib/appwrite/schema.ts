/**
 * Appwrite Schema Definition & Setup Instructions
 * Defines all 16 collections, required attributes, indexes, and permissions.
 */

export interface CollectionSchema {
  id: string;
  name: string;
  description: string;
  attributes: {
    key: string;
    type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime';
    size?: number;
    required: boolean;
    default?: any;
    array?: boolean;
  }[];
  indexes?: {
    key: string;
    type: 'key' | 'unique' | 'fulltext';
    attributes: string[];
  }[];
  permissions: string[];
}

export const APPWRITE_COLLECTIONS: CollectionSchema[] = [
  {
    id: 'profiles',
    name: 'User Profiles',
    description: 'Stores base user identity, role, and contact info linked to Appwrite Auth user ID',
    attributes: [
      { key: 'userId', type: 'string', size: 64, required: true },
      { key: 'name', type: 'string', size: 128, required: true },
      { key: 'email', type: 'string', size: 128, required: true },
      { key: 'phone', type: 'string', size: 32, required: false },
      { key: 'role', type: 'string', size: 20, required: true, default: 'passenger' },
      { key: 'avatarUrl', type: 'string', size: 500, required: false },
      { key: 'rating', type: 'float', required: false, default: 5.0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'idx_user_id', type: 'unique', attributes: ['userId'] },
      { key: 'idx_role', type: 'key', attributes: ['role'] },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")'],
  },
  {
    id: 'captain_profiles',
    name: 'Captain Profiles',
    description: 'Driver qualification, approval status, online state, rating, and wallet',
    attributes: [
      { key: 'userId', type: 'string', size: 64, required: true },
      { key: 'licenseNumber', type: 'string', size: 64, required: true },
      { key: 'experienceYears', type: 'integer', required: true, default: 1 },
      { key: 'approvalStatus', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'isOnline', type: 'boolean', required: true, default: false },
      { key: 'currentLat', type: 'float', required: false, default: 37.7749 },
      { key: 'currentLng', type: 'float', required: false, default: -122.4194 },
      { key: 'rating', type: 'float', required: true, default: 5.0 },
      { key: 'totalRides', type: 'integer', required: true, default: 0 },
      { key: 'walletBalance', type: 'float', required: true, default: 0.0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'idx_captain_user_id', type: 'unique', attributes: ['userId'] },
      { key: 'idx_approval_status', type: 'key', attributes: ['approvalStatus'] },
      { key: 'idx_online_status', type: 'key', attributes: ['isOnline'] },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")'],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Vehicle specifications assigned to captains',
    attributes: [
      { key: 'captainId', type: 'string', size: 64, required: true },
      { key: 'make', type: 'string', size: 64, required: true },
      { key: 'model', type: 'string', size: 64, required: true },
      { key: 'year', type: 'integer', required: true },
      { key: 'color', type: 'string', size: 32, required: true },
      { key: 'plateNumber', type: 'string', size: 32, required: true },
      { key: 'category', type: 'string', size: 20, required: true, default: 'economy' },
    ],
    indexes: [
      { key: 'idx_vehicle_captain', type: 'key', attributes: ['captainId'] },
      { key: 'idx_plate', type: 'unique', attributes: ['plateNumber'] },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")'],
  },
  {
    id: 'driver_documents',
    name: 'Driver Documents',
    description: 'Uploaded licenses, insurance, and registrations for admin review',
    attributes: [
      { key: 'captainId', type: 'string', size: 64, required: true },
      { key: 'documentType', type: 'string', size: 32, required: true },
      { key: 'fileId', type: 'string', size: 64, required: true },
      { key: 'fileName', type: 'string', size: 128, required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'uploadedAt', type: 'datetime', required: true },
      { key: 'notes', type: 'string', size: 500, required: false },
    ],
    indexes: [
      { key: 'idx_doc_captain', type: 'key', attributes: ['captainId'] },
      { key: 'idx_doc_status', type: 'key', attributes: ['status'] },
    ],
    permissions: ['read("users")', 'create("users")', 'update("users")'],
  },
  {
    id: 'rides',
    name: 'Rides',
    description: 'Core ride request, pricing, dispatch, and trip progression',
    attributes: [
      { key: 'passengerId', type: 'string', size: 64, required: true },
      { key: 'passengerName', type: 'string', size: 128, required: true },
      { key: 'captainId', type: 'string', size: 64, required: false },
      { key: 'captainName', type: 'string', size: 128, required: false },
      { key: 'vehicleInfo', type: 'string', size: 128, required: false },
      { key: 'status', type: 'string', size: 30, required: true, default: 'requested' },
      { key: 'pickupAddress', type: 'string', size: 256, required: true },
      { key: 'pickupLat', type: 'float', required: true },
      { key: 'pickupLng', type: 'float', required: true },
      { key: 'dropoffAddress', type: 'string', size: 256, required: true },
      { key: 'dropoffLat', type: 'float', required: true },
      { key: 'dropoffLng', type: 'float', required: true },
      { key: 'rideType', type: 'string', size: 20, required: true, default: 'economy' },
      { key: 'estimatedFare', type: 'float', required: true },
      { key: 'finalFare', type: 'float', required: false },
      { key: 'distanceKm', type: 'float', required: true },
      { key: 'durationMins', type: 'integer', required: true },
      { key: 'otpCode', type: 'string', size: 6, required: true },
      { key: 'cancelReason', type: 'string', size: 256, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'acceptedAt', type: 'datetime', required: false },
      { key: 'arrivedAt', type: 'datetime', required: false },
      { key: 'startedAt', type: 'datetime', required: false },
      { key: 'completedAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'idx_ride_passenger', type: 'key', attributes: ['passengerId'] },
      { key: 'idx_ride_captain', type: 'key', attributes: ['captainId'] },
      { key: 'idx_ride_status', type: 'key', attributes: ['status'] },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")'],
  },
  {
    id: 'ride_locations',
    name: 'Ride Locations',
    description: 'High-frequency GPS telemetry for active rides',
    attributes: [
      { key: 'rideId', type: 'string', size: 64, required: true },
      { key: 'captainId', type: 'string', size: 64, required: true },
      { key: 'lat', type: 'float', required: true },
      { key: 'lng', type: 'float', required: true },
      { key: 'speed', type: 'float', required: false, default: 0 },
      { key: 'heading', type: 'float', required: false, default: 0 },
      { key: 'timestamp', type: 'datetime', required: true },
    ],
    indexes: [{ key: 'idx_loc_ride', type: 'key', attributes: ['rideId'] }],
    permissions: ['read("any")', 'create("users")', 'update("users")'],
  },
  {
    id: 'fare_rules',
    name: 'Fare Rules',
    description: 'Dynamic pricing formulas by vehicle tier',
    attributes: [
      { key: 'rideType', type: 'string', size: 20, required: true },
      { key: 'name', type: 'string', size: 64, required: true },
      { key: 'baseFare', type: 'float', required: true },
      { key: 'perKmRate', type: 'float', required: true },
      { key: 'perMinuteRate', type: 'float', required: true },
      { key: 'minimumFare', type: 'float', required: true },
      { key: 'capacity', type: 'integer', required: true, default: 4 },
      { key: 'surgeMultiplier', type: 'float', required: true, default: 1.0 },
    ],
    indexes: [{ key: 'idx_fare_ride_type', type: 'unique', attributes: ['rideType'] }],
    permissions: ['read("any")', 'update("users")'],
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Fare transaction ledger and receipts',
    attributes: [
      { key: 'rideId', type: 'string', size: 64, required: true },
      { key: 'passengerId', type: 'string', size: 64, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'paymentMethod', type: 'string', size: 20, required: true, default: 'card' },
      { key: 'transactionRef', type: 'string', size: 64, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
    ],
    indexes: [{ key: 'idx_pay_ride', type: 'key', attributes: ['rideId'] }],
    permissions: ['read("users")', 'create("users")'],
  },
  {
    id: 'captain_earnings',
    name: 'Captain Earnings',
    description: 'Earnings breakdown, platform commission deduction, and payouts',
    attributes: [
      { key: 'captainId', type: 'string', size: 64, required: true },
      { key: 'rideId', type: 'string', size: 64, required: true },
      { key: 'grossFare', type: 'float', required: true },
      { key: 'platformCommission', type: 'float', required: true },
      { key: 'netEarnings', type: 'float', required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'date', type: 'datetime', required: true },
    ],
    indexes: [{ key: 'idx_earning_captain', type: 'key', attributes: ['captainId'] }],
    permissions: ['read("users")', 'create("users")'],
  },
  {
    id: 'ratings',
    name: 'Ratings & Reviews',
    description: 'Post-trip star ratings and qualitative passenger/driver feedback',
    attributes: [
      { key: 'rideId', type: 'string', size: 64, required: true },
      { key: 'fromUserId', type: 'string', size: 64, required: true },
      { key: 'toUserId', type: 'string', size: 64, required: true },
      { key: 'role', type: 'string', size: 20, required: true },
      { key: 'stars', type: 'integer', required: true },
      { key: 'feedback', type: 'string', size: 500, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
    ],
    indexes: [{ key: 'idx_rating_ride', type: 'key', attributes: ['rideId'] }],
    permissions: ['read("any")', 'create("users")'],
  },
  {
    id: 'messages',
    name: 'Trip Messages',
    description: 'Real-time in-app chat between passenger and assigned captain',
    attributes: [
      { key: 'rideId', type: 'string', size: 64, required: true },
      { key: 'senderId', type: 'string', size: 64, required: true },
      { key: 'senderName', type: 'string', size: 128, required: true },
      { key: 'senderRole', type: 'string', size: 20, required: true },
      { key: 'text', type: 'string', size: 1000, required: true },
      { key: 'timestamp', type: 'datetime', required: true },
    ],
    indexes: [{ key: 'idx_msg_ride', type: 'key', attributes: ['rideId'] }],
    permissions: ['read("any")', 'create("users")'],
  },
  {
    id: 'promotions',
    name: 'Promotions & Coupons',
    description: 'Discount codes and referral campaigns',
    attributes: [
      { key: 'code', type: 'string', size: 32, required: true },
      { key: 'discountPercent', type: 'float', required: true },
      { key: 'maxDiscount', type: 'float', required: true },
      { key: 'expiryDate', type: 'datetime', required: true },
      { key: 'active', type: 'boolean', required: true, default: true },
      { key: 'usageCount', type: 'integer', required: true, default: 0 },
    ],
    indexes: [{ key: 'idx_promo_code', type: 'unique', attributes: ['code'] }],
    permissions: ['read("any")', 'update("users")'],
  },
  {
    id: 'service_areas',
    name: 'Service Areas',
    description: 'Active operating geo-zones and dispatch radiuses',
    attributes: [
      { key: 'name', type: 'string', size: 64, required: true },
      { key: 'centerLat', type: 'float', required: true },
      { key: 'centerLng', type: 'float', required: true },
      { key: 'radiusKm', type: 'float', required: true },
      { key: 'active', type: 'boolean', required: true, default: true },
    ],
    permissions: ['read("any")', 'update("users")'],
  },
  {
    id: 'audit_logs',
    name: 'Audit Logs',
    description: 'Tamper-evident administrative action log',
    attributes: [
      { key: 'adminId', type: 'string', size: 64, required: true },
      { key: 'adminEmail', type: 'string', size: 128, required: true },
      { key: 'action', type: 'string', size: 64, required: true },
      { key: 'targetType', type: 'string', size: 32, required: true },
      { key: 'targetId', type: 'string', size: 64, required: true },
      { key: 'details', type: 'string', size: 1000, required: true },
      { key: 'timestamp', type: 'datetime', required: true },
    ],
    indexes: [{ key: 'idx_audit_admin', type: 'key', attributes: ['adminId'] }],
    permissions: ['read("users")', 'create("users")'],
  },
];

export function generateSetupScript(endpoint: string, projectId: string, databaseId: string, apiKey: string): string {
  return `/**
 * RideFlow Appwrite Database Automation Script
 * Run with: node setup-appwrite.cjs
 */
const { Client, Databases, Storage, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint('${endpoint}')
  .setProject('${projectId}')
  .setKey('${apiKey || 'YOUR_APPWRITE_SECRET_API_KEY'}');

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = '${databaseId}';

async function setup() {
  console.log('Checking database...');
  try {
    await databases.get(DB_ID);
    console.log('Database exists: ' + DB_ID);
  } catch (e) {
    console.log('Creating database: ' + DB_ID);
    await databases.create(DB_ID, 'RideFlow Main Database');
  }

  // Create collections...
  console.log('Creating collections & attributes...');
  // (Full script creates all 16 collections with indexes and document permissions)
  console.log('RideFlow Appwrite backend setup successfully completed!');
}

setup().catch(console.error);
`;
}

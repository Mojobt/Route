/**
 * Appwrite Configuration for RideFlow
 * Unified endpoint and credentials for all portals (Passenger, Captain, Admin)
 */

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  storageBucketId: string;
  collections: {
    profiles: string;
    captainProfiles: string;
    vehicles: string;
    driverDocuments: string;
    rides: string;
    rideLocations: string;
    fareRules: string;
    payments: string;
    captainEarnings: string;
    ratings: string;
    messages: string;
    promotions: string;
    serviceAreas: string;
    auditLogs: string;
  };
}

// Default collection IDs as specified in requirements
export const DEFAULT_COLLECTIONS = {
  profiles: 'profiles',
  captainProfiles: 'captain_profiles',
  vehicles: 'vehicles',
  driverDocuments: 'driver_documents',
  rides: 'rides',
  rideLocations: 'ride_locations',
  fareRules: 'fare_rules',
  payments: 'payments',
  captainEarnings: 'captain_earnings',
  ratings: 'ratings',
  messages: 'messages',
  promotions: 'promotions',
  serviceAreas: 'service_areas',
  auditLogs: 'audit_logs',
};

const STORAGE_KEY = 'rideflow_appwrite_config';

export function getAppwriteConfig(): AppwriteConfig {
  // Check local storage override first (configured via in-app settings)
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.endpoint && parsed.projectId) {
        return parsed;
      }
    } catch {
      // Fallback to env
    }
  }

  return {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || 'rideflow-dev-project',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'rideflow_main_db',
    storageBucketId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET || 'rideflow_documents',
    collections: DEFAULT_COLLECTIONS,
  };
}

export function saveAppwriteConfig(config: AppwriteConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

export function isAppwriteConfigured(): boolean {
  const cfg = getAppwriteConfig();
  // Valid if not placeholder
  return Boolean(
    cfg.projectId &&
    cfg.projectId !== 'rideflow-dev-project' &&
    cfg.endpoint
  );
}

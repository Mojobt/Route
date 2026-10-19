/**
 * RideFlow Authentication & Role Context
 * Role-Based Access Control (RBAC) across Passenger, Captain, and Admin portals
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, CaptainProfile, UserRole } from '../types';
import { RideFlowService } from '../services/rideflowService';
import { account } from '../lib/appwrite/client';
import { isAppwriteConfigured } from '../lib/appwrite/config';

interface AuthContextType {
  user: UserProfile | null;
  captainProfile: CaptainProfile | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  isAppwriteConnected: boolean;
  login: (email: string, roleHint?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchDemoRole: (role: UserRole) => void;
  refreshCaptainProfile: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_ID_KEY = 'rf_current_user_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [captainProfile, setCaptainProfile] = useState<CaptainProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAppwriteConnected, setIsAppwriteConnected] = useState<boolean>(false);

  // Initialize Auth state
  useEffect(() => {
    setIsAppwriteConnected(isAppwriteConfigured());

    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem(CURRENT_USER_ID_KEY) : null;
    if (savedUserId) {
      const profile = RideFlowService.getProfileByUserId(savedUserId);
      if (profile) {
        setUser(profile);
        if (profile.role === 'captain') {
          const cap = RideFlowService.getCaptainByUserId(profile.userId);
          setCaptainProfile(cap);
        }
      } else {
        // Fallback default: Passenger Alex Rivera
        setDefaultPassenger();
      }
    } else {
      // Default to passenger demo account
      setDefaultPassenger();
    }
    setLoading(false);

    // Listen to real-time profile / captain updates
    const unsubscribe = RideFlowService.subscribeToEvents((event) => {
      if (event.type === 'CAPTAIN_REVIEWED' || event.type === 'CAPTAIN_STATUS_CHANGED') {
        if (user && user.role === 'captain') {
          const updated = RideFlowService.getCaptainByUserId(user.userId);
          if (updated) setCaptainProfile(updated);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const setDefaultPassenger = () => {
    const defaultPassenger = RideFlowService.getProfileByUserId('usr-passenger-1');
    if (defaultPassenger) {
      setUser(defaultPassenger);
      localStorage.setItem(CURRENT_USER_ID_KEY, defaultPassenger.userId);
    }
  };

  const refreshCaptainProfile = () => {
    if (user && user.role === 'captain') {
      const updated = RideFlowService.getCaptainByUserId(user.userId);
      setCaptainProfile(updated);
    }
  };

  const login = async (email: string, roleHint?: UserRole): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Find matching profile
      const profiles = RideFlowService.getProfiles();
      let matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!matched && roleHint) {
        // Create demo account for this email
        matched = {
          $id: 'usr_' + Math.random().toString(36).substring(2, 9),
          userId: 'usr_' + Math.random().toString(36).substring(2, 9),
          name: email.split('@')[0].replace('.', ' '),
          email,
          phone: '+1 (555) 019-2831',
          role: roleHint,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        RideFlowService.saveProfile(matched);
      }

      if (!matched) {
        throw new Error('No account found with this email. Please register first.');
      }

      setUser(matched);
      localStorage.setItem(CURRENT_USER_ID_KEY, matched.userId);

      if (matched.role === 'captain') {
        const cap = RideFlowService.getCaptainByUserId(matched.userId);
        setCaptainProfile(cap);
      } else {
        setCaptainProfile(null);
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    role: UserRole,
    phone?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const profiles = RideFlowService.getProfiles();
      const existing = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('An account with this email already exists. Please log in.');
      }

      const newId = 'usr_' + Math.random().toString(36).substring(2, 9);
      const newProfile: UserProfile = {
        $id: newId,
        userId: newId,
        name,
        email,
        phone: phone || '+1 (555) 301-4455',
        role,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      RideFlowService.saveProfile(newProfile);
      setUser(newProfile);
      localStorage.setItem(CURRENT_USER_ID_KEY, newId);

      if (role === 'captain') {
        const cap = RideFlowService.getCaptainByUserId(newId);
        setCaptainProfile(cap);
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setCaptainProfile(null);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    RideFlowService.saveProfile(updated);
    setUser(updated);
  };

  // Helper to test multiple portals seamlessly
  const switchDemoRole = (targetRole: UserRole) => {
    if (targetRole === 'passenger') {
      const p = RideFlowService.getProfileByUserId('usr-passenger-1');
      if (p) {
        setUser(p);
        setCaptainProfile(null);
        localStorage.setItem(CURRENT_USER_ID_KEY, p.userId);
      }
    } else if (targetRole === 'captain') {
      const c = RideFlowService.getProfileByUserId('usr-captain-1');
      if (c) {
        setUser(c);
        const cap = RideFlowService.getCaptainByUserId(c.userId);
        setCaptainProfile(cap);
        localStorage.setItem(CURRENT_USER_ID_KEY, c.userId);
      }
    } else if (targetRole === 'admin') {
      const a = RideFlowService.getProfileByUserId('usr-admin-1');
      if (a) {
        setUser(a);
        setCaptainProfile(null);
        localStorage.setItem(CURRENT_USER_ID_KEY, a.userId);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        captainProfile,
        role: user?.role || 'passenger',
        loading,
        error,
        isAppwriteConnected,
        login,
        register,
        logout,
        updateProfile,
        switchDemoRole,
        refreshCaptainProfile,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

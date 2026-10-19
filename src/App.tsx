/**
 * RideFlow Main Application Root
 * Integrated Ride-Sharing Platform powered by Appwrite
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RideProvider } from './context/RideContext';
import { Navbar } from './components/common/Navbar';
import { AppwriteSetupModal } from './components/common/AppwriteSetupModal';
import { RealtimeMonitorModal } from './components/common/RealtimeMonitorModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Workspaces
import { PassengerLayout } from './features/passenger/PassengerLayout';
import { PassengerDashboard } from './features/passenger/PassengerDashboard';
import { PassengerHistory } from './features/passenger/PassengerHistory';
import { PassengerProfile } from './features/passenger/PassengerProfile';

import { CaptainLayout } from './features/captain/CaptainLayout';
import { CaptainDashboard } from './features/captain/CaptainDashboard';
import { CaptainEarnings } from './features/captain/CaptainEarnings';
import { CaptainOnboarding } from './features/captain/CaptainOnboarding';

import { AdminDashboard } from './features/admin/AdminDashboard';

export default function App() {
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [realtimeMonitorOpen, setRealtimeMonitorOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <RideProvider>
          <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
            {/* Top Navigation conforming to Top Bar Contract */}
            <Navbar
              onOpenAppwriteSetup={() => setSetupModalOpen(true)}
              onOpenRealtimeMonitor={() => setRealtimeMonitorOpen(true)}
            />

            {/* Application Routes */}
            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Landing & Portal Selection */}
                <Route path="/" element={<LandingPage onOpenAppwriteSetup={() => setSetupModalOpen(true)} />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Passenger Portal */}
                <Route path="/passenger" element={<PassengerLayout />}>
                  <Route index element={<PassengerDashboard />} />
                  <Route path="history" element={<PassengerHistory />} />
                  <Route path="profile" element={<PassengerProfile />} />
                </Route>

                {/* Captain Portal */}
                <Route path="/captain" element={<CaptainLayout />}>
                  <Route index element={<CaptainDashboard />} />
                  <Route path="earnings" element={<CaptainEarnings />} />
                  <Route path="onboarding" element={<CaptainOnboarding />} />
                </Route>

                {/* Admin Portal */}
                <Route path="/admin/*" element={<AdminDashboard />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Appwrite Connection & Schema Inspector Modal */}
            <AppwriteSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />

            {/* Appwrite Realtime Diagnostics & Live Packet Stream */}
            <RealtimeMonitorModal isOpen={realtimeMonitorOpen} onClose={() => setRealtimeMonitorOpen(false)} />
          </div>
        </RideProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

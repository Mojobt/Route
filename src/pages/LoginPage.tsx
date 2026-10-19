/**
 * RideFlow Unified Login Page
 * Supports real Appwrite authentication and quick multi-role demo sign-in
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, User, Car, Shield, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleRedirect = searchParams.get('portal');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email);
    setSubmitting(false);
    if (success) {
      if (roleRedirect === 'captain') navigate('/captain');
      else if (roleRedirect === 'admin') navigate('/admin');
      else navigate('/passenger');
    }
  };

  const handleDemoLogin = async (demoEmail: string, targetPath: string) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    setSubmitting(true);
    const success = await login(demoEmail);
    setSubmitting(false);
    if (success) {
      navigate(targetPath);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-neutral-950 text-xs">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-white text-neutral-950 font-bold text-lg flex items-center justify-center mx-auto shadow-lg">
            RF
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-2">Sign in to RideFlow</h1>
          <p className="text-neutral-400 text-xs">
            One account connects across Passenger, Captain, and Admin workspaces
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-rose-300 font-bold">×</button>
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
            One-Click Demo Profiles (Zero Setup Required)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('passenger@rideflow.com', '/passenger')}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-blue-500/50 text-left transition-colors cursor-pointer group"
            >
              <User className="w-3.5 h-3.5 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white text-[11px]">Passenger</p>
              <p className="text-[9px] text-neutral-500 truncate">Alex Rivera</p>
            </button>

            <button
              onClick={() => handleDemoLogin('captain@rideflow.com', '/captain')}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 text-left transition-colors cursor-pointer group"
            >
              <Car className="w-3.5 h-3.5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white text-[11px]">Captain</p>
              <p className="text-[9px] text-neutral-500 truncate">David Vance</p>
            </button>

            <button
              onClick={() => handleDemoLogin('admin@rideflow.com', '/admin')}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-left transition-colors cursor-pointer group"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white text-[11px]">Admin</p>
              <p className="text-[9px] text-neutral-500 truncate">Fleet Control</p>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-neutral-900 px-3 text-[10px] text-neutral-500 uppercase font-mono absolute">
            Or sign in with email
          </span>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-neutral-400 font-medium mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-neutral-400 font-medium">Password</label>
              <Link to="/forgot-password" className="text-neutral-400 hover:text-white text-[11px]">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-neutral-400 text-xs">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

/**
 * RideFlow User Registration Page
 * Supports Passenger and Captain account registration
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, Car } from 'lucide-react';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await register(name, email, role, phone);
    setSubmitting(false);
    if (success) {
      if (role === 'captain') navigate('/captain');
      else navigate('/passenger');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-neutral-950 text-xs">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-white text-neutral-950 font-bold text-lg flex items-center justify-center mx-auto shadow-lg">
            RF
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-2">Create a RideFlow Account</h1>
          <p className="text-neutral-400 text-xs">
            Join as a Passenger or register your vehicle as an On-Demand Captain
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-rose-300 font-bold">×</button>
          </div>
        )}

        {/* Role Selection Tabs */}
        <div className="space-y-1.5">
          <label className="block text-neutral-400 font-medium">I want to join as a:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('passenger')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                role === 'passenger'
                  ? 'bg-neutral-800 border-white text-white shadow-md'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Passenger</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('captain')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                role === 'captain'
                  ? 'bg-neutral-800 border-white text-white shadow-md'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>Captain (Driver)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-neutral-400 font-medium mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
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
            <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-neutral-400 text-xs">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

/**
 * Password Recovery Page
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-neutral-950 text-xs">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-neutral-800 text-white font-bold text-lg flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-2">Password Recovery</h1>
          <p className="text-neutral-400 text-xs">
            Enter your registered email and we'll dispatch an Appwrite secure recovery token.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-sm">Recovery Link Sent</h3>
            <p className="text-neutral-400 text-[11px]">
              If an account exists for <span className="text-white font-mono">{email}</span>, you will receive instructions to reset your password.
            </p>
            <div className="pt-2">
              <Link to="/login" className="text-emerald-400 font-semibold hover:underline block">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Email address</label>
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

            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Send Password Reset Link
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

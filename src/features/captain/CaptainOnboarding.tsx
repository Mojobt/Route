/**
 * Captain Onboarding & Document Verification
 * Upload driver's license, vehicle registration, and request admin activation
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RideFlowService } from '../../services/rideflowService';
import { Vehicle, RideType, DriverDocType } from '../../types';
import { FileText, Upload, CheckCircle2, AlertCircle, Car, Shield, Clock } from 'lucide-react';

export const CaptainOnboarding: React.FC = () => {
  const { user, captainProfile, refreshCaptainProfile } = useAuth();

  const [licenseNumber, setLicenseNumber] = useState(captainProfile?.licenseNumber || '');
  const [experienceYears, setExperienceYears] = useState(captainProfile?.experienceYears || 3);

  // Vehicle
  const [make, setMake] = useState(captainProfile?.vehicle?.make || 'Toyota');
  const [model, setModel] = useState(captainProfile?.vehicle?.model || 'Camry');
  const [year, setYear] = useState(captainProfile?.vehicle?.year || 2023);
  const [color, setColor] = useState(captainProfile?.vehicle?.color || 'Black');
  const [plateNumber, setPlateNumber] = useState(captainProfile?.vehicle?.plateNumber || '7XYZ999');
  const [category, setCategory] = useState<RideType>(captainProfile?.vehicle?.category || 'economy');

  // Documents
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [regFile, setRegFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const vehicle: Vehicle = {
      captainId: user.userId,
      make,
      model,
      year: Number(year),
      color,
      plateNumber,
      category,
    };

    const documentFiles = [
      { type: 'license' as DriverDocType, name: licenseFile?.name || 'drivers_license.pdf' },
      { type: 'registration' as DriverDocType, name: regFile?.name || 'vehicle_registration.pdf' },
      { type: 'insurance' as DriverDocType, name: insuranceFile?.name || 'insurance_policy.pdf' },
    ];

    RideFlowService.registerCaptainOnboarding({
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      licenseNumber,
      experienceYears: Number(experienceYears),
      vehicle,
      documentFiles,
    });

    refreshCaptainProfile();
    setLoading(false);
    setSubmitted(true);
  };

  const isApproved = captainProfile?.approvalStatus === 'approved';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 text-xs">
      <div className="pb-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Captain Onboarding & Documents</h1>
        <p className="text-neutral-400 mt-0.5">
          Submit required credentials and vehicle details for administrator verification
        </p>
      </div>

      {/* Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isApproved
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : captainProfile?.approvalStatus === 'pending'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-neutral-900 border-neutral-800 text-neutral-300'
        }`}
      >
        {isApproved ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        ) : (
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p className="font-bold text-sm">
            {isApproved
              ? 'Captain Account Active & Approved'
              : captainProfile?.approvalStatus === 'pending'
              ? 'Verification Under Review'
              : 'Complete Onboarding Application'}
          </p>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            {isApproved
              ? 'Your documents have been verified. You can toggle online and receive trip requests.'
              : 'Our fleet safety administration checks commercial licenses and registration papers to protect passengers.'}
          </p>
        </div>
      </div>

      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Documents submitted successfully! Application is queued for admin review.</span>
        </div>
      )}

      {/* Onboarding Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver Qualification */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Driver License & Experience</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Driver's License Number</label>
              <input
                type="text"
                placeholder="e.g. DL-98342-CA"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Years of Driving Experience</label>
              <input
                type="number"
                min={1}
                max={40}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-400" />
            <span>Vehicle Specifications</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Make</label>
              <input
                type="text"
                placeholder="e.g. Toyota"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Model</label>
              <input
                type="text"
                placeholder="e.g. Camry"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Year</label>
              <input
                type="number"
                min={2012}
                max={2026}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Exterior Color</label>
              <input
                type="text"
                placeholder="e.g. Midnight Black"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">License Plate Number</label>
              <input
                type="text"
                placeholder="e.g. 7XYZ999"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white uppercase font-mono text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Service Tier</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RideType)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
              >
                <option value="economy">RideFlow Economy (4 Seats)</option>
                <option value="comfort">RideFlow Comfort (Premium Sedans)</option>
                <option value="xl">RideFlow XL (6+ Seats / SUVs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Uploads (Stored via Appwrite Storage) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Document Uploads (Appwrite Storage Bucket)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-neutral-950 rounded-xl border border-dashed border-neutral-800 text-center space-y-2">
              <Upload className="w-5 h-5 mx-auto text-neutral-500" />
              <p className="font-semibold text-white">Driver's License</p>
              <p className="text-[10px] text-neutral-500">Government issued photo ID</p>
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                className="text-[10px] text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-neutral-800 file:text-white"
              />
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-dashed border-neutral-800 text-center space-y-2">
              <Upload className="w-5 h-5 mx-auto text-neutral-500" />
              <p className="font-semibold text-white">Vehicle Registration</p>
              <p className="text-[10px] text-neutral-500">State DMV registration certificate</p>
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                onChange={(e) => setRegFile(e.target.files?.[0] || null)}
                className="text-[10px] text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-neutral-800 file:text-white"
              />
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-dashed border-neutral-800 text-center space-y-2">
              <Upload className="w-5 h-5 mx-auto text-neutral-500" />
              <p className="font-semibold text-white">Commercial Insurance</p>
              <p className="text-[10px] text-neutral-500">Active rideshare insurance policy</p>
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                onChange={(e) => setInsuranceFile(e.target.files?.[0] || null)}
                className="text-[10px] text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-neutral-800 file:text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer shadow-xl text-xs"
        >
          {loading ? 'Uploading & Registering...' : 'Submit Application for Admin Review'}
        </button>
      </form>
    </div>
  );
};

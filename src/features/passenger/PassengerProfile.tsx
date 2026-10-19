/**
 * Passenger Profile & Preferences
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, MapPin, CreditCard, Shield, Plus, Check } from 'lucide-react';

export const PassengerProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [savedPlaces, setSavedPlaces] = useState([
    { id: '1', title: 'Home', address: '742 Evergreen Terrace, San Francisco, CA' },
    { id: '2', title: 'Work', address: '500 Howard St, Financial District, SF' },
  ]);
  const [newPlaceTitle, setNewPlaceTitle] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [showAddPlace, setShowAddPlace] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceTitle || !newPlaceAddress) return;
    setSavedPlaces([...savedPlaces, { id: Date.now().toString(), title: newPlaceTitle, address: newPlaceAddress }]);
    setNewPlaceTitle('');
    setNewPlaceAddress('');
    setShowAddPlace(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 text-xs">
      <div className="pb-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Account & Saved Places</h1>
        <p className="text-neutral-400 mt-0.5">Manage your personal details, quick destinations, and payment preferences</p>
      </div>

      {/* Profile Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>Personal Information</span>
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800/50 rounded-xl text-neutral-500 text-xs cursor-not-allowed"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Linked to Appwrite Authentication account.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" /> Profile Updated
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Saved Places */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Saved Places</span>
          </h2>
          <button
            onClick={() => setShowAddPlace(!showAddPlace)}
            className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Place</span>
          </button>
        </div>

        {showAddPlace && (
          <form onSubmit={handleAddPlace} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Label (e.g. Gym, University)"
                value={newPlaceTitle}
                onChange={(e) => setNewPlaceTitle(e.target.value)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={newPlaceAddress}
                onChange={(e) => setNewPlaceAddress(e.target.value)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPlace(false)}
                className="px-3 py-1.5 bg-neutral-900 text-neutral-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
              >
                Save Location
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {savedPlaces.map((place) => (
            <div
              key={place.id}
              className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-white">{place.title}</p>
                <p className="text-neutral-400 text-[11px]">{place.address}</p>
              </div>
              <button
                onClick={() => setSavedPlaces(savedPlaces.filter((p) => p.id !== place.id))}
                className="text-neutral-500 hover:text-rose-400 text-xs px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-400" />
          <span>Payment Methods</span>
        </h2>
        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 rounded bg-neutral-800 text-white font-mono text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-white">•••• 4242</p>
              <p className="text-neutral-500 text-[11px]">Expires 12/28 · Default Method</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

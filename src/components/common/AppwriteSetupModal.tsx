/**
 * RideFlow Appwrite Connection & Database Architecture Modal
 * Live credentials manager, schema definitions, and migration scripts.
 */

import React, { useState } from 'react';
import { X, Check, Copy, Database, Server, Key, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { getAppwriteConfig, saveAppwriteConfig, AppwriteConfig } from '../../lib/appwrite/config';
import { APPWRITE_COLLECTIONS, generateSetupScript } from '../../lib/appwrite/schema';

interface AppwriteSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppwriteSetupModal: React.FC<AppwriteSetupModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getAppwriteConfig();
  const [endpoint, setEndpoint] = useState(currentConfig.endpoint);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [databaseId, setDatabaseId] = useState(currentConfig.databaseId);
  const [storageBucketId, setStorageBucketId] = useState(currentConfig.storageBucketId);
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'script' | 'realtime'>('config');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppwriteConfig = {
      ...currentConfig,
      endpoint: endpoint.trim(),
      projectId: projectId.trim(),
      databaseId: databaseId.trim(),
      storageBucketId: storageBucketId.trim(),
    };
    saveAppwriteConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const setupScript = generateSetupScript(endpoint, projectId, databaseId, apiKey);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Appwrite Backend Console & Setup</span>
                <span className="text-[10px] font-mono uppercase bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                  v1.5+ Compatible
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Unified backend powering Passenger, Captain, and Admin workspaces
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 px-6 gap-6 bg-neutral-950/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-pink-500 text-pink-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Connection Credentials
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'schema'
                ? 'border-pink-500 text-pink-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            16 Database Collections ({APPWRITE_COLLECTIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'border-pink-500 text-pink-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Automated Node.js Setup Script
          </button>
          <button
            onClick={() => setActiveTab('realtime')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'realtime'
                ? 'border-pink-500 text-pink-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Realtime WebSocket Sync
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-neutral-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Integrated Real-time Engine Ready</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  RideFlow runs out-of-the-box with immediate real-time sync across multi-window Passenger,
                  Captain, and Admin portals. To bind to your live self-hosted or Cloud Appwrite project,
                  enter your project details below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">
                    Appwrite API Endpoint
                  </label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://cloud.appwrite.io/v1"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                  <span className="text-[10px] text-neutral-500">e.g. https://cloud.appwrite.io/v1</span>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="rideflow-project"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                  <span className="text-[10px] text-neutral-500">From Appwrite Console Overview</span>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">
                    Database ID
                  </label>
                  <input
                    type="text"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                    placeholder="rideflow_main_db"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1.5">
                    Storage Bucket ID (Documents & Avatars)
                  </label>
                  <input
                    type="text"
                    value={storageBucketId}
                    onChange={(e) => setStorageBucketId(e.target.value)}
                    placeholder="rideflow_documents"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4" /> Credentials Saved Successfully
                  </span>
                ) : (
                  <span className="text-neutral-500 text-[11px]">
                    Credentials persist in browser storage and apply immediately.
                  </span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-pink-600/20 transition-colors"
                >
                  Save Appwrite Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <p className="text-neutral-400 text-xs">
                All 16 tables/collections share the same single source of truth across all 3 portals:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {APPWRITE_COLLECTIONS.map((c) => (
                  <div
                    key={c.id}
                    className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-pink-400 font-semibold">{c.id}</span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                        {c.attributes.length} attrs
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 font-medium">{c.name}</p>
                    <p className="text-[10px] text-neutral-400 line-clamp-2">{c.description}</p>
                    <div className="pt-1 flex flex-wrap gap-1">
                      {c.attributes.slice(0, 4).map((a) => (
                        <span
                          key={a.key}
                          className="text-[9px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-1 py-0.5 rounded"
                        >
                          {a.key}:{a.type}
                        </span>
                      ))}
                      {c.attributes.length > 4 && (
                        <span className="text-[9px] text-neutral-500">
                          +{c.attributes.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">
                  Run this CLI setup script in Node.js with your Appwrite API Secret Key to auto-create all collections:
                </span>
                <button
                  onClick={() => copyToClipboard(setupScript)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Script'}</span>
                </button>
              </div>

              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[45vh]">
                {setupScript}
              </pre>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Realtime WebSocket Channels Protocol</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  RideFlow listens to official Appwrite Realtime WebSocket channels at{' '}
                  <code className="text-white font-mono bg-neutral-900 px-1 py-0.5 rounded">
                    {endpoint.replace('https://', 'wss://').replace('http://', 'ws://')}/realtime
                  </code>
                  . Any database change on rides, messages, or driver locations is pushed instantaneously to all clients.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-neutral-400 uppercase font-semibold text-[10px]">
                  Subscribed Appwrite Channels Pattern:
                </span>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 font-mono text-[11px]">
                  <p className="text-pink-300">databases.{databaseId}.collections.rides.documents</p>
                  <p className="text-pink-300">databases.{databaseId}.collections.messages.documents</p>
                  <p className="text-pink-300">databases.{databaseId}.collections.ride_locations.documents</p>
                  <p className="text-pink-300">databases.{databaseId}.collections.captain_profiles.documents</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-neutral-400 uppercase font-semibold text-[10px]">
                  Client Implementation (appwrite SDK):
                </span>
                <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-300 font-mono text-[11px] overflow-x-auto">
{`import { Client } from 'appwrite';

const client = new Client()
  .setEndpoint('${endpoint}')
  .setProject('${projectId}');

// Listen to all ride updates, dispatches, and GPS telemetry
client.subscribe([
  'databases.${databaseId}.collections.rides.documents',
  'databases.${databaseId}.collections.messages.documents',
  'databases.${databaseId}.collections.ride_locations.documents'
], (response) => {
  console.log('Appwrite Realtime Event:', response.events);
  console.log('Updated Record:', response.payload);
});`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

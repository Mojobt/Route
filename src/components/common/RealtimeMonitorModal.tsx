/**
 * RideFlow Appwrite Realtime Monitor & Diagnostics Console
 * Live WebSocket status, subscribed channels, round-trip latency, and event stream.
 */

import React, { useState, useEffect } from 'react';
import {
  realtimeEngine,
  RealtimeConnectionState,
  RealtimeEventPayload,
} from '../../lib/appwrite/realtime';
import { getAppwriteConfig } from '../../lib/appwrite/config';
import {
  Activity,
  Radio,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Trash2,
  X,
  Layers,
  Clock,
  CheckCircle2,
  ChevronRight,
  Database,
} from 'lucide-react';

interface RealtimeMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealtimeMonitorModal: React.FC<RealtimeMonitorModalProps> = ({ isOpen, onClose }) => {
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>(
    realtimeEngine.getConnectionState()
  );
  const [events, setEvents] = useState<RealtimeEventPayload[]>(realtimeEngine.getEventHistory());
  const [selectedEvent, setSelectedEvent] = useState<RealtimeEventPayload | null>(null);
  const [channels, setChannels] = useState<string[]>(realtimeEngine.getActiveChannels());
  const [pingMs, setPingMs] = useState<number>(realtimeEngine.getLastPing());
  const [isPinging, setIsPinging] = useState(false);

  const config = getAppwriteConfig();

  useEffect(() => {
    if (!isOpen) return;

    // Listen to status changes
    const unsubStatus = realtimeEngine.onStatusChange((status) => {
      setConnectionState(status);
      setChannels(realtimeEngine.getActiveChannels());
    });

    // Listen to event stream
    const unsubEvents = realtimeEngine.subscribe((event) => {
      setEvents([...realtimeEngine.getEventHistory()]);
      setPingMs(event.latencyMs || 18);
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTestPing = () => {
    setIsPinging(true);
    const sent = realtimeEngine.sendTestPing();
    setSelectedEvent(sent);
    setTimeout(() => {
      setIsPinging(false);
      setEvents([...realtimeEngine.getEventHistory()]);
    }, 300);
  };

  const handleReconnect = () => {
    realtimeEngine.initRealtime();
    setEvents([...realtimeEngine.getEventHistory()]);
  };

  const handleClear = () => {
    setEvents([]);
    setSelectedEvent(null);
  };

  const wsUrl = config.endpoint.replace('https://', 'wss://').replace('http://', 'ws://') + '/realtime';

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-xs font-sans">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Appwrite Realtime Engine</h3>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold flex items-center gap-1 ${
                    connectionState === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : connectionState === 'connecting'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  {connectionState === 'connected' ? 'WebSocket Active' : connectionState.toUpperCase()}
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] font-mono mt-0.5">
                {wsUrl} · Latency ~{pingMs}ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReconnect}
              title="Reconnect Realtime WebSocket"
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subscribed Channels Banner */}
        <div className="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-neutral-400">
            <Layers className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="font-semibold text-neutral-300">Subscribed Appwrite Collections:</span>
            <div className="flex flex-wrap gap-1">
              {['rides', 'messages', 'ride_locations', 'captain_profiles', 'audit_logs'].map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-[10px] text-pink-300"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendTestPing}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer text-xs"
            >
              <Send className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Broadcasting...' : 'Send Test Ping'}</span>
            </button>
            <button
              onClick={handleClear}
              className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
              title="Clear event log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Split Event Stream Viewport */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 overflow-hidden">
          {/* Left: Stream List */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-800 text-[10px] uppercase font-semibold text-neutral-500 bg-neutral-950/40 flex justify-between items-center">
              <span>Realtime Inbound Packet Stream</span>
              <span>{events.length} captured</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {events.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 space-y-2">
                  <Activity className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">No realtime events captured yet.</p>
                  <p className="text-[10px]">
                    Click "Send Test Ping" or request a ride in the passenger portal to observe live events.
                  </p>
                </div>
              ) : (
                events.map((evt) => {
                  const isSelected = selectedEvent?.id === evt.id;
                  const isLocation = evt.event.includes('LOCATION');
                  return (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-800 border-white text-white shadow-md'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-[11px] truncate text-emerald-400">
                          {evt.event.split('.').pop() || evt.event}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-500">
                          {new Date(evt.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            fractionalSecondDigits: 3,
                          } as any)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span className="truncate max-w-[200px]">{evt.channel}</span>
                        <span className="text-neutral-500">{evt.latencyMs}ms</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Payload Inspector */}
          <div className="flex flex-col h-full overflow-hidden bg-neutral-950">
            <div className="px-4 py-2 border-b border-neutral-800 text-[10px] uppercase font-semibold text-neutral-500 bg-neutral-950/80 flex justify-between items-center">
              <span>Event Payload Inspector</span>
              {selectedEvent && (
                <span className="text-emerald-400 font-mono text-[10px]">
                  Source: {selectedEvent.source}
                </span>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {selectedEvent ? (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
                    <p className="text-neutral-400">
                      Channel: <span className="text-white">{selectedEvent.channel}</span>
                    </p>
                    <p className="text-neutral-400">
                      Event: <span className="text-pink-400 font-bold">{selectedEvent.event}</span>
                    </p>
                    <p className="text-neutral-400">
                      Packet ID: <span className="text-neutral-300">{selectedEvent.id}</span>
                    </p>
                    <p className="text-neutral-400">
                      Timestamp: <span className="text-neutral-300">{selectedEvent.timestamp}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-neutral-400 block mb-1 font-semibold uppercase text-[10px]">
                      Payload JSON
                    </span>
                    <pre className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-emerald-300 text-[10px] overflow-x-auto leading-relaxed">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 p-8 space-y-2">
                  <Database className="w-8 h-8 opacity-40" />
                  <p className="text-xs">Select any event on the left to inspect its real-time payload.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

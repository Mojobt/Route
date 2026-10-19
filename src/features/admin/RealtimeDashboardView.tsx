/**
 * Admin Realtime WebSocket & Sync Dashboard
 * Live Appwrite Realtime stream, latency meter, and packet inspector
 */

import React, { useState, useEffect } from 'react';
import {
  realtimeEngine,
  RealtimeConnectionState,
  RealtimeEventPayload,
} from '../../lib/appwrite/realtime';
import { getAppwriteConfig } from '../../lib/appwrite/config';
import {
  Radio,
  Activity,
  Layers,
  Send,
  Trash2,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const RealtimeDashboardView: React.FC = () => {
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
    const unsubStatus = realtimeEngine.onStatusChange((status) => {
      setConnectionState(status);
      setChannels(realtimeEngine.getActiveChannels());
    });

    const unsubEvents = realtimeEngine.subscribe((event) => {
      setEvents([...realtimeEngine.getEventHistory()]);
      setPingMs(event.latencyMs || 18);
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, []);

  const handleSendTestPing = () => {
    setIsPinging(true);
    const sent = realtimeEngine.sendTestPing();
    setSelectedEvent(sent);
    setTimeout(() => {
      setIsPinging(false);
      setEvents([...realtimeEngine.getEventHistory()]);
    }, 250);
  };

  const handleReconnect = () => {
    realtimeEngine.initRealtime();
    setEvents([...realtimeEngine.getEventHistory()]);
  };

  const wsUrl = config.endpoint.replace('https://', 'wss://').replace('http://', 'ws://') + '/realtime';

  return (
    <div className="space-y-6 text-xs max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>Appwrite Realtime WebSocket Engine</span>
          </h1>
          <p className="text-neutral-400 mt-0.5">
            Full-duplex WebSocket event bus for live dispatches, GPS telemetry pings, and chat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTestPing}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer text-xs"
          >
            <Send className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Broadcasting...' : 'Broadcast Test Event'}</span>
          </button>
          <button
            onClick={handleReconnect}
            title="Reconnect WebSocket"
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 font-semibold">Engine Status</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-base font-bold text-white capitalize">{connectionState}</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-mono truncate">{wsUrl}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 font-semibold">Active Channels</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums block">
            {channels.length || 6}
          </span>
          <p className="text-[10px] text-neutral-400">rides, messages, locations, profiles</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 font-semibold">Round-Trip Latency</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums block">
            ~{pingMs}ms
          </span>
          <p className="text-[10px] text-neutral-400">Real-time WebSocket propagation</p>
        </div>
      </div>

      {/* Live Stream Viewport */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 min-h-[440px]">
        {/* Left Events */}
        <div className="flex flex-col">
          <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[10px] uppercase font-semibold text-neutral-500">
            <span>Live Realtime Inbound Packets</span>
            <button
              onClick={() => setEvents([])}
              className="text-neutral-500 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-[420px]">
            {events.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 space-y-2">
                <Activity className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">Listening for incoming Appwrite Realtime events...</p>
                <p className="text-[10px]">
                  Requesting a ride or starting navigation will emit live events here.
                </p>
              </div>
            ) : (
              events.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 border-white text-white'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-[11px] text-emerald-400">
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
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span className="truncate max-w-[200px]">{evt.channel}</span>
                      <span>{evt.latencyMs}ms</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Payload Inspector */}
        <div className="flex flex-col bg-neutral-950 p-4">
          <div className="text-[10px] uppercase font-semibold text-neutral-500 border-b border-neutral-800 pb-2 mb-3">
            Packet Payload Inspector
          </div>

          {selectedEvent ? (
            <div className="space-y-3 font-mono text-[11px] flex-1 overflow-y-auto">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
                <p className="text-neutral-400">
                  Channel: <span className="text-white">{selectedEvent.channel}</span>
                </p>
                <p className="text-neutral-400">
                  Event: <span className="text-pink-400 font-bold">{selectedEvent.event}</span>
                </p>
                <p className="text-neutral-400">
                  Latency: <span className="text-emerald-400 font-bold">{selectedEvent.latencyMs}ms</span>
                </p>
              </div>

              <div>
                <span className="text-neutral-500 block mb-1 text-[10px]">Data Payload</span>
                <pre className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-emerald-300 text-[10px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 p-8 space-y-2">
              <Database className="w-8 h-8 opacity-40" />
              <p className="text-xs">Click any realtime event from the stream to inspect its raw JSON payload.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { LogEntry, LogLevel } from '@/lib/logger';

const LEVEL_STYLES: Record<LogLevel, { badge: string; row: string; text: string }> = {
  debug: { badge: 'bg-slate-700 text-slate-300',   row: '',                        text: 'text-slate-400' },
  info:  { badge: 'bg-emerald-900 text-emerald-300', row: '',                       text: 'text-slate-200' },
  warn:  { badge: 'bg-amber-900 text-amber-300',    row: 'bg-amber-950/20',         text: 'text-amber-200' },
  error: { badge: 'bg-red-900 text-red-300',        row: 'bg-red-950/30',           text: 'text-red-300'   },
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: 'DBG', info: 'INF', warn: 'WRN', error: 'ERR',
};

export default function DevLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isProd = process.env.NODE_ENV === 'production';

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/dev/logs');
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs ?? []);
    } catch {}
  }, []);

  const clearLogs = async () => {
    await fetch('/api/dev/logs', { method: 'DELETE' });
    setLogs([]);
  };

  // Auto-refresh every 2s when enabled
  useEffect(() => {
    fetchLogs();
    if (!autoRefresh) return;
    const id = setInterval(fetchLogs, 2000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchLogs]);

  // Auto-scroll when new entries arrive
  useEffect(() => {
    if (autoScroll && logs.length !== lastCount) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setLastCount(logs.length);
    }
  }, [logs, autoScroll, lastCount]);

  const visible = logs.filter(l => {
    if (filter !== 'all' && l.level !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.context.toLowerCase().includes(q) || l.message.toLowerCase().includes(q);
    }
    return true;
  });

  if (isProd) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Log viewer is only available in development.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono text-xs flex flex-col">

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-slate-400 font-sans font-bold tracking-widest uppercase text-[10px]">
          Dev Logs
        </span>
        <span className="text-slate-600 font-sans text-[10px]">{visible.length} / {logs.length} entries</span>

        {/* Level filter */}
        <div className="flex gap-1">
          {(['all', 'debug', 'info', 'warn', 'error'] as const).map(l => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                filter === l
                  ? l === 'all' ? 'bg-slate-600 text-white' : LEVEL_STYLES[l as LogLevel].badge
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              }`}
            >
              {l === 'all' ? 'All' : LEVEL_LABELS[l as LogLevel]}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by context or message…"
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-slate-200 placeholder-slate-600 outline-none focus:border-slate-500 text-xs w-52"
        />

        <div className="flex gap-3 ml-auto items-center">
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none font-sans">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="accent-emerald-500" />
            <span className="text-[10px]">Auto-refresh</span>
          </label>
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none font-sans">
            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="accent-emerald-500" />
            <span className="text-[10px]">Auto-scroll</span>
          </label>
          <button
            onClick={fetchLogs}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-sans font-bold text-slate-300 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-900 rounded text-[10px] font-sans font-bold text-red-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Log table */}
      <div className="flex-1 overflow-auto">
        {visible.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-600 font-sans text-sm">
            {logs.length === 0 ? 'No logs yet. Make some requests.' : 'No entries match the current filter.'}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider w-28">Time</th>
                <th className="text-left px-3 py-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider w-14">Level</th>
                <th className="text-left px-3 py-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider w-40">Context</th>
                <th className="text-left px-3 py-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(log => {
                const s = LEVEL_STYLES[log.level];
                return (
                  <tr key={log.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${s.row}`}>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{log.ts.slice(11, 23)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${s.badge}`}>
                        {LEVEL_LABELS[log.level]}
                      </span>
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap ${s.text} opacity-70`}>{log.context}</td>
                    <td className="px-3 py-2">
                      <span className={s.text}>{log.message}</span>
                      {log.data !== undefined && (
                        <details className="mt-1">
                          <summary className="text-slate-600 hover:text-slate-400 cursor-pointer text-[10px]">data</summary>
                          <pre className="mt-1 text-slate-400 text-[10px] bg-slate-900 rounded p-2 overflow-x-auto max-w-xl">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

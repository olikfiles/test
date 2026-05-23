export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  ts: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

// ─── In-memory circular buffer (dev only, single Node.js process) ─────────────
const MAX_ENTRIES = 300;
const buffer: LogEntry[] = [];
let seq = 0;

function push(entry: LogEntry) {
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.shift();
}

// ─── Console colours ──────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  debug:  '\x1b[36m',  // cyan
  info:   '\x1b[32m',  // green
  warn:   '\x1b[33m',  // yellow
  error:  '\x1b[31m',  // red
};

const LABEL: Record<LogLevel, string> = {
  debug: 'DBG',
  info:  'INF',
  warn:  'WRN',
  error: 'ERR',
};

function write(level: LogLevel, context: string, message: string, data?: unknown) {
  // In production only surface warnings and errors.
  if (process.env.NODE_ENV === 'production' && level === 'debug') return;

  const ts = new Date().toISOString();
  const entry: LogEntry = { id: ++seq, ts, level, context, message };
  if (data !== undefined) entry.data = data;

  // Store in buffer during development.
  if (process.env.NODE_ENV !== 'production') push(entry);

  // Pretty-print to the terminal.
  const color = C[level];
  const time = ts.slice(11, 23); // HH:mm:ss.mmm
  const prefix = `${C.dim}${time}${C.reset} ${color}${LABEL[level]}${C.reset} ${C.dim}[${context}]${C.reset}`;

  if (data !== undefined) {
    const serialised = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    console.log(`${prefix} ${message}\n${C.dim}${serialised}${C.reset}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const logger = {
  debug: (ctx: string, msg: string, data?: unknown) => write('debug', ctx, msg, data),
  info:  (ctx: string, msg: string, data?: unknown) => write('info',  ctx, msg, data),
  warn:  (ctx: string, msg: string, data?: unknown) => write('warn',  ctx, msg, data),
  error: (ctx: string, msg: string, data?: unknown) => write('error', ctx, msg, data),

  /** Returns a copy of the current in-memory buffer. Dev only. */
  getBuffer: (): LogEntry[] => [...buffer],

  /** Clears the in-memory buffer. Dev only. */
  clearBuffer: () => { buffer.length = 0; },
};

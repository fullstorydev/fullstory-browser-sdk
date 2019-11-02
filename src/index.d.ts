interface SnippetOptions {
  orgId: string,
  namespace?: string,
  debug?: boolean,
  host?: string,
  script?: string
}

export type BrowserApiArg = { [key: string]: any };
export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

// API functions that are available as soon as the snippet has executed.
export function consent(userConsents?: boolean): void;
export function disableConsole(): void;
export function enableConsole(): void;
export function event(eventName: string, eventProperties: BrowserApiArg): void;
export function identify(uid: string, customVars?: BrowserApiArg): void;
export function log(level: LogLevel, ...msg: any[]): void;
export function log(...msg: any[]): void;
export function restart(): void;
export function shutdown(): void;
export function setUserVars(customVars: BrowserApiArg): void;
export function init(options: SnippetOptions): void;

// API functions that are available after /rec/page returns.
export function getCurrentSession(): string | null;
export function getCurrentSessionURL(now?: boolean): string | null;

interface SnippetOptions {
  orgId: string,
  namespace?: string,
  debug?: boolean,
  host?: string,
  script?: string
}

interface UserVars {
  displayName?: string;
  email?: string;
  [key: string]: any;
}

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

// API functions that are available as soon as the snippet has executed.
export function anonymize(): void;
export function consent(userConsents?: boolean): void;
export function disableConsole(): void;
export function enableConsole(): void;
export function event(eventName: string, eventProperties: { [key: string]: any }): void;
export function identify(uid: string, customVars?: UserVars): void;
export function log(level: LogLevel, ...msg: any[]): void;
export function log(...msg: any[]): void;
export function restart(): void;
export function shutdown(): void;
export function setUserVars(customVars: UserVars): void;
export function init(options: SnippetOptions): void;

// API functions that are available after /rec/page returns.
export function getCurrentSessionURL(now?: boolean): string | null;

interface SnippetOptions {
  orgId: string;
  namespace?: string;
  debug?: boolean;
  host?: string;
  script?: string;
}

interface UserVars {
  displayName?: string;
  email?: string;
  [key: string]: any;
}

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

// API functions that are available as soon as the snippet has executed.
export function anonymize(): void;
export function consent(userConsents?: boolean): void;
export function event(eventName: string, eventProperties: { [key: string]: any }): void;
export function identify(uid: string, customVars?: UserVars): void;
export function init(options: SnippetOptions): void;
export function log(level: LogLevel, msg: string): void;
export function log(msg: string): void;
export function restart(): void;
export function setUserVars(customVars: UserVars): void;
export function shutdown(): void;

// API functions that are available after /rec/page returns.
// FullStory bootstrapping details: https://help.fullstory.com/hc/en-us/articles/360032975773
export function getCurrentSessionURL(now?: boolean): string | null;

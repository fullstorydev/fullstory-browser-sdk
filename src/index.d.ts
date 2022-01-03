/*
  FullStory Client SDK snippet options.
  - orgId: Reference for the organisation ID listed in Fullstory
  - namespace: ?
  - debug: Debug mode with exta logging
  - host: ?
  - script: FullStory script, you can host it by yourself (for example if you need proxy)
  - recordCrossDomainIFrames: ?
  - recordOnlyThisIFrame: Check README for details
  - devMode: In dev mode it won't record sessions.
*/
interface SnippetOptions {
  orgId: string;
  namespace?: string;
  debug?: boolean;
  host?: string;
  script?: string;
  recordCrossDomainIFrames?: boolean;
  recordOnlyThisIFrame?: boolean;
  devMode?: boolean;
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

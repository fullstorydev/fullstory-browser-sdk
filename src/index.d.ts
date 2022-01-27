/**
 * FullStory Client SDK snippet options.
 *
 * - orgId: Reference for your [Org Id](https://help.fullstory.com/hc/en-us/articles/360047075853) listed in FullStory.
 * - namespace: Global object name that contains the FullStory browser API methods and properties. Defaults to `FS`.
 * - debug: Debug mode with extra browser console logging.
 * - host: The recording server host domain. Can be set to direct recorded events to a proxy that you host. Defaults to `fullstory.com`.
 * - script: FullStory script host domain. FullStory hosts the `fs.js` recording script on a CDN, but you can choose to host a copy yourself. Defaults to `edge.fullstory.com`.
 * - recordCrossDomainIFrames: FullStory can record cross-domain iFrames. Defaults to `false`. Certain limitations apply and can be found [here](https://help.fullstory.com/hc/en-us/articles/360020622514-Can-FullStory-capture-content-that-is-presented-in-iframes-#h_01F1G333PYKPGZ4B42WDBV3YKV). 
 * - recordOnlyThisIFrame: FullStory can record the iFrame as its own unique session. Defaults to `false`. Additional conditions apply and can be found [here](https://help.fullstory.com/hc/en-us/articles/360020622514-Can-FullStory-capture-content-that-is-presented-in-iframes-#h_01F1G33B40Q2TPQA8MA7SF8Y5P).
 * - devMode: In dev mode FullStory won't record sessions. Any calls to SDK methods will `console.warn` that FullStory is in `devMode`. Defaults to `false`.
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

type VarScope = 'page';

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
export function setVars(varScope: VarScope, properties?: { [key: string]: any }): void;

// API functions that are available after /rec/page returns.
// FullStory bootstrapping details: https://help.fullstory.com/hc/en-us/articles/360032975773
export function getCurrentSessionURL(now?: boolean): string | null;

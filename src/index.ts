import { initFS, FSApi } from '@fullstory/snippet';

/**
 * FullStory Client SDK snippet options.
 *
 * - orgId: Reference for your [Org Id](https://help.fullstory.com/hc/en-us/articles/360047075853) listed in FullStory.
 * - namespace: Global object name that contains the FullStory browser API methods and properties. Defaults to `FS`.
 * - debug: Debug mode with extra browser console logging.
 * - host: The recording server host domain. Can be set to direct recorded events to a proxy that you host. Defaults to `fullstory.com`.
 * - script: FullStory script host domain. FullStory hosts the `fs.js` recording script on a CDN, but you can choose to host a copy yourself. Defaults to `edge.fullstory.com`.
 * - cookieDomain: Overrides the cookie domain. By default, cookies will be valid for all subdomains of your site; if you want to limit the cookies to a specific subdomain, you can set the domain value explicitly. More information can be found [here](https://help.fullstory.com/hc/en-us/articles/360020622874-Can-the-FullStory-cookie-be-associated-with-a-specific-subdomain-).
 * - recordCrossDomainIFrames: FullStory can record cross-domain iFrames. Defaults to `false`. Certain limitations apply and can be found [here](https://help.fullstory.com/hc/en-us/articles/360020622514-Can-FullStory-capture-content-that-is-presented-in-iframes-#h_01F1G333PYKPGZ4B42WDBV3YKV).
 * - recordOnlyThisIFrame: FullStory can record the iFrame as its own unique session. Defaults to `false`. Additional conditions apply and can be found [here](https://help.fullstory.com/hc/en-us/articles/360020622514-Can-FullStory-capture-content-that-is-presented-in-iframes-#h_01F1G33B40Q2TPQA8MA7SF8Y5P).
 * - devMode: In dev mode FullStory won't record sessions. Any calls to SDK methods will `console.warn` that FullStory is in `devMode`. Defaults to `false`.
 * - sessionUid (beta): Sets the session UID passed to the `FS('init', ...)` v2 operation.
 */
export interface SnippetOptions {
  orgId: string;
  appHost?: string;
  assetMapId?: string;
  cookieDomain?: string;
  debug?: boolean;
  devMode?: boolean;
  host?: string;
  namespace?: string;
  recordCrossDomainIFrames?: boolean;
  recordOnlyThisIFrame?: boolean;
  sessionUid?: string;
  script?: string;
  startCaptureManually?: boolean;
}

/**
 * A callback that will be invoked when FullStory has begun a session.
 *
 * `sessionUrl` contains the URL to the current session.
 * `settings`   contains the org settings for the current session.
 */
type ReadyCallback = (data: { sessionUrl: string, settings: Readonly<object> }) => void;

/** Env overrides passed to `FS('init', { env })` after the snippet loads. */
type FsInitEnv = {
  appHost?: string;
  assetMapId?: string;
  captureOnStartup?: boolean;
  cookieDomain?: string;
  isOuterScript?: boolean;
  runInIframe?: boolean;
  sessionUid?: string;
};

// Module-level state set during `_init` (replaces former window `_fs_*` globals).
let _namespace: string | undefined;
let _initialized = false;
let _isDevMode = false;

const getFullStory = (ns: string): FSApi | undefined => (
  (window as unknown as Record<string, FSApi | undefined>)[ns]
);

const ensureSnippetLoaded = (): FSApi => {
  const fs = _namespace ? getFullStory(_namespace) : undefined;
  if (!_namespace || !fs) {
    throw Error(
      'FullStory is not loaded, please ensure the init function is invoked before calling FullStory API functions'
    );
  }

  return fs;
};

const _init = (inputOptions: SnippetOptions, readyCallback?: ReadyCallback) => {
  // Make a copy so we can modify `options` if desired.
  const options = { ...inputOptions };
  const ns = options.namespace || 'FS';
  _namespace = ns;

  if (getFullStory(ns)) {
    console.warn('The FullStory snippet has already been defined elsewhere (likely in the <head> element)');
    return;
  }

  const fsInitEnv: FsInitEnv = {};

  // see README for details on the recordCrossDomainIFrames option
  if (options.recordCrossDomainIFrames) {
    fsInitEnv.runInIframe = true;
  }

  if (options.appHost) {
    fsInitEnv.appHost = options.appHost;
  }

  if (options.assetMapId) {
    fsInitEnv.assetMapId = options.assetMapId;
  }

  if (options.startCaptureManually) {
    fsInitEnv.captureOnStartup = false;
  }

  // record the contents of this iFrame when embedded in a parent site
  if (options.recordOnlyThisIFrame) {
    fsInitEnv.isOuterScript = true;
  }

  // Set cookie domain if it was specified.
  if (options.cookieDomain) {
    fsInitEnv.cookieDomain = options.cookieDomain;
  }

  if (options.sessionUid) {
    fsInitEnv.sessionUid = options.sessionUid;
  }

  if (options.debug === true) {
    if (!options.script) {
      options.script = 'edge.fullstory.com/s/fs-debug.js';
    } else {
      console.warn('Ignoring `debug = true` because `script` is set');
    }
  }

  initFS(options);

  const fs = getFullStory(_namespace);

  if (!fs) {
    console.warn('Failed to initialize FS snippet');
    return;
  }

  fs('init', { env: fsInitEnv });

  if (readyCallback) {
    fs('observe', { type: 'start', callback: readyCallback });
  }

  if (options.devMode === true) {
    const message = 'FullStory was initialized in devMode and will stop recording';
    fs('trackEvent', {
      name: 'FullStory Dev Mode',
      properties: {
        message,
      }
    });
    fs('shutdown');
    _isDevMode = true;
    console.warn(message);
  }
};

const initOnce = (message) => (inputOptions: SnippetOptions, readyCallback?: ReadyCallback) => {
  if (_initialized) {
    if (message) console.warn(message);
    return;
  }
  _init(inputOptions, readyCallback);
  _initialized = true;
};

const init = initOnce('FullStory init has already been called once, additional invocations are ignored');

const isInitialized = () => _initialized;

const hasFullStoryWithFunction = (...testNames:string[]) => {
  const fs = ensureSnippetLoaded();
  return testNames.every((current) => fs[current]);
};

const guard = (name) => (...args) => {
  if (_isDevMode) {
    const message = `FullStory is in dev mode and is not capturing: ${name} method not executed`;
    console.warn(message);
    return message;
  }

  const fs = _namespace ? getFullStory(_namespace) : undefined;
  if (hasFullStoryWithFunction(name) && fs) {
    return fs[name](...args);
  }
  console.warn(`FS.${name} not ready`);
  return null;
};

const buildFullStoryShim = (): FSApi => {
  const FS = (operation, options, source) => {
    const fs = ensureSnippetLoaded();

    if (_isDevMode) {
      const message = `FullStory is in dev mode and is not capturing: ${operation} not executed`;
      console.warn(message);
      return undefined;
    }

    return fs(operation, options, source);
  };
  FS.anonymize = guard('anonymize');
  FS.consent = guard('consent');
  FS.disableConsole = guard('disableConsole');
  FS.enableConsole = guard('enableConsole');
  FS.event = guard('event');
  FS.getCurrentSessionURL = guard('getCurrentSessionURL');
  FS.identify = guard('identify');
  FS.log = guard('log');
  FS.restart = guard('restart');
  FS.setUserVars = guard('setUserVars');
  FS.setVars = guard('setVars');
  FS.shutdown = guard('shutdown');

  return FS as FSApi;
};

const FullStory: FSApi = buildFullStoryShim();

export { FullStory, init, isInitialized };

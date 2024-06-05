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

declare global {
  interface Window {
    _fs_app_host?: string;
    _fs_asset_map_id?: string;
    _fs_capture_on_startup?: boolean;
    _fs_cookie_domain?: string;
    _fs_debug?: boolean;
    _fs_dev_mode?: boolean;
    _fs_host?: string;
    _fs_initialized?: boolean;
    _fs_is_outer_script?: boolean;
    _fs_namespace?: string;
    _fs_org?: string;
    _fs_run_in_iframe?: boolean;
    _fs_script?: string;
  }
}

const getFullStory = (): FSApi | undefined => {
  if (window._fs_namespace) {
    return window[window._fs_namespace];
  }
  return undefined;
};

const ensureSnippetLoaded = (): FSApi => {
  const fs = getFullStory();
  if (!fs) {
    throw Error(
      'FullStory is not loaded, please ensure the init function is invoked before calling FullStory API functions'
    );
  }

  return fs;
};

const _init = (inputOptions: SnippetOptions, readyCallback?: ReadyCallback) => {
  // Make a copy so we can modify `options` if desired.
  const options = { ...inputOptions };
  if (getFullStory()) {
    console.warn('The FullStory snippet has already been defined elsewhere (likely in the <head> element)');
    return;
  }

  // see README for details on the recordCrossDomainIFrames option
  if (options.recordCrossDomainIFrames) {
    window._fs_run_in_iframe = true;
  }

  if (options.appHost) {
    window._fs_app_host = options.appHost;
  }

  if (options.assetMapId) {
    window._fs_asset_map_id = options.assetMapId;
  }

  if (options.startCaptureManually) {
    window._fs_capture_on_startup = false;
  }

  // record the contents of this iFrame when embedded in a parent site
  if (options.recordOnlyThisIFrame) {
    window._fs_is_outer_script = true;
  }

  // Set cookie domain if it was specified.
  if (options.cookieDomain) {
    window._fs_cookie_domain = options.cookieDomain;
  }

  if (options.debug === true) {
    if (!options.script) {
      options.script = 'edge.fullstory.com/s/fs-debug.js';
    } else {
      console.warn('Ignoring `debug = true` because `script` is set');
    }
  }

  initFS(options);

  const fs = getFullStory();

  if (!fs) {
    console.warn('Failed to initialize FS snippet');
    return;
  }

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
    window._fs_dev_mode = true;
    console.warn(message);
  }
};

const initOnce = (message) => (inputOptions: SnippetOptions, readyCallback?: ReadyCallback) => {
  if (window._fs_initialized) {
    if (message) console.warn(message);
    return;
  }
  _init(inputOptions, readyCallback);
  window._fs_initialized = true;
};

export const init = initOnce('FullStory init has already been called once, additional invocations are ignored');

// normalize undefined into boolean
export const isInitialized = () => !!window._fs_initialized;

const hasFullStoryWithFunction = (...testNames) => {
  const fs = ensureSnippetLoaded();
  return testNames.every((current) => fs[current]);
};

const guard = (name) => (...args) => {
  if (window._fs_dev_mode) {
    const message = `FullStory is in dev mode and is not capturing: ${name} method not executed`;
    console.warn(message);
    return message;
  }

  const fs = getFullStory();
  if (hasFullStoryWithFunction(name) && fs) {
    return fs[name](...args);
  }
  console.warn(`FS.${name} not ready`);
  return null;
};

const buildFullStoryShim = (): FSApi => {
  const FS = (operation, options, source) => {
    const fs = ensureSnippetLoaded();

    if (window._fs_dev_mode) {
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

  return FS;
};

export const FullStory: FSApi = buildFullStoryShim();

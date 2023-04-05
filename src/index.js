import { initFS } from '@fullstory/snippet';

const getFullStory = () => window[window._fs_namespace];

const ensureSnippetLoaded = () => {
  const fs = getFullStory();
  if (!fs) {
    throw Error('FullStory is not loaded, please ensure the init function is invoked before calling FullStory API functions');
  }

  return fs;
};

const _init = (inputOptions, readyCallback) => {
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

  if (readyCallback) {
    fs('observe', { type: 'start', callback: readyCallback });
  }

  if (options.devMode === true) {
    const message = 'FullStory was initialized in devMode and will stop recording';
    fs('trackEvent', {
      name: 'FullStory Dev Mode',
      properties: {
        message_str: message,
      }
    });
    fs('shutdown');
    window._fs_dev_mode = true;
    console.warn(message);
  }
};

const initOnce = (fn, message) => (...args) => {
  if (window._fs_initialized) {
    if (message) console.warn(message);
    return;
  }
  fn(...args);
  window._fs_initialized = true;
};

export const init = initOnce(_init, 'FullStory init has already been called once, additional invocations are ignored');

// normalize undefined into boolean
export const isInitialized = () => !!window._fs_initialized;

const FullStory = (...args) => {
  const fs = ensureSnippetLoaded();

  if (window._fs_dev_mode) {
    const message = 'FullStory is in dev mode and is not recording: method not executed';
    console.warn(message);
    return message;
  }

  return fs(...args);
};

export default FullStory;

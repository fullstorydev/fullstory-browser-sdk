import snippet from './snippet';

const fs = () => window[window._fs_namespace];

const ensureSnippetLoaded = () => {
  const snippetLoaded = !!fs();
  if (!snippetLoaded) {
    throw Error('FullStory is not loaded, please ensure the init function is invoked before calling FullStory API functions');
  }
};

const hasFullStoryWithFunction = (...testNames) => {
  ensureSnippetLoaded();
  return testNames.every(current => fs()[current]);
};

const guard = name => (...args) => {
  if (window._fs_dev_mode) {
    const message = `FullStory is in dev mode and is not recording: ${name} method not executed`;
    console.warn(message); // eslint-disable-line no-console
    return message;
  }

  if (hasFullStoryWithFunction(name)) {
    return fs()[name](...args);
  }
  console.warn(`FS.${name} not ready`); // eslint-disable-line no-console
  return null;
};

export const event = guard('event');
export const log = guard('log');
export const getCurrentSessionURL = guard('getCurrentSessionURL');
export const identify = guard('identify');
export const setUserVars = guard('setUserVars');
export const consent = guard('consent');
export const shutdown = guard('shutdown');
export const restart = guard('restart');
export const anonymize = guard('anonymize');

const _init = (options) => {
  if (fs()) {
    // eslint-disable-next-line no-console
    console.warn('The FullStory snippet has already been defined elsewhere (likely in the <head> element)');
    return;
  }

  // inject FullStory into cross domain iFrames and record them
  if (options.recordCrossDomainIFrames) {
    window._fs_run_in_iframe = true;
  }

  // record the contents of this iFrame when embedded in a parent site
  if (options.recordOnlyThisIFrame) {
    window._fs_is_outer_script = true;
  }

  snippet(options);

  if (options.devMode === true) {
    const message = 'FullStory was initialized in devMode and will stop recording';
    event('FullStory Dev Mode', {
      message_str: message,
    });
    shutdown();
    window._fs_dev_mode = true;
    console.warn(message); // eslint-disable-line no-console
  }
};

const initOnce = (fn, message) => (...args) => {
  if (window._fs_initialized) {
    // eslint-disable-next-line no-console
    if (message) console.warn(message);
    return;
  }
  fn(...args);
  window._fs_initialized = true;
};

export const init = initOnce(_init, 'FullStory init has already been called once, additional invocations are ignored');

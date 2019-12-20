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

const wrapFunction = name => (...args) => {
  if (hasFullStoryWithFunction(name)) {
    return fs()[name](...args);
  }
  console.warn(`FS.${name} not ready`); // eslint-disable-line no-console
  return null;
};

const _init = (options) => {
  if (fs()) {
    // eslint-disable-next-line no-console
    console.warn('The FullStory snippet has already been defined elsewhere (likely in the <head> element)');
    return;
  }

  snippet(options);
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

export const event = wrapFunction('event');
export const log = wrapFunction('log');
export const getCurrentSessionURL = wrapFunction('getCurrentSessionURL');
export const identify = wrapFunction('identify');
export const setUserVars = wrapFunction('setUserVars');
export const consent = wrapFunction('consent');
export const shutdown = wrapFunction('shutdown');
export const restart = wrapFunction('restart');
export const anonymize = () => identify(false);
export const init = initOnce(_init, 'FullStory init has already been called once, additional invocations are ignored');

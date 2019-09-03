import snippet from './snippet';

const fs = () => window[window._fs_namespace];

const ensureSnippetLoaded = () => {
  const snippetLoaded = !!fs();
  if (!snippetLoaded) {
    throw Error('FullStory is not loaded, please ensure the FullStory snippet is executed before calling FullStory API functions');
  }
};

const hasFullStoryWithFunction = (...testNames) => {
  ensureSnippetLoaded();
  return testNames.every(current => fs()[current]);
};

const wrapFunction = name => (...params) => {
  if (hasFullStoryWithFunction(name)) {
    return fs()[name](...params);
  }
  console.warn(`FS.${name} not ready`); // eslint-disable-line no-console
  return null;
};

const wrappedFS = ['event', 'log', 'getCurrentSessionURL', 'identify', 'setUserVars', 'consent', 'shutdown', 'restart'].reduce((acc, current) => {
  acc[current] = wrapFunction(current);
  return acc;
}, {});

const init = (fsOrgId, fsNamespace = 'FS', fsDebug = false, fsHost = 'fullstory.com') => {
  if (fs()) {
    // eslint-disable-next-line no-console
    console.warn('The FullStory snippet has already been defined elsewhere (likely in the <head> element)');
    return;
  }

  snippet({
    fsOrgId,
    fsNamespace,
    fsDebug,
    fsHost
  });
};

const once = (fn, message) => {
  let called = false;

  return (...args) => {
    if (called) {
      // eslint-disable-next-line no-console
      if (message) console.warn(message);
      return;
    }
    fn(...args);
    called = true;
  };
};

wrappedFS.init = once(init, 'FullStory init has already been called once. Additional invocations are ignored');

export default wrappedFS;

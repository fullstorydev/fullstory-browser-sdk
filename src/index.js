const fs = () => window[window._fs_namespace];
let didInint = false;

const ensureSnippetLoaded = () => {
  const snippetLoaded = !!fs();
  if (!snippetLoaded) {
    throw Error('FullStory is not loaded, please ensure the FullStory snippet is executed before calling FullStory API functions');
  }
  return true;
};

const hasFullStoryWithFunction = (...testNames) => {
  const functionsCreated = () => testNames.reduce((acc, current) => acc && fs()[current], true);
  return ensureSnippetLoaded() && functionsCreated();
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

const { event } = wrappedFS;
const { log } = wrappedFS;
const { getCurrentSessionURL } = wrappedFS;
const { identify } = wrappedFS;
const { setUserVars } = wrappedFS;
const { consent } = wrappedFS;
const { shutdown } = wrappedFS;
const { restart } = wrappedFS;

const init = (fsOrgId, fsNamespace = 'FS', fsDebug = false, fsHost = 'fullstory.com') => {
  if (didInint) {
    // eslint-disable-next-line no-console
    console.warn('FullStory init has already been called once. Additional invocations are ignored');
    return;
  }
  if (fs()) {
    // eslint-disable-next-line no-console
    console.warn('The FullStory snippet has already been defined elsewhere (likely in the <head> element)');
    return;
  }

  /* begin FullStory snippet */
  /* eslint-disable */
  window._fs_debug = fsDebug;
  window._fs_host = fsHost;
  window._fs_org = fsOrgId;
  window._fs_namespace = fsNamespace;
  (function(m,n,e,t,l,o,g,y){
    if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
    g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
    o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+m._fs_host+'/s/fs.js';
    y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
    g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
    g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
    g.log = function(a,b) { g("log", [a,b]) };
    g.consent=function(a){g("consent",!arguments.length||a)};
    g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
    g.clearUserCookie=function(){};
  })(window,document,window['_fs_namespace'],'script','user');
  /* eslint-enable */
  /* end FullStory snippet */
  didInint = true;
};

export {
  event,
  log,
  getCurrentSessionURL,
  identify,
  setUserVars,
  consent,
  shutdown,
  restart,
  init,
};

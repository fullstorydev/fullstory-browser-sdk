import { assert, expect } from 'chai';
import * as FullStory from '../src';

const testOrg = '123';

const snippetFunctions = ['anonymize',
  'event',
  'log',
  'getCurrentSessionURL',
  'identify',
  'setUserVars',
  'consent',
  'shutdown',
  'restart'];

beforeEach(() => {
  if (window[window._fs_namespace]) {
    delete window._fs_initialized;
    delete window._fs_dev_mode;
    delete window[window._fs_namespace];
    delete window._fs_namespace;
  }
});

describe('core', () => {
  it('should define browser API functions', () => {
    const functions = ['init',
      ...snippetFunctions
    ];

    functions.forEach(i => assert(typeof FullStory[i] === 'function', `${i} has not been exported from the FullStory module`));
  });
});

describe('init', () => {
  it('should throw error if not initialized with an orgId', () => {
    expect(() => { FullStory.init(); }).to.throw();
  });

  it('should throw error if API called before init', () => {
    expect(() => { FullStory.log(); }).to.throw();
    FullStory.init({ orgId: testOrg });
    expect(() => { FullStory.log(); }).to.not.throw();
  });

  it('should add _fs_org value to window object', () => {
    FullStory.init({ orgId: testOrg });
    expect(window._fs_org).to.equal(testOrg);
  });

  it('should add _fs_run_in_iframe value to window object', () => {
    FullStory.init({
      orgId: testOrg,
      recordCrossDomainIFrames: true,
    });
    expect(window._fs_run_in_iframe).to.equal(true);
  });

  it('should add _fs_is_outer_script value to window object', () => {
    FullStory.init({
      orgId: testOrg,
      recordOnlyThisIFrame: true,
    });
    expect(window._fs_is_outer_script).to.equal(true);
  });

  it('should add _fs_dev_mode value to window when initialzed with devMode', () => {
    FullStory.init({
      orgId: testOrg,
      devMode: true,
    });

    expect(window._fs_dev_mode).to.equal(true);
  });
});

describe('devMode', () => {
  it('should return the same message for all functions invoked when in devMode', () => {
    FullStory.init({
      orgId: testOrg,
      devMode: true,
    });

    const returnValues = snippetFunctions.map(f => FullStory[f]());

    expect(returnValues.every(v => v === returnValues[0])).to.equal(true);
  });
});

describe('getCurrentSessionURL', () => {
  it('should return null before fs.js is fully bootstrapped', () => {
    FullStory.init({ orgId: testOrg });
    // in theory, this is a race condition - assuming that fs.js
    // can't load by the time the following statement is executed
    const url = FullStory.getCurrentSessionURL();
    assert.equal(url, null, 'FullStory.getCurrentSessionURL() should return null if executed before fs.js is fully bootstrapped');
  });
});

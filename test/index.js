import { assert, expect } from 'chai';
import * as FullStory from '../src';

const testOrg = '123';

describe('core', () => {
  it('should define snippet functions', () => {
    const functions = ['event',
      'log',
      'getCurrentSessionURL',
      'identify',
      'setUserVars',
      'consent',
      'shutdown',
      'restart'];

    functions.forEach(i => assert(typeof FullStory[i] === 'function', `${i} has not been exported from the FullStory module`));
  });

  it('should throw error if called before init', () => {
    expect(() => { FullStory.log(); }).to.throw();
    FullStory.init(testOrg);
    expect(() => { FullStory.log(); }).to.not.throw();
  });
});

describe('init', () => {
  it('should add _fs_org value to window object', () => {
    FullStory.init(testOrg);
    expect(window._fs_org).to.equal(testOrg);
  });
});

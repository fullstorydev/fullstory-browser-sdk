import { DEFAULT_HOST, DEFAULT_SCRIPT, orgLocale, regionalize } from './hosts';

describe('orgLocale', () => {
  it('should return the region suffix of a regional orgId', () => {
    expect(orgLocale('o-7Y9H-eu1')).toBe('eu1');
    expect(orgLocale('o-1A2B3C-ap1')).toBe('ap1');
  });

  it('should return undefined for na1, which needs no region label', () => {
    expect(orgLocale('o-7Y9H-na1')).toBeUndefined();
  });

  it('should return undefined for orgIds with no region', () => {
    expect(orgLocale('123')).toBeUndefined();
    expect(orgLocale('o-7Y9H')).toBeUndefined();
    expect(orgLocale('')).toBeUndefined();
    expect(orgLocale(undefined)).toBeUndefined();
  });

  it('should ignore legacy orgIds that merely contain hyphens', () => {
    // A real type prefix is a single character (o, u, p); anything longer is a legacy id.
    expect(orgLocale('ACME-Widgets-Inc')).toBeUndefined();
  });
});

describe('regionalize', () => {
  it('should insert the region before the registrable domain', () => {
    expect(regionalize(DEFAULT_HOST, 'eu1')).toBe('eu1.fullstory.com');
    expect(regionalize(DEFAULT_SCRIPT, 'eu1')).toBe('edge.eu1.fullstory.com/s/fs.js');
  });

  it('should preserve the path of a script URL', () => {
    expect(regionalize('edge.fullstory.com/s/fs-debug.js', 'eu1'))
      .toBe('edge.eu1.fullstory.com/s/fs-debug.js');
  });

  it('should regionalize the www and app subdomains', () => {
    expect(regionalize('www.fullstory.com', 'eu1')).toBe('www.eu1.fullstory.com');
    expect(regionalize('app.fullstory.com', 'eu1')).toBe('app.eu1.fullstory.com');
  });

  it('should be idempotent for hosts already carrying the region', () => {
    expect(regionalize('eu1.fullstory.com', 'eu1')).toBe('eu1.fullstory.com');
    expect(regionalize('edge.eu1.fullstory.com/s/fs.js', 'eu1'))
      .toBe('edge.eu1.fullstory.com/s/fs.js');
  });

  it('should replace a mismatched region rather than stacking another one on top', () => {
    expect(regionalize('edge.na1.fullstory.com/s/fs.js', 'eu1'))
      .toBe('edge.eu1.fullstory.com/s/fs.js');
  });

  it('should regionalize non-com Fullstory domains', () => {
    expect(regionalize('fullstory.test:8043', 'eu1')).toBe('eu1.fullstory.test:8043');
    expect(regionalize('onfire.fyi', 'eu1')).toBe('eu1.onfire.fyi');
  });

  it('should leave hosts Fullstory does not own untouched', () => {
    expect(regionalize('fs.acme.com', 'eu1')).toBe('fs.acme.com');
    expect(regionalize('localhost:8080', 'eu1')).toBe('localhost:8080');
    // Anchored, so a proxy path that happens to mention fullstory.com is not a match.
    expect(regionalize('cdn.acme.com/fullstory.com/fs.js', 'eu1'))
      .toBe('cdn.acme.com/fullstory.com/fs.js');
  });

  it('should return the value unchanged when there is no region', () => {
    expect(regionalize(DEFAULT_SCRIPT, undefined)).toBe(DEFAULT_SCRIPT);
    expect(regionalize(DEFAULT_SCRIPT, '')).toBe(DEFAULT_SCRIPT);
  });
});

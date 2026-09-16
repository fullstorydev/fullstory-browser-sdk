/**
 * Region resolution for the Fullstory host/script options.
 *
 * `fs.js` derives an org's region by parsing the locale suffix off its orgId (see
 * `orgLocale()` / `fullstoryHost()` in the monorepo's `packages/recording/src/fsglobals.ts`),
 * but that only runs once `fs.js` has already loaded — far too late to fix the URL that
 * fetched it. So the same resolution has to happen here, before the snippet injects its
 * `<script>` tag, or an EU org that sets nothing but `orgId` fetches `fs.js` and its
 * settings from the na1 edge, which does not serve that org (VAL-10545).
 */

/**
 * The `host` / `script` defaults applied by `@fullstory/snippet`. Duplicated here because
 * the package does not export them, and we need the default value in hand to regionalize
 * it. Keep in sync with the defaults in that package's `initFS` / `executeSnippet` when
 * upgrading the dependency.
 */
export const DEFAULT_HOST = 'fullstory.com';
export const DEFAULT_SCRIPT = 'edge.fullstory.com/s/fs.js';

/**
 * Matches any domain with TLD+1 "fullstory.*" or "onfire.*", e.g. "www.fullstory.com",
 * "fullstory.test:8043", "onfire.fyi". Copied verbatim from `fsDomain` in the monorepo's
 * `packages/shared/src/hosts.ts` so this stays a literal mirror of the check `fs.js` uses.
 * Anchored at the start, so a customer proxy such as "cdn.acme.com/fullstory.com/x" does
 * not match.
 */
const FS_DOMAIN = /^([^.]+\.)*(fullstory|onfire).[^.]+(\/|$)/;

/** Region labels look like "eu1", "ap1", "na1". */
const REGION_LABEL = /^[a-z]{2,3}[0-9]+$/;

/**
 * Parses the region/locale suffix out of an orgId, e.g. "o-7Y9H-eu1" -> "eu1". Returns
 * `undefined` for na1 and for orgIds that carry no region, meaning "apply no region".
 * Mirrors `orgLocale()` in the monorepo's `packages/recording/src/fsglobals.ts`.
 */
export const orgLocale = (orgId?: string): string | undefined => {
  const sections = orgId ? orgId.split('-') : [];
  if (sections.length < 3) {
    return undefined;
  }

  const prefix = sections[0];
  const realm = sections[sections.length - 1];

  // A standard type prefix has only one character in it (o, u, p, etc.). If there is more
  // than one character then we most likely have a legacy org ID that happens to contain
  // hyphens, not a region suffix.
  if (realm === 'na1' || prefix.length > 1) {
    return undefined;
  }

  return realm;
};

/**
 * Applies an org's region to a Fullstory-owned host, inserting the locale as the label
 * immediately before the registrable domain and preserving any path:
 *
 *   ("fullstory.com", "eu1")               -> "eu1.fullstory.com"
 *   ("edge.fullstory.com/s/fs.js", "eu1")  -> "edge.eu1.fullstory.com/s/fs.js"
 *
 * Hosts Fullstory does not own — self-hosted proxies, Relay, localhost — are returned
 * untouched, as are hosts already carrying the right region (so this is idempotent and
 * safe to stack with the same resolution in `fs.js`).
 */
export const regionalize = (value: string, locale?: string): string => {
  if (!locale || !FS_DOMAIN.test(value)) {
    return value;
  }

  // Only the host is rewritten; anything from the first "/" on is left alone.
  const pathIndex = value.indexOf('/');
  const host = pathIndex === -1 ? value : value.slice(0, pathIndex);
  const path = pathIndex === -1 ? '' : value.slice(pathIndex);

  const labels = host.split('.');
  // FS_DOMAIN guarantees at least "<fullstory|onfire>.<tld>", so this is never negative.
  const insertAt = labels.length - 2;
  const existing = insertAt > 0 ? labels[insertAt - 1] : undefined;

  if (existing === locale) {
    return value;
  }

  if (existing !== undefined && REGION_LABEL.test(existing)) {
    // A different region is already present (e.g. "edge.na1.fullstory.com" on an eu1 org).
    // Replace it rather than insert, which would yield "edge.eu1.na1.fullstory.com".
    labels[insertAt - 1] = locale;
  } else {
    labels.splice(insertAt, 0, locale);
  }

  return labels.join('.') + path;
};

# Changelog

## 2.1.2
- Prefer the `Fullstory` named export to match the product spelling. The previous `FullStory` export remains as a legacy alias of the same object.

## 2.1.1
- Resolve the data center region from `orgId` when defaulting `host`, `script` and `appHost`, so an org outside `na1` (e.g. `o-ABC123-eu1`) loads `fs.js` and its settings from its own region's edge instead of the `na1` edge. Region-specific values are also applied to explicitly-set Fullstory-owned hosts; self-hosted proxy and Relay hosts are left untouched.

## 2.1.0
- Official release using snippet 2.1. Changes are largely under the hood. Uses the 2.1 version of the Fullstory snippet.

## 2.1.0-beta.0
-  Beta release using snippet 2.1. Changes are largely under the hood. Uses the 2.1 version of the Fullstory snippet.

## 2.0.8
- Add sessionUid option to init for session UID passthrough

## 2.0.7
- ~~Add sessionUid option to init for session UID passthrough~~
- Accidental breaking change 🙈

## 2.0.6
- Adds additional types for "observe" callbacks

## 2.0.5
- V2 dev mode should preserve method name in logs

## 2.0.4
- Copy updates following the Fullstory rebrand

## 2.0.3
- Eliminates some dead code from the build.

## 2.0.2
- Fixes some typescript issues with the optional source parameter for v1 API

## 2.0.1
- Fixes some typescript discrepancies discovered in issue #187

## 2.0.0
- Official release of the Fullstory browser API v2
- Add an `appHost` option to the `init` function to support setting `_fs_app_host`

## 2.0.0-beta.4
- Updates README to 2.x.x

## 2.0.0-beta.3
- Official Browser API v2 beta release: https://developer.fullstory.com/browser/getting-started/
- Add a `startCaptureManually` option to the `init` function to support setting ` _fs_capture_on_startup`: https://developer.fullstory.com/browser/auto-capture/capture-data/#manually-delay-data-capture
- Add an `assetMapId` option to the `init` function to support setting `_fs_asset_map_id`.

## 2.0.0-beta.0

- Convert to TypeScript
- Change default export to named export `FullStory`
- Update `@fullstory/snippet` dependency to use version `2.0.0-beta.2`
- Implement the v2 beta Browser API: https://developer.fullstory.com/browser/getting-started/

## 1.7.1

- Changed Fullstory Snippet to import from @fullstory/snippet
- Npm audit updates

## 1.7.0

- Add a `cookieDomain` option to the `init` function to support setting `_fs_cookie_domain`.

## 1.6.2

- Load `fs-debug.js` capture script when `debug = true` option is used to match [updated debug logging practices](https://help.fullstory.com/hc/en-us/articles/360020829233-What-is-fs-debug-).

## 1.6.1

- Fix a TypeScript type issue with the `readyCallback` API (#144)
- Add a RELEASING doc (#143)
## 1.6.0

- Add a `readyCallback` parameter to the `init` function (#140)
- Add an `isInitialized` API (#130)
- Automated dependency updates

## 1.5.1

- Updating README to include `host` and `script` configuration options

## 1.5.0

- Adding the `setVars` API function

## 1.4.10

- Adding docs to the types file (index.d.ts)

## 1.4.8

- Updating README to better describe the behavior of the `recordCrossDomainIFrames` option

## 1.4.7
-  Updating README to include vue 3
- `npm audit fix` to clean up npm audit warnings

## 1.4.6

- Updating snippet.js to include the latest snippet version

## 1.4.5

- `npm audit fix` to clean up npm audit warnings

## 1.4.4

- Adding a Vue.js initialization example to the readme

## 1.4.3

- Updating README to include a link to instructions on how to find the Fullstory Org Id

## 1.4.2

- Nothing to see here - bumping the version to fix a faulty CircleCI build

## 1.4.1

- Updated Angular sample to demo `devMode` configuration option

## 1.4.0

- Adding `devMode` configuration option

## 1.3.1

- Reformatting init() options doc in the README

## 1.3.0

* Added init() options that control IFrame recording
* Updated README to include option descriptions and usage
* Updated README with Angular example

## 1.2.3

* Incorporate FS.anonymize method now included in the core snippet
* Update minimist version for package dev package dependancies to fix npm audit alert

## 1.2.2

Update npm package dependancies on the acorn package to get a clean npm audit

## 1.2.1

Automatic snippet update from Fullstory

## 1.2.0

Supporting CommonJS builds

## 1.1.0

Snippet updates for improving XHR and Fetch API recording fidelity

## 1.0.0

Initial Release

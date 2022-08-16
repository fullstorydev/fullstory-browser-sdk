# Changelog

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

- Updating README to include a link to instructions on how to find the FullStory Org Id

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

Automatic snippet update from FullStory

## 1.2.0

Supporting CommonJS builds

## 1.1.0

Snippet updates for improving XHR and Fetch API recording fidelity

## 1.0.0

Initial Release

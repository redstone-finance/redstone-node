# How to add a new source

We will use words `source` and `fetcher`. It's kind of the same thing.

## Select a name for the new source
First, you should select a name for your source.
It should use kebab case, for example: `source`, `good-source`, `the-best-source`.
Source name must be unique, because it will unambiguously identify your source.

## Implementation
### Imlpement source (fetcher)
Create a folder with a name of your fetcher in [src/fetchers](../src/fetchers).
Place the code of your fetcher inside of this folder and update [src/fetchers/index.ts](../src/fetchers/index.ts) file. For more information check out [BaseFetcher code](src/fetchers/BaseFetcher.ts) and implementation of other fetchers, like [pangolin](../src/fetchers/pangolin), [coinbase](../src/fetchers/coinbase), or [ecb](../src/fetchers/ecb).

### Implement tests
We strongly recommend to implement tests for your fetcher. It's generaly a good practice and it will help you to avoid silly bugs in your fetcher. You can find examples of other fetchers tests in the [test/fetchers](../test/fetchers) folder.

## Manifest(s)
- Create a manifest with the name of the newly added source and place it in `manifests` folder
- [Optional] If the source should be used in the main redstone provider, run `node tools/manifest/generate-main-manifest.js`

## Sources config
### Should I do this
Sources config file is used in web app. If you want your source to be visible there you should add it to config and update the app appropriately.

### How to add a source to config
- Add source details to the `tools/config/predefined-configs/sources.json` file
- Run `yarn build`. It is required by `generate-sources-config.js` so it can work correctly
- Run `node tools/config/generate-sources-config.js` to generate sources config. It will be saved to `src/config/sources.json`
- Download logo for the newly created source
  - You can simply download it in browser and save as `<SOURCE_NAME>.<IMG_EXTENSTION>`
  - Or you can run `node tools/cdn-images/download-source-logos.js`, but it will download logos for all sources
- Upload the source logo to RedStone CDN (manually through AWS S3 web interface)
- Run `node tools/cdn-images/update-sources-config.js` to replace logo urls in sources config with redstone CDN urls
- Update `redstone-node` dependency in redstone-app for being able to use the new source config file

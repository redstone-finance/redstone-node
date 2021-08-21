# redstone-node

## Run node locally
```bash
yarn start:dev --config <PATH_TO_CONFIG>
```

## Adding a new source
### Implementation
- Imlpement source (fetcher)
- Implement tests for the source

### Manifest(s)
- Create a manifest with the name of the newly added source and place it in `manifests` folder
- [Optional] If the soruce should be used in the main redstone provider, run `node tools/manifest/generate-manifest-with-all-supported-tokens.js`

### Sources config
- Add source details to the `tools/config/predefined-configs/sources.json` file
- Run `yarn build`. It is required by `generate-sources-config.js` so it can work correctly
- Run `/tools/config/generate-sources-config.js` to generate sources config. It will be saved to `src/config/sources.json`
- Download logo for the newly created source
  - You can simply download it in browser and save as `<SOURCE_NAME>.<IMG_EXTENSTION>`
  - Or you can run `node tools/cdn-images/download-source-logos.js`, but it will download logos for all sources
- Upload the source logo to RedStone CDN (manually through AWS S3 web interface)
- Run `node cdn-images/update-sources-config.js` to replace logo urls in sources config with redstone CDN urls
- Update `redstone-node` dependency in redstone-app for being able to use the new source config file

## Adding a new token to config
If a token is not included in currecnt `src/config/tokens.json` file, you can add it in the following way:
- Add token details to `tools/config/predefined-configs/tokens.json`
- Run `node tools/config/add-new-tokens-from-predefined-config.js`
- Upload the token logo to RedStone CDN, so it is publicly accessible at `https://cdn.redstone.finance/symbols/<TOKEN_NAME_LOWER_CASE>.<IMG_EXTENSION></IMG_EXTENSION>`
- Run `node cdn-images/update-tokens-config.js` to replace logo urls in tokens config with redstone CDN urls
- Update `redstone-node` dependency in `redstone-api`, `redstone-app` and other packages where `tokens.json` is used.

## Adding a new provider
- TODO: add instruction

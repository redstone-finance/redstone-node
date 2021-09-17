# How to add a new token

## Should I do this
Tokens config file, which is located in `src/config/tokens.json`, is used in RedStone web app and `redstone-api`. If you want your token to be accessible through `redstone-api` npm module you should add it to config.

## How to add a token
If a token is not included in current `src/config/tokens.json` file, you can add it in the following way:
- Add token details to `tools/config/predefined-configs/tokens.json`
- Run `node tools/config/add-new-tokens-from-predefined-config.js`
- Upload the token logo to RedStone CDN, so it is publicly accessible at `https://cdn.redstone.finance/symbols/<TOKEN_NAME_LOWER_CASE>.<IMG_EXTENSION></IMG_EXTENSION>`
- Run `node tools/cdn-images/update-tokens-config.js` to replace logo urls in tokens config with redstone CDN urls
- Update `redstone-node` dependency in `redstone-api`, `redstone-app` and other packages where `tokens.json` is used.

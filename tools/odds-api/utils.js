const axios = require("axios");
const _ = require("lodash");
const calculateAssetHash = require("../../src/fetchers/odds-api/calculate-asset-hash");

const API_KEY = require("../../.secrets/config-redstone-sport.json").credentials.theOddsApiKey;

const SPORT_KEY = "mma_mixed_martial_arts";
const URL = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds/?regions=us&apiKey=${API_KEY}`;

async function generateAssets() {
  const response = await axios.get(URL);
  const assets = {};

  for (const event of response.data) {
    const asset = _.pick(event, ["commence_time", "home_team", "away_team"]);
    const assetHomeOutcome = {...asset, outcome: asset["home_team"]};
    const assetAwayOutcome = {...asset, outcome: asset["away_team"]};
    assets[calculateAssetHash(assetHomeOutcome)] = assetHomeOutcome;
    assets[calculateAssetHash(assetAwayOutcome)] = assetAwayOutcome;
  }

  return assets;
}


module.exports = {
  generateAssets,
};

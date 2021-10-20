import _ from "lodash";
import axios from "axios";
import { FetcherOpts, PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

const calculateAssethash = require("./calculate-asset-hash");

const SPORT_KEY = "mma_mixed_martial_arts";
const URL = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds/`;
const DEFAULT_REGIONS = "us";

export class OddsApiFetcher extends BaseFetcher {
  constructor() {
    super("odds-api");
  }

  async fetchData(tokens: string[], opts?: FetcherOpts): Promise<any> {
    return await axios.get(URL, {
      params: {
        regions: DEFAULT_REGIONS,
        apiKey: opts?.credentials.theOddsApiKey,
      },
    });
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const result: any = {}; // TODO: improve the type

    for (const event of response.data) {
      const pureEvent = _.pick(event, ["commence_time", "home_team", "away_team"]);
      const assetHome = calculateAssethash({...pureEvent, outcome: pureEvent["home_team"]});
      const assetAway = calculateAssethash({...pureEvent, outcome: pureEvent["away_team"]});

      console.log({assetAway, assetHome});

      // TODO: improve the value fetching (using not only the first bookmaker)
      if (event.bookmakers && event.bookmakers[0].markets && event.bookmakers[0].markets.length > 0) {
        result[assetHome] = event.bookmakers[0].markets[0].outcomes[0].price;
        result[assetAway] = event.bookmakers[0].markets[0].outcomes[1].price;
      }
    }

    return result;
  }
};

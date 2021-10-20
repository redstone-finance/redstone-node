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
    const result: PricesObj = {};

    for (const event of response.data) {
      const pureEvent = _.pick(event, ["commence_time", "home_team", "away_team"]);
      const teams = {
        home: pureEvent["home_team"],
        away: pureEvent["away_team"],
      };
      const assetHomeSymbol = calculateAssethash({...pureEvent, outcome: teams.home});
      const assetAwaySymbol = calculateAssethash({...pureEvent, outcome: teams.away});

      const values = {
        home: {
          total: 0,
          count: 0,
        },
        away: {
          total: 0,
          count: 0,
        }
      };

      for (const bookmaker of event.bookmakers) {
        for (const market of bookmaker.markets) {
          for (const outcome of market.outcomes) {
            if (outcome.name === teams.home) {
              values.home.total += outcome.price;
              values.home.count++;
            }
            if (outcome.name === teams.away) {
              values.away.total += outcome.price;
              values.away.count++;
            }
          }
        }
      }

      const getAvg = (key: "home" | "away") =>
        values[key].count > 0
          ? Number((values[key].total / values[key].count).toFixed(2))
          : 0;

      result[assetHomeSymbol] = getAvg("home");
      result[assetAwaySymbol] = getAvg("away");
    }

    return result;
  }
};

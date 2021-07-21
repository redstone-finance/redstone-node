import axios from "axios";
import { BaseFetcher } from "../BaseFetcher";
import { FetcherOpts, PricesObj } from "../../types";

const URL = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes";
const RAPID_API_HOST = "apidojo-yahoo-finance-v1.p.rapidapi.com";
const DEFAULT_REGION = "US";

export class ApiDojoRapidFetcher extends BaseFetcher {
  constructor() {
    super("api-dojo-rapid");
  }

  // API docs: https://rapidapi.com/apidojo/api/yahoo-finance1/
  async fetchData(tokens: string[], opts?: FetcherOpts): Promise<any> {
    return await axios.get(URL, {
      params: {
        region: DEFAULT_REGION,
        symbols: tokens.join(","),
      },
      headers: {
        "x-rapidapi-key": opts!.credentials!.yahooFinanceRapidApiKey!,
        "x-rapidapi-host": RAPID_API_HOST,
      },
    });
  }

  extractPrices(response: any): PricesObj {
    const pricesObj: { [symbol: string]: number } = {};
    const quotes = response.data.quoteResponse.result;
    for (const quote of quotes) {
      pricesObj[quote.symbol] = quote.regularMarketPrice;
    }
    return pricesObj;
  }
};

export default new ApiDojoRapidFetcher();

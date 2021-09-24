import axios from "axios";
import { BaseFetcher } from "../BaseFetcher";
import { FetcherOpts, PricesObj } from "../../types";

const RAPID_API_HOST = "yh-finance.p.rapidapi.com";
const URL = `https://${RAPID_API_HOST}/market/v2/get-quotes`;
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

  async extractPrices(response: any): Promise<PricesObj> {
    const pricesObj: { [symbol: string]: number } = {};
    const quotes = response.data.quoteResponse.result;
    for (const quote of quotes) {
      pricesObj[quote.symbol] = quote.regularMarketPrice;
    }
    return pricesObj;
  }
};

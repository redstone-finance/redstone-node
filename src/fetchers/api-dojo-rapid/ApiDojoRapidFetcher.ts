import axios from "axios";
import { BaseFetcher } from "../BaseFetcher";
import { FetcherOpts, PricesObj } from "../../types";
import _ from "lodash";

const RAPID_API_HOST = "yh-finance.p.rapidapi.com";
const URL = `https://${RAPID_API_HOST}/market/v2/get-quotes`;
const DEFAULT_REGION = "US";
const MAX_TOKENS_SIZE_PER_REQUEST = 50;

const symbolToId: { [symbol: string]: string } =
  require("./symbol-to-api-dojo-symbol.json") as any;

export class ApiDojoRapidFetcher extends BaseFetcher {
  private idToSymbol: { [id: string]: string } = {};

  constructor() {
    super("api-dojo-rapid");
  }

  // API docs: https://rapidapi.com/apidojo/api/yahoo-finance1/
  async fetchData(tokens: string[], opts?: FetcherOpts): Promise<any> {
    this.updateIdToSymbolMapping(tokens);
    const ids = Object.keys(this.idToSymbol);
    // Apidojo rapid limits tokens per request to 50
    // that's why we need to split them to chunks
    const tokenChunks = _.chunk(ids, MAX_TOKENS_SIZE_PER_REQUEST);

    const promises = tokenChunks.map(tokensInChunk => {
      return axios.get(URL, {
        params: {
          region: DEFAULT_REGION,
          symbols: tokensInChunk.join(","),
        },
        headers: {
          "x-rapidapi-key": opts!.credentials!.yahooFinanceRapidApiKey!,
          "x-rapidapi-host": RAPID_API_HOST,
        },
      });
    });
    return await Promise.all(promises);
  }

  async extractPrices(responses: any): Promise<PricesObj> {
    // Merging quotes from all responses
    let quotes: {[symbol: string]: number}[] = [];
    for (const response of responses) {
      quotes = quotes.concat(response.data.quoteResponse.result);
    }

    // Building price object
    const pricesObj: { [symbol: string]: number } = {};
    for (const quote of quotes) {
      const symbol = this.idToSymbol[quote.symbol] ? this.idToSymbol[quote.symbol] : quote.symbol;
      pricesObj[symbol] = quote.regularMarketPrice;
    }

    return pricesObj;
  }

  private updateIdToSymbolMapping(symbols: string[]): void {
    for (const symbol of symbols) {
      const id = symbolToId[symbol];
      if (id !== undefined) {
        this.idToSymbol[id] = symbol;
      } else {
        this.logger.warn(
          `No mapping for "${symbol}" for ${this.name} source`);
      }
    }
  }
};

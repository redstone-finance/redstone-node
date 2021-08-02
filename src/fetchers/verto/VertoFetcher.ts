import axios from "axios";
import { BaseFetcher } from "../BaseFetcher";
import { PricesObj } from "../../types";

const vertoSymbolToId = require("./verto-symbol-to-id.json");

const BASE_URL = "https://v2.cache.verto.exchange";

export class VertoFetcher extends BaseFetcher {
  constructor() {
    super("verto");
  }

  async fetchData(symbols: string[]): Promise<any> {
    const tokenPromises = symbols.map(s =>
      axios.get(`${BASE_URL}/token/${vertoSymbolToId[s]}/price`));

    return await Promise.all(tokenPromises);
  }

  extractPrices(responses: any): PricesObj {
    const pricesObj: { [symbol: string]: number } = {};

    for (const response of responses) {
      if (response && response.data) {
        const quote = response.data;
        pricesObj[quote.ticker] = quote.price;
      }
    }

    return pricesObj;
  }
};

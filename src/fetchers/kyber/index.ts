import axios from "axios";
import _ from "lodash";
import redstone from "redstone-api";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

const ETH_PAIRS_URL = "https://api.kyber.network/api/tokens/pairs";

export class KyberFetcher extends BaseFetcher {
  lastEthPrice?: number;

  constructor() {
    super("kyber");
  }

  async prepareForFetching() {
    const price = await redstone.getPrice("ETH");
    this.lastEthPrice = price.value;
  }

  async fetchData() {
    return await axios.get(ETH_PAIRS_URL);
  }

  extractPrices(response: any, symbols: string[]): PricesObj {
    const pricesObj: PricesObj = {};

    const pairs = response.data;
    for (const symbol of symbols) {
      const pair = pairs["ETH_" + symbol];
      if (pair !== undefined) {
        pricesObj[symbol] = this.lastEthPrice! * pair.currentPrice;
      }
    }

    return pricesObj;
  }

}

export default new KyberFetcher();

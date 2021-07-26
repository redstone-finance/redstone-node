import * as exchangeRates from "ecb-euro-exchange-rates";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

export class EcbFetcher extends BaseFetcher {
  constructor() {
    super("ecb");
  }

  async fetchData(): Promise<any> {
    return await exchangeRates.fetch();
  }

  extractPrices(response: any, symbols: string[]): PricesObj {
    const pricesObj: { [symbol: string]: number } = {};

    const { rates } = response;
    const usdRate = rates.USD;
    for (const symbol of symbols) {
      if (symbol === "EUR") {
        pricesObj[symbol] = usdRate;
      } else {
        pricesObj[symbol] = (1 / rates[symbol]) * usdRate;
      }
    }

    return pricesObj;
  }
}

export default new EcbFetcher();

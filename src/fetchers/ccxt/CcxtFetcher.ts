import { BaseFetcher } from "../BaseFetcher";
import { FetcherOpts, PricesObj } from "../../types";
import ccxt, { Exchange } from "ccxt";
import _ from "lodash";

export class CcxtFetcher extends BaseFetcher {
  exchange: Exchange;

  // CCXT-based fetchers must have names that are exactly equal to
  // the appropriate exchange id in CCXT
  // List of ccxt exchanges: https://github.com/ccxt/ccxt/wiki/Exchange-Markets
  constructor(name: string) {
    super(name);

    // TODO: check if exchange is supported by CCXT

    this.exchange = new (ccxt as any)[name] as Exchange;
  }

  async fetchData(): Promise<any> {
    if (!this.exchange.has["fetchTickers"]) {
      throw new Error(
        `Exchange ${this.name} doesn't support fetchTickers method`);
    }

    return await this.exchange.fetchTickers();
  }

  extractPrices(response: any): PricesObj {
    const pricesObj: PricesObj = {};
    for (const ticker of _.values(response)) {
      const pairSymbol = ticker.symbol;
      if (pairSymbol.includes("USDT")) {
        const symbol = pairSymbol.replace("/USDT", "");
        pricesObj[symbol] = ticker.last;
      }
    }

    return pricesObj;
  }

  // TODO: implement
  validateResponse(response: any): boolean {
    return true;
  }

};

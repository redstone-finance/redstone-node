import { BaseFetcher } from "../BaseFetcher";
import BitsoProxy from "./BitsoProxy";
import type { PricesObj } from "../../types";

const bitsoPairToSymbol: { [symbol: string]: string } =
  require("./bitso-pair-to-symbol.json") as any;

export class BitsoFetcher extends BaseFetcher {
  private bitsoProxy: BitsoProxy;

  constructor() {
    super("bitso");
    this.bitsoProxy = new BitsoProxy();
  }

  async fetchData(): Promise<any> {
    return this.bitsoProxy.getExchangeRates();
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const pricesObj: { [symbol: string]: number } = {};
    const rates = response.data.payload;
    for (const entry of rates) {
      const symbol = bitsoPairToSymbol[entry.book];
      if (symbol === "MXN") {
        pricesObj[symbol] = 1/entry.vwap;
      } else if (symbol) {
        pricesObj[symbol] = +entry.vwap;
      }
    }

    return pricesObj;
  }
}

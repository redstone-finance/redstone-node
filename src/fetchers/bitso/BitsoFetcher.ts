import { BaseFetcher } from "../BaseFetcher";
import BitsoProxy from "./BitsoProxy";
import type { PricesObj } from "../../types";



export class BitsoFetcher extends BaseFetcher {
  bitsoProxy: BitsoProxy;

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
      if(entry.book === "btc_usd") {
        pricesObj["BTC"] = +entry.vwap;
      }
      if(entry.book === "eth_usd") {
        pricesObj["ETH"] = +entry.vwap;
      }
      if(entry.book === "usd_mxn") {
        pricesObj["MXNUSD=X"] = 1/entry.vwap;
      }
    }

    console.log("XOC: ", response);

    return pricesObj;
  }
}

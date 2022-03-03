import { BaseFetcher } from "../BaseFetcher";
import BitsoProxy from "./BitsoProxy";
import type { PricesObj } from "../../types";

const symbolToId: { [symbol: string]: string } =
  require("./symbol-to-bitso-book.json") as any;

export class BitsoFetcher extends BaseFetcher {
  private bitsoProxy: BitsoProxy;
  private idToSymbol: { [id: string]: string } = {};

  constructor() {
    super("bitso");
    this.bitsoProxy = new BitsoProxy();
  }

  async fetchData(symbols: string[]): Promise<any> {
    this.updateIdToSymbolMapping(symbols);
    return this.bitsoProxy.getExchangeRates();
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const pricesObj: { [symbol: string]: number } = {};
    const rates = response.data.payload;
    for (const entry of rates) {
      const symbol = this.idToSymbol[entry.book];
      // bitso gives currencies as usd_somecurrency pair,
      // in that case we take the inverse
      if (entry.book.startsWith("usd")) {
        pricesObj[symbol] = 1/entry.last;
      } else if (symbol) {
        pricesObj[symbol] = +entry.last;
      }
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
}

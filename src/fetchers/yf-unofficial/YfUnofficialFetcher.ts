import _ from "lodash";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";
import YahooFinanceProxy from "./YahooFinanceProxy";

const symbolToId: { [symbol: string]: string } =
  require("./symbol-to-yf-symbol.json") as any;

export class YfUnofficialFetcher extends BaseFetcher {
  private yahooFinanceProxy: YahooFinanceProxy;
  private idToSymbol: { [id: string]: string } = {};

  constructor() {
    super("yf-unofficial");
    this.yahooFinanceProxy = new YahooFinanceProxy();
  }

  async fetchData(symbols: string[]) {
    this.updateIdToSymbolMapping(symbols);
    const ids = Object.keys(this.idToSymbol);
    return await this.yahooFinanceProxy.getExchangeRates(ids);
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const pricesObj: { [symbol: string]: number } = {};

    for (const id of Object.keys(response)) {
      const symbol = this.idToSymbol[id] ? this.idToSymbol[id] : id;
      const details = response[id];
      let value: any = details.price.regularMarketPrice;
      if (isNaN(value)) {
        value = value.raw;
      }

      pricesObj[symbol] = value;
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

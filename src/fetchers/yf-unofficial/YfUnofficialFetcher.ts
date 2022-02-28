import _ from "lodash";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";
import YahooFinanceProxy from "./YahooFinanceProxy";
import symbolToYFSymbol from "./symbol-to-yf-symbol.json";

export class YfUnofficialFetcher extends BaseFetcher {
  private yahooFinanceProxy: YahooFinanceProxy;

  constructor() {
    super("yf-unofficial");
    this.yahooFinanceProxy = new YahooFinanceProxy();
  }

  async fetchData(symbols: string[]) {
    const mappedSymbols = symbols.map(s => {
      const mappedSymbol = (symbolToYFSymbol as any)[s];
      if (mappedSymbol) {
        return mappedSymbol;
      } else {
        this.logger.warn(
          `No mapping for "${s}" for ${this.name} source`);
        return s;
      }
    });
    return await this.yahooFinanceProxy.getExchangeRates(mappedSymbols);
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const pricesObj: { [symbol: string]: number } = {};

    for (const symbol of Object.keys(response)) {
      const details = response[symbol];

      let value: any = details.price.regularMarketPrice;
      if (isNaN(value)) {
        value = value.raw;
      }

      // I am adding more sources for CHF
      // - currencycom
      // - api-dojo-rapid
      // - yf-unofficial
      // - ecb
      // - kraken

      // TODO: implement mapping back
      pricesObj[symbol] = value;
    }

    return pricesObj;
  }

};

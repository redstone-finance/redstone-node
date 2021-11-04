import _ from "lodash";
import { PricesObj, PriceDataFetched } from "../../types";
import { BaseFetcher } from "../BaseFetcher";
import CoingeckoProxy from "./CoingeckoProxy";

const symbolToId: { [symbol: string]: string } =
  require("./coingecko-symbol-to-id.json") as any;

export class CoingeckoFetcher extends BaseFetcher {
  private coingeckoProxy: CoingeckoProxy;
  private idToSymbol: { [id: string]: string } = {};

  constructor() {
    super("coingecko");
    this.coingeckoProxy = new CoingeckoProxy();
  }

  async fetchData(symbols: string[]): Promise<any> {
    this.updateIdToSymbolMapping(symbols);
    const ids = Object.keys(this.idToSymbol);
    return await this.coingeckoProxy.getExchangeRates(ids);
  }

  async fetchDataInSpecificCurrency(symbols: string[], vs_currencies: string[]): Promise<any> {
    this.updateIdToSymbolMapping(symbols);

    const ids = Object.keys(this.idToSymbol);
    const response = await this.coingeckoProxy.getExchangeRates(ids, vs_currencies);
    const pricesObj: { [symbol: string]: number } = {};
    const rates = response.data;
    for (const id of Object.keys(rates)) {
      const symbol = this.idToSymbol[id];
      pricesObj[symbol] = rates[id][vs_currencies[0]];
    }

    return this.convertPricesObjToPriceArraylocal(pricesObj, symbols);
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const pricesObj: { [symbol: string]: number } = {};

    const rates = response.data;
    for (const id of Object.keys(rates)) {
      const symbol = this.idToSymbol[id];
      pricesObj[symbol] = rates[id].usd;
    }

    return pricesObj;
  }

  private convertPricesObjToPriceArraylocal(
    pricesObj: PricesObj,
    requiredSymbols: string[]): PriceDataFetched[] {
      const prices = [];
      for (const symbol of requiredSymbols) {
        if (pricesObj[symbol] === undefined) {
          this.logger.warn(
            `Symbol ${symbol} is not included in response for: ${this.name}`);
        } else {
          prices.push({
            symbol,
            value: pricesObj[symbol],
          });
        }
      }
      return prices;
    };

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

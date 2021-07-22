import { Consola } from "consola";
import { Fetcher, PriceDataFetched, FetcherOpts, PricesObj } from "../types";
import createLogger from "../utils/logger";

export abstract class BaseFetcher implements Fetcher {
  protected name: string;
  protected logger: Consola;

  constructor(name: string) {
    this.name = name;
    this.logger = createLogger("fetchers/" + name);
  };

  // This method may be used to load required data before
  // fetching the main data. For example it can be used to fetch
  // the latest USDT price from trusted source (e.g. redstone-api)
  // for exchanges that don't offer USD support
  async prepareForFetching() {}

  // All the abstract methods below must be implemented in fetchers
  abstract fetchData(symbols: string[], opts?: FetcherOpts): Promise<any>;
  abstract extractPrices(response: any): PricesObj;

  // This method may be overridden to extend validation
  validateResponse(response: any): boolean {
    return this.isSuccessfulResponse(response);
  }

  async fetchAll(
    symbols: string[],
    opts?: FetcherOpts): Promise<PriceDataFetched[]> {
      await this.prepareForFetching();
      const response = await this.fetchData(symbols, opts);
      const isValid = this.validateResponse(response);
      if (!isValid) {
        this.logger.warn(`Response is invalid: ` + JSON.stringify(response.data));
      }
      const pricesObj = this.extractPrices(response);
      return this.convertPricesObjToPriceArray(pricesObj, symbols);
    }

  isSuccessfulResponse(response: any) {
    return response.status < 400;
  }

  private convertPricesObjToPriceArray(
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
};

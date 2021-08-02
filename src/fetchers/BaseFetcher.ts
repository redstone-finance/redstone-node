import { Consola } from "consola";
import { Fetcher, PriceDataFetched, FetcherOpts, PricesObj } from "../types";
import createLogger from "../utils/logger";

const RETRY_TIME_LIMIT = 3000; // ms

export abstract class BaseFetcher implements Fetcher {
  protected name: string;
  protected logger: Consola;
  protected retryForInvalidResponse: boolean = false;

  protected constructor(name: string) {
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
  abstract extractPrices(response: any, symbols?: string[]): PricesObj;

  // This method may be overridden to extend validation
  validateResponse(response: any): boolean {
    return response !== undefined;
  }

  async fetchAll(
    symbols: string[],
    opts?: FetcherOpts): Promise<PriceDataFetched[]> {
      // Prepare for fetching
      await this.prepareForFetching();

      // Fetching data
      const fetchStartTime = Date.now();
      let response = await this.fetchData(symbols, opts);

      // Retrying data fetching if needed
      const shouldRetry =
        !this.validateResponse(response)
        && this.retryForInvalidResponse
        && Date.now() - fetchStartTime <= RETRY_TIME_LIMIT;
      if (shouldRetry) {
        this.logger.info("Retrying to fetch data");
        response = await this.fetchData(symbols, opts);
      }

      // Validating response
      const isValid = this.validateResponse(response);
      if (!isValid) {
        throw new Error(`Response is invalid: ` + JSON.stringify(response));
      }

      // Extracting prices from response
      const pricesObj = this.extractPrices(response, symbols);
      return this.convertPricesObjToPriceArray(pricesObj, symbols);
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

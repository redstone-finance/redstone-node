import {Consola} from "consola";
import {timeout} from "promise-timeout";
import fetchers from "./index";
import ManifestHelper, {TokensBySource} from "../manifest/ManifestParser";
import {
  Aggregator,
  Credentials,
  Manifest,
  PriceDataAfterAggregation,
  PriceDataBeforeAggregation,
  PriceDataFetched
} from "../types";
import {trackEnd, trackStart} from "../utils/performance-tracker";
import {v4 as uuidv4} from 'uuid'
import ManifestConfigError from "../manifest/ManifestConfigError";

const logger = require("../utils/logger")("PricesFetcher") as Consola;

export type PricesDataFetched = { [source: string]: PriceDataFetched[] };
export type PricesBeforeAggregation = { [token: string]: PriceDataBeforeAggregation }

export default class PricesService {

  constructor(
    private manifest: Manifest,
    private credentials: Credentials
  ) {
  }

  async fetchInParallel(tokensBySource: TokensBySource)
    : Promise<PricesDataFetched[]> {

    const promises: Promise<PricesDataFetched>[] = [];

    for (const source in tokensBySource) {
      promises.push(
        this.safeFetchFromSource(
          source,
          tokensBySource[source]));
    }

    return await Promise.all(promises);
  }

  private async safeFetchFromSource(
    source: string,
    tokens: string[]): Promise<PricesDataFetched> {
    try {
      // Fetching
      const pricesFromSource = await this.doFetchFromSource(source, tokens);

      return {
        [source]: pricesFromSource
      }

    } catch (e) {
      //not sure why instanceof is not working, crap.
      if (e.name == "ManifestConfigError") {
        throw e;
      } else {
        // We don't throw an error because we want to continue with
        // other fetchers even if some fetchers failed
        const resData = e.response ? e.response.data : "";
        logger.error(
          `Fetching failed for source: ${source}: ${resData}`, e.stack);
        return {};
      }
    }
  }

  private async doFetchFromSource(source: string, tokens: string[])
  : Promise<PriceDataFetched[]> {
    if (tokens.length === 0) {
       throw new ManifestConfigError(
        `${source} fetcher received an empty array of symbols`);
    }

    trackStart(`fetching-${source}`);
    const fetchPromise = fetchers[source].fetchAll(tokens, {
      credentials: this.credentials,
    }).then((prices) => {
      trackEnd(`fetching-${source}`);
      logger.info(
        `Fetched prices in USD for ${prices.length} `
        + `currencies from source: "${source}"`);
      return prices;
    });

    const sourceTimeout = ManifestHelper.getTimeoutForSource(source, this.manifest);
    if (sourceTimeout === null) {
      throw new ManifestConfigError(`No timeout configured for ${source}. Did you forget to add "sourceTimeout" field in manifest file?`)
    }
    logger.info(`Call to ${source} will timeout after ${sourceTimeout}ms`);

    // Fail if there is no response after given timeout
    return timeout(fetchPromise, sourceTimeout);
  }

  static groupPricesByToken(
    fetchTimestamp: number, pricesData: PricesDataFetched, nodeVersion: string): PricesBeforeAggregation {

    const result: PricesBeforeAggregation = {};

    for (const source in pricesData) {
      for (const price of pricesData[source]) {

        if (result[price.symbol] === undefined) {
          result[price.symbol] = {
            id: uuidv4(), // Generating unique id for each price
            source: {},
            symbol: price.symbol,
            timestamp: fetchTimestamp,
            version: nodeVersion,
          };
        }

        result[price.symbol].source[source] = price.value;
      }
    }

    return result;
  }

  calculateAggregatedValues(
    prices: PriceDataBeforeAggregation[],
    aggregator: Aggregator
  ): PriceDataAfterAggregation[] {

    const aggregatedPrices: PriceDataAfterAggregation[] = [];
    for (const price of prices) {
      const maxPriceDeviationPercent = this.maxPriceDeviationPercent(price.symbol);
      try {
        const priceAfterAggregation = aggregator.getAggregatedValue(price, maxPriceDeviationPercent);
        if (priceAfterAggregation.value <= 0
          || priceAfterAggregation.value === undefined) {
          throw new Error(
            "Invalid price value: "
            + JSON.stringify(priceAfterAggregation));
        }
        aggregatedPrices.push(priceAfterAggregation);
      } catch (e) {
        logger.error(e.stack);
      }
    }
    return aggregatedPrices;
  }

  private maxPriceDeviationPercent(priceSymbol: string): number {
    const result = ManifestHelper.getMaxDeviationForSymbol(priceSymbol, this.manifest);
    if (result === null) {
      throw new ManifestConfigError(`Could not determine maxPriceDeviationPercent for ${priceSymbol}.
        Did you forget to add maxPriceDeviationPercent parameter in the manifest file?`);
    }
    logger.debug(`maxPriceDeviationPercent for ${priceSymbol}: ${result}`)

    return result;
  }
}

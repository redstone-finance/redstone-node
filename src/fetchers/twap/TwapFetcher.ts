import axios from "axios";
import _ from "lodash";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";
import EvmPriceSigner from "../../signers/EvmPriceSigner";

const PRICES_URL = "https://api.redstone.finance/prices";
const MAX_LIMIT = 1000;
const EVM_CHAIN_ID = 1;

interface HistoricalPrice {
  symbol: string;
  timestamp: number;
  value: number;
  liteEvmSignature: string;
  version: string;
}

interface ResponseForTwap {
  [symbol: string]: HistoricalPrice[];
}

export class TwapFetcher extends BaseFetcher {
  constructor(
    private readonly sourceProviderId: string,
    private readonly providerEvmPublicKey: string,
  ) {
    super(`twap-${sourceProviderId}`);
  }

  async fetchData(symbols: string[]) {
    const currentTimestamp = Date.now();
    const response: ResponseForTwap = {};

    // Fetching historical prices for each symbol in parallel
    const promises: Promise<void>[] = [];
    for (const symbol of symbols) {
      const { assetSymbol, millisecondsOffset } = TwapFetcher.parseTwapSymbol(symbol);
      const fromTimestamp = currentTimestamp - millisecondsOffset;
      const fetchingPromiseForSymbol = axios.get(PRICES_URL, {
        params: {
          symbol: assetSymbol,
          provider: this.sourceProviderId,
          fromTimestamp,
          toTimestamp: currentTimestamp,
          limit: MAX_LIMIT,
        },
      }).then(responseForSymbol => {
        response[symbol] = responseForSymbol.data;
      });
      promises.push(fetchingPromiseForSymbol);
    }
    await Promise.all(promises);

    return response;
  }

  async extractPrices(response: ResponseForTwap): Promise<PricesObj> {
    const pricesObj: PricesObj = {};

    for (const [symbol, historicalPrices] of Object.entries(response)) {
      this.verifySignatures(historicalPrices);
      const twapValue = TwapFetcher.getTwapValue(historicalPrices);
      pricesObj[symbol] = twapValue;
    }

    return pricesObj;
  }

  async verifySignatures(prices: HistoricalPrice[]) {
    for (const price of prices) {
      await this.verifySignature(price);
    }
  }

  async verifySignature(price: HistoricalPrice) {
    const evmSigner = new EvmPriceSigner(price.version, EVM_CHAIN_ID);
    const isSignatureValid = evmSigner.verifyLiteSignature({
      pricePackage: {
        prices: [{
          symbol: price.symbol,
          value: price.value,
        }],
        timestamp: price.timestamp,
      },
      signerPublicKey: this.providerEvmPublicKey,
      liteSignature: price.liteEvmSignature,
    });

    if (!isSignatureValid) {
      throw new Error(`Received an invalid signature: `
        + JSON.stringify(price));
    }
  }

  static getTwapValue(historicalPrices: HistoricalPrice[]): number {
    if (historicalPrices.length === 1) {
      return historicalPrices[0].value;
    } else {
      const sortedPrices = TwapFetcher.getSortedPricesByTimestamp(historicalPrices);
      const totalIntervalLengthInMilliseconds =
        sortedPrices[0].timestamp - sortedPrices[sortedPrices.length - 1].timestamp;
      let twapValue = 0;

      for (let intervalIndex = 0; intervalIndex < sortedPrices.length - 1; intervalIndex++) {
        const intervalStartPrice = sortedPrices[intervalIndex];
        const intervalEndPrice = sortedPrices[intervalIndex + 1];
        const intervalLengthInMilliseconds =
          intervalStartPrice.timestamp - intervalEndPrice.timestamp;
        const intervalWeight =
          (intervalLengthInMilliseconds / totalIntervalLengthInMilliseconds);
        const intervalAveraveValue = (intervalStartPrice.value + intervalEndPrice.value) / 2;
        twapValue += intervalAveraveValue * intervalWeight;
      }

      return twapValue;
    }
  }

  static parseTwapSymbol(twapSymbol: string): { assetSymbol: string; millisecondsOffset: number } {
    const chunks = twapSymbol.split("-");
    return {
      assetSymbol: chunks[0],
      millisecondsOffset: Number(chunks[chunks.length - 1]) * 60 * 1000,
    };
  }

  static getSortedPricesByTimestamp(prices: HistoricalPrice[]): HistoricalPrice[] {
    const sortedHistoricalPrices = [...prices];
    sortedHistoricalPrices.sort((a, b) => a.timestamp - b.timestamp);
    return sortedHistoricalPrices;
  }
};

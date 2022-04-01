import axios from "axios";
import _ from "lodash";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

const PRICES_URL = "https://api.redstone.finance/prices";

// TODO: remove comment below
// https://api.redstone.finance/prices?symbol=BTC&provider=redstone-rapid&fromTimestamp=1648580515000&toTimestamp=1648753315867&offset=0&limit=20

interface HistoricalPrice {
  timestamp: number;
  value: number;
  liteSignature: string;
}

interface ResponseForTwap {
  [symbol: string]: HistoricalPrice[];
}

export class TwapFetcher extends BaseFetcher {
  constructor(
    private readonly sourceProviderId: string,
    private readonly providerEvmAddress: string,
  ) {
    super(`twap-${sourceProviderId}`);
  }

  async fetchData(symbols: string[]) {
    const currentTimestamp = Date.now();
    const response: ResponseForTwap = {};

    // Fetching historical prices for each symbol
    const promises: Promise<void>[] = [];
    for (const symbol of symbols) {
      const millisecondsOffset = getMillisecondsOffsetForSymbol(symbol);
      const fromTimestamp = currentTimestamp - millisecondsOffset;
      const fetchingPromiseForSymbol = axios.get(PRICES_URL, {
        params: {
          provider: this.sourceProviderId,
          fromTimestamp,
        },
      }).then(responseForSymbol => response[symbol] = responseForSymbol.data);
      promises.push(fetchingPromiseForSymbol);
    }
    await Promise.all(promises);

    return response;
  }

  async extractPrices(response: ResponseForTwap): Promise<PricesObj> {
    const pricesObj: PricesObj = {};

    for (const [symbol, historicalPrices] of Object.entries(response)) {
      this.verifySignatures(historicalPrices);
      const twapValue = getTwapValue(historicalPrices);
      pricesObj[symbol] = twapValue;
    }

    return pricesObj;
  }

  async verifySignatures(prices: HistoricalPrice[]) {
    for (const price of prices) {
      await this.verifySignature(price);
    }
  }

  // TODO: add real logic for signature verification
  async verifySignature(price: HistoricalPrice) {
    if (!price.liteSignature || !this.providerEvmAddress) {
      throw new Error(`Invalid signature: ${JSON.stringify(price)}`);
    }
  }
};

function getTwapValue(historicalPrices: HistoricalPrice[]): number {
  if (historicalPrices.length === 1) {
    return historicalPrices[0].value;
  } else {
    const sortedPrices = getSortedPricesByTimestamp(historicalPrices);
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

function getSortedPricesByTimestamp(prices: HistoricalPrice[]): HistoricalPrice[] {
  const sortedHistoricalPrices = [...prices];
  // TODO: check if it should not be reverted
  sortedHistoricalPrices.sort((a, b) => a.timestamp - b.timestamp);
  return sortedHistoricalPrices;
}

// For BTC-TWAP-5 it returns 300000 (5 mins)
// For BTC-TWAP-60 it returns 3600000 (60 mins)
function getMillisecondsOffsetForSymbol(symbol: string) {
  const chunks = symbol.split("-");
  return Number(chunks[chunks.length - 1]) * 60 * 1000;
}

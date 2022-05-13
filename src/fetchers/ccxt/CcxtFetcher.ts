import { BaseFetcher } from "../BaseFetcher";
import { PricesObj } from "../../types";
import redstone from "redstone-api";
import ccxt, { Exchange, Ticker } from "ccxt";
import { getRequiredPropValue } from "../../utils/objects";
import symbolToId from "./symbol-to-id/index";

const CCXT_FETCHER_MAX_REQUEST_TIMEOUT_MS = 120000;

export class CcxtFetcher extends BaseFetcher {
  private readonly exchange: Exchange;

  // CCXT-based fetchers must have names that are exactly equal to
  // the appropriate exchange id in CCXT
  // List of ccxt exchanges: https://github.com/ccxt/ccxt/wiki/Exchange-Markets
  constructor(name: ccxt.ExchangeId) {
    super(name);
    const exchangeClass = ccxt[name];
    if (!exchangeClass) {
      throw new Error(`Exchange ${name} is not accessible through CCXT`);
    }
    this.exchange = new exchangeClass({
      timeout: CCXT_FETCHER_MAX_REQUEST_TIMEOUT_MS,
      enableRateLimit: false, // This config option is required to avoid problems with requests timeout
    }) as Exchange;
  }

  override convertIdToSymbol(id: string) {
    if (id.endsWith("/USD")) {
      return id.replace("/USD", "");
    } else if (id.endsWith("/USDT")) {
      return id.replace("/USDT", "");
    } else {
      throw new Error(
        `Unsupported option for pair name (${this.name}): ${id}`);
    }
  }

  override convertSymbolToId(symbol: string) {
    const mapping = this.tryGetSymbolToIdMapping();
    if (!!mapping) {
      return getRequiredPropValue(mapping, symbol);
    } else {
      return symbol;
    }
  }

  private tryGetSymbolToIdMapping(): { [id: string]: string } | undefined {
    return symbolToId[this.name as ccxt.ExchangeId];
  }

  async fetchData(ids: string[]): Promise<any> {
    if (!this.exchange.has["fetchTickers"]) {
      throw new Error(
        `Exchange ${this.name} doesn't support fetchTickers method`);
    }

    const tickerSymbols = !!this.tryGetSymbolToIdMapping()
      ? ids
      : undefined;

    // If we pass undefined as tickerSymbols then all available tickers will be loaded
    // But some exchanges (like kraken) do not support this anymore
    return await this.exchange.fetchTickers(tickerSymbols);
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const lastUsdtPrice = (await redstone.getPrice("USDT")).value;

    const pricesObj: PricesObj = {};

    for (const ticker of Object.values(response) as Ticker[]) {
      const pairSymbol = ticker.symbol;
      const lastPrice = ticker.last as number;

      if (pairSymbol.endsWith("/USD")) {
        pricesObj[pairSymbol] = lastPrice;
      } else if (pairSymbol.endsWith("/USDT")) {
        if (!pricesObj[pairSymbol]) {
          pricesObj[pairSymbol] = lastPrice * lastUsdtPrice;
        }
      }
    }

    return pricesObj;
  }
};

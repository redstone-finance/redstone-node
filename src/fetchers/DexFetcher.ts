import graphProxy from "../utils/graph-proxy";
import { PricesObj } from "../types";
import { BaseFetcher } from "./BaseFetcher";

interface SymbolToPairId {
  [symbol: string]: string;
};

export class DexFetcher extends BaseFetcher {
  protected retryForInvalidResponse: boolean = true;

  constructor(
    name: string,
    private readonly subgraphUrl: string,
    private readonly symbolToPairIdObj: SymbolToPairId) {
      super(name);
    }

  async fetchData(symbols: string[]) {
    const ids = this.convertSymbolsToPairIds(
      symbols,
      this.symbolToPairIdObj);

    const query = `{
      pairs(where: { id_in: ${JSON.stringify(ids)} }) {
        token0 {
          symbol
        }
        reserve0
        reserveUSD
      }
    }`;

    return await graphProxy.executeQuery(
      this.subgraphUrl,
      query);
  }

  validateResponse(response: any): boolean {
    return response !== undefined && response.data !== undefined;
  }

  async extractPrices(response: any): Promise<PricesObj> {
    const pricesObj: { [symbol: string]: number } = {};

    for (const pair of response.data.pairs) {
      const value =
        parseFloat(pair.reserveUSD) / (2 * parseFloat(pair.reserve0));
      pricesObj[pair.token0.symbol] = value;
    }

    return pricesObj;
  }

  private convertSymbolsToPairIds(
    symbols: string[],
    symbolToPairId: SymbolToPairId): string[] {
      const pairIds = [];

      for (const symbol of symbols) {
        const pairId = symbolToPairId[symbol];
        if (pairId === undefined) {
          this.logger.warn(
            `Source "${this.name}" does not support symbol: "${symbol}"`);
        } else {
          pairIds.push(pairId);
        }
      }

      return pairIds;
    }
};

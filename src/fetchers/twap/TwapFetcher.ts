import _ from "lodash";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

export class TwapFetcher extends BaseFetcher {
  constructor() {
    super("twap");
  }

  async fetchData(symbols: string[]) {
    // TODO: fetch datapoints in time
  }

  async extractPrices(response: any): Promise<PricesObj> {
    // TODO: calculate twap for each symbol
    return {};
  }

};

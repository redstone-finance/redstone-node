import { BaseFetcher } from "../BaseFetcher";
import { PricesObj } from "../../types";
import TwelvedataProxy from "./TwelvedataProxy";

export class TwelvedataFetcher extends BaseFetcher {
  twelvedataProxy: TwelvedataProxy;

  constructor() {
    super("twelvedata");
    this.twelvedataProxy = new TwelvedataProxy(
      "5f9a62033dmsh0f02d4b984bb80bp111ebfjsneffb8691aab7"
    );
  }

  async getExchangeRates(): Promise<any> {}

  async fetchData(ids: string[]): Promise<any> {
    return await this.twelvedataProxy.getExchangeRates(ids);
  }

  async extractPrices(response: any): Promise<PricesObj> {
    return response;
  }
}

import axios from "axios";
import _ from "lodash";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

const DRAND_URL = "https://drand.cloudflare.com/public/latest";
const MAX_STR_LEN = 30;
export const ENTROPY_SYMBOL = "ENTROPY";

export class DrandFetcher extends BaseFetcher {
  constructor() {
    super("drand");
  }

  async fetchData() {
    return await axios.get(DRAND_URL);
  }

  async extractPrices(response: any, symbols: string[]): Promise<PricesObj> {
    if (symbols.length !== 1 || symbols[0] !== ENTROPY_SYMBOL) {
      throw new Error(`Only one symbol supported by drand: ${ENTROPY_SYMBOL}`);
    }

    const entropy = Number(
      BigInt("0x" + response.data.randomness) % BigInt(Number.MAX_SAFE_INTEGER)
    );

    const result = {
      [ENTROPY_SYMBOL]: entropy,
    };

    return result;
  }
};

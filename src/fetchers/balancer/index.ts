import axios, {AxiosResponse} from "axios";
import {PriceDataFetched, Fetcher, Credentials} from "../../types";

const URL = "https://api.covalenthq.com/v1/1/address/balancer.eth/stacks/balancer/balances/";

const balancerFetcher: Fetcher = {
  async fetchAll(
    tokenSymbols: string[],
    opts?: { credentials: Credentials }): Promise<PriceDataFetched[]> {
    if (opts === undefined || opts.credentials.covalentApiKey === undefined) {
      throw new Error(
        "To use balancer fetcher you should pass --covalent-key");
    }

    const balances = await getDataFromCovalentApi(opts);

    return getPricesFromApiResponse(tokenSymbols, balances)
  },
};

async function getDataFromCovalentApi(opts: { credentials: Credentials }) {
  const response =  await axios.get(URL, {
    params: {"key": opts.credentials.covalentApiKey},
  });

  return response.data.data.balancer.balances;
}

function getPricesFromApiResponse(tokenSymbols: string[], balances: any[]) {
  const result: PriceDataFetched[] = [];
  const addedAssets = new Set();
  //TODO: why the same assets are returned for different balances?
  for (const balance of balances) {
    for (const asset of balance.assets) {
      const assetSymbol: string = asset["contract_ticker_symbol"];
      if (!addedAssets.has(assetSymbol) && tokenSymbols.includes(assetSymbol)) {
        result.push({
          symbol: assetSymbol,
          value: asset.quote_rate,
        });
        addedAssets.add(assetSymbol);
      }
    }
  }

  return result;
}

export default balancerFetcher;

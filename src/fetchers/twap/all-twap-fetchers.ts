import { ExchangeId } from "ccxt";
import { TwapFetcher } from "./TwapFetcher";
import allSupportedProvidersForTwap from "./all-supported-providers-for-twap.json";

const fetchersObj: { [name: string]: TwapFetcher } = {};

// Fetcher names must be the same as their exchange names
for (const sourceProviderId of allSupportedProvidersForTwap) {
  fetchersObj[sourceProviderId] = new TwapFetcher(sourceProviderId);
}

export default fetchersObj;

import { ExchangeId } from "ccxt";
import { TwapFetcher } from "./TwapFetcher";
import allSupportedProvidersForTwap from "./all-supported-providers-for-twap.json";

const fetchersObj: { [name: string]: TwapFetcher } = {};

// Fetcher names must be the same as their exchange names
for (const providerDetails of allSupportedProvidersForTwap) {
  fetchersObj[providerDetails.id] = new TwapFetcher(
    providerDetails.id,
    providerDetails.evmAddress);
}

export default fetchersObj;

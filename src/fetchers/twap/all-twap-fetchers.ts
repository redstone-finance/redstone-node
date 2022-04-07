import { TwapFetcher } from "./TwapFetcher";
import allSupportedProvidersForTwap from "./all-supported-providers-for-twap.json";

const fetchersObj: { [name: string]: TwapFetcher } = {};

// Fetcher names must be the same as their exchange names
for (const providerDetails of allSupportedProvidersForTwap) {
  const twapFetcherInstance = new TwapFetcher(
    providerDetails.id,
    providerDetails.evmPublicKey);
  fetchersObj[twapFetcherInstance.getName()] = twapFetcherInstance;
}

export default fetchersObj;

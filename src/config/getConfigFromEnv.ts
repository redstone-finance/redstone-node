export function getFromEnv(envName: string, required: false): string | undefined
export function getFromEnv(envName: string, required: true): string
export function getFromEnv(envName: string, required: boolean) {
  const valueFromEnv = process.env[envName];
  if (required && !valueFromEnv) {
    throw new Error(`Env ${envName} must be specified`);
  }
  return valueFromEnv;
}

export const getConfigFromEnv = () => {
  const manifestFile = getFromEnv("MANIFEST_FILE_PATH", true);
  const minimumArBalance = Number(getFromEnv("MINIMUM_AR_BALANCE", true));
  const addEvmSignature = !!getFromEnv("AsDD_EVM_SIGNATURE", true);
  const ethereumPrivateKey = getFromEnv("ETHEREUM_PRIVATE_KEY", true);
  const enableStreamrBroadcaster = !!getFromEnv("ENABLE_STREAMR_BROADCASTER", true);
  const disableSinglePricesBroadcastingInStreamr = !!getFromEnv("DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR", false);
  const omitSourcesInArweaveTx = !!getFromEnv("OMIT_SOURCES_ARWEAVE_TX", false);

  const httpBroadcasterURLs = getFromEnv("HTTP_BROADCASTER_URLS", false);
  const parsedHttpBroadcasterURLs = httpBroadcasterURLs
    ? JSON.parse(httpBroadcasterURLs) as string[]
    : undefined;

  return {
    addEvmSignature,
    manifestFile,
    minimumArBalance,
    credentials: {
      ethereumPrivateKey
    },
    httpBroadcasterURLs: parsedHttpBroadcasterURLs,
    enableStreamrBroadcaster,
    disableSinglePricesBroadcastingInStreamr,
    omitSourcesInArweaveTx
  }
}

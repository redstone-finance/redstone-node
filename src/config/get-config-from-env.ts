import "dotenv/config";

export function getFromEnv(envName: string, defaultValue: string | number): string
export function getFromEnv(envName: string, defaultValue?: undefined): string
export function getFromEnv(envName: string, defaultValue: boolean): boolean
export function getFromEnv(envName: string, defaultValue?: string | number | boolean) {
  const valueFromEnv = process.env[envName];
  if (!valueFromEnv && !defaultValue) {
    throw new Error(`Env ${envName} must be specified`);
  }
  return valueFromEnv ? parseBooleanEnvValue(valueFromEnv) : defaultValue;
};

const parseBooleanEnvValue = (valueFromEnv: string) => {
  if (valueFromEnv === "true" || valueFromEnv === "false") {
    return valueFromEnv === "true";
  }
  return valueFromEnv;
}

export const getConfigFromEnv = () => {
  const enableJsonLogs = getFromEnv("ENABLE_JSON_LOGS", true);
  const printDiagnosticInfo = getFromEnv("PRINT_DIAGNOSTIC_INFO", true);
  const performanceTrackingLabelPrefix = getFromEnv("PERFORMANCE_TRACKING_LABEL_PREFIX", "public");
  const manifestRefreshInterval = Number(getFromEnv("MANIFEST_REFRESH_INTERVAL", 120000));
  const useManifestFromSmartContract = getFromEnv("USE_MANIFEST_FROM_SMART_CONTRACT", true);
  const manifestFile = getFromEnv("MANIFEST_FILE_PATH");
  const minimumArBalance = Number(getFromEnv("MINIMUM_AR_BALANCE", 0));
  const addEvmSignature = getFromEnv("ADD_EVM_SIGNATURE", false);
  const ethereumPrivateKey = getFromEnv("ETHEREUM_PRIVATE_KEY");
  const enableStreamrBroadcaster = getFromEnv("ENABLE_STREAMR_BROADCASTER", false);
  const disableSinglePricesBroadcastingInStreamr = getFromEnv(
    "DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR", true
  );
  const omitSourcesInArweaveTx = getFromEnv("OMIT_SOURCES_ARWEAVE_TX", true);
  const httpBroadcasterURLs = getFromEnv(
    "HTTP_BROADCASTER_URLS",
    JSON.stringify(["https://api.redstone.finance", "https://vwx3eni8c7.eu-west-1.awsapprunner.com", "https://container-service-1.dv9sai71f4rsq.eu-central-1.cs.amazonlightsail.com"])
  );
  const parsedHttpBroadcasterURLs = httpBroadcasterURLs
    ? JSON.parse(httpBroadcasterURLs) as string[]
    : [];
  const twelveDataRapidApiKey = getFromEnv("TWELVE_DATA_RAPID_API_KEY");

  return {
    enableJsonLogs,
    printDiagnosticInfo,
    performanceTrackingLabelPrefix,
    manifestRefreshInterval,
    useManifestFromSmartContract,
    addEvmSignature,
    manifestFile,
    minimumArBalance,
    credentials: {
      ethereumPrivateKey,
      twelveDataRapidApiKey
    },
    httpBroadcasterURLs: parsedHttpBroadcasterURLs,
    enableStreamrBroadcaster,
    disableSinglePricesBroadcastingInStreamr,
    omitSourcesInArweaveTx
  }
};

import "dotenv/config";
import { Manifest, NodeConfig } from "../types";
import { readJSON } from "../utils/objects";

function getFromEnv(envName: string, defaultValue?: string | number): string
function getFromEnv(envName: string, defaultValue?: string[]): string[]
function getFromEnv(envName: string, defaultValue?: boolean): boolean
function getFromEnv(envName: string, defaultValue?: string | number | boolean | string[]) {
  if (envName === "HTTP_BROADCASTER_URLS") {
    console.log({ dupa: process.env[envName] })
  }
  const valueFromEnv = process.env[envName];
  if (!valueFromEnv && defaultValue === undefined) {
    throw new Error(`Env ${envName} must be specified`);
  }
  return valueFromEnv ? parseBooleanEnvValue(valueFromEnv) : defaultValue;
};

const parseBooleanEnvValue = (valueFromEnv: string) => {
  if (valueFromEnv === "true" || valueFromEnv === "false") {
    return valueFromEnv === "true";
  }
  return valueFromEnv;
};

const getOptionallyManifestData = () => {
  const useManifestFromSmartContract = getFromEnv("USE_MANIFEST_FROM_SMART_CONTRACT", true);
  if (useManifestFromSmartContract) {
    return null;
  } else {
    const manifestFile = process.env["MANIFEST_FILE_PATH"];
    if (manifestFile) {
      return readJSON(manifestFile) as Manifest;
    } else {
      throw Error("USE_MANIFEST_FROM_SMART_CONTRACT must be true or MANIFEST_FILE_PATH must have proper value");
    }
  }
};

export const getArweaveWallet = () => {
  const arweaveKeysFile = process.env.ARWEAVE_KEYS_FILE_PATH;
  const arweaveKeysJWK = process.env.ARWEAVE_KEYS_JWK;
  if (arweaveKeysFile) {
    return readJSON(arweaveKeysFile);
  } else if (arweaveKeysJWK) {
    return JSON.parse(arweaveKeysJWK);
  } else {
    throw new Error(`Env ARWEAVE_KEYS_FILE_PATH or ARWEAVE_KEYS_JWK must be specified`);
  }
};

export const config: NodeConfig = Object.freeze({
  isProd: getFromEnv("MODE", "LOCAL") === "PROD",
  enableJsonLogs: getFromEnv("ENABLE_JSON_LOGS", true),
  printDiagnosticInfo: getFromEnv("PRINT_DIAGNOSTIC_INFO", true),
  performanceTrackingLabelPrefix: getFromEnv("PERFORMANCE_TRACKING_LABEL_PREFIX", "public"),
  manifestRefreshInterval: Number(getFromEnv("MANIFEST_REFRESH_INTERVAL", 120000)),
  useManifestFromSmartContract: getFromEnv("USE_MANIFEST_FROM_SMART_CONTRACT", true),
  manifestFromFile: getOptionallyManifestData(),
  minimumArBalance: Number(getFromEnv("MINIMUM_AR_BALANCE", 0)),
  enableStreamrBroadcaster: getFromEnv("ENABLE_STREAMR_BROADCASTER", false),
  disableSinglePricesBroadcastingInStreamr: getFromEnv(
    "DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR", true
  ),
  omitSourcesInArweaveTx: getFromEnv("OMIT_SOURCES_ARWEAVE_TX", true),
  httpBroadcasterURLs: JSON.parse(getFromEnv(
    "HTTP_BROADCASTER_URLS",
    process.env["MODE"] === "PROD"
      ? '["https://api.redstone.finance", "https://vwx3eni8c7.eu-west-1.awsapprunner.com", "https://container-service-1.dv9sai71f4rsq.eu-central-1.cs.amazonlightsail.com"]'
      : '["http://localhost:9000"]'
  )),
  credentials: {
    twelveDataRapidApiKey: getFromEnv("TWELVE_DATA_RAPID_API_KEY", ""),
  },
  privateKeys: {
    arweaveJwk: getArweaveWallet(),
    ethereumPrivateKey: getFromEnv("ETHEREUM_PRIVATE_KEY"),
  }
});

import "dotenv/config";
import { JWKInterface } from "arweave/node/lib/wallet";
import { Manifest, NodeConfig } from "../types";
import { readJSON } from "../utils/objects";

const DEFAULT_ENABLE_JSON_LOGS = true;
const DEFAULT_PERFORMANCE_TRACKING_LABEL_PREFIX = "public";
const DEFAULT_PRINT_DIAGNOSTIC_INFO = true;
const DEFAULT_MANIFEST_REFRESH_INTERVAL = 120000;
const DEFAULT_USE_MANIFEST_FROM_SMART_CONTRACT = true;
const DEFAULT_MINIMUM_AR_BALANCE = 0;
const DEFAULT_ENABLE_STREAMR_BROADCASTER = false;
const DEFAULT_DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR = true;
const DEFAULT_OMIT_SOURCES_ARWEAVE_TX = true;
const DEFAULT_PROD_HTTP_BROADCASTER_URLS = `[
"https://api.redstone.finance",
  "https://vwx3eni8c7.eu-west-1.awsapprunner.com",
  "https://container-service-1.dv9sai71f4rsq.eu-central-1.cs.amazonlightsail.com"
]`;
const DEFAULT_DEV_HTTP_BROADCASTER_URLS = '["http://localhost:9000"]';
const DEFAULT_TWELVE_DATA_RAPID_API_KEY = "";

function getFromEnv(envName: string, defaultValue?: string | number): string
function getFromEnv(envName: string, defaultValue?: boolean): boolean
function getFromEnv(envName: string, defaultValue?: string | number | boolean) {
  const valueFromEnv = process.env[envName];
  if (!valueFromEnv && defaultValue === undefined) {
    throw new Error(`Env ${envName} must be specified`);
  }
  return valueFromEnv
    ? parseBooleanEnvValueIfBooleanString(valueFromEnv)
    : defaultValue;
};

const parseBooleanEnvValueIfBooleanString = (valueFromEnv: string) => {
  if (valueFromEnv === "true" || valueFromEnv === "false") {
    return valueFromEnv === "true";
  }
  return valueFromEnv
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
      throw new Error(`USE_MANIFEST_FROM_SMART_CONTRACT must be true or
        MANIFEST_FILE_PATH must have proper value`);
    }
  }
};

export const getArweaveWallet = (): JWKInterface => {
  const arweaveKeysFile = process.env.ARWEAVE_KEYS_FILE_PATH;
  const arweaveKeysJWK = process.env.ARWEAVE_KEYS_JWK;
  if (arweaveKeysFile) {
    return readJSON(arweaveKeysFile);
  } else if (arweaveKeysJWK) {
    return JSON.parse(arweaveKeysJWK);
  } else {
    throw new Error("Env ARWEAVE_KEYS_FILE_PATH or ARWEAVE_KEYS_JWK must be specified");
  }
};

export const config: NodeConfig = Object.freeze({
  isProd: getFromEnv("MODE", "LOCAL") === "PROD",
  enableJsonLogs: getFromEnv(
    "ENABLE_JSON_LOGS",
    DEFAULT_ENABLE_JSON_LOGS
  ),
  printDiagnosticInfo: getFromEnv(
    "PRINT_DIAGNOSTIC_INFO",
    DEFAULT_PRINT_DIAGNOSTIC_INFO
  ),
  performanceTrackingLabelPrefix: getFromEnv(
    "PERFORMANCE_TRACKING_LABEL_PREFIX",
    DEFAULT_PERFORMANCE_TRACKING_LABEL_PREFIX
  ),
  manifestRefreshInterval: Number(getFromEnv(
    "MANIFEST_REFRESH_INTERVAL",
    DEFAULT_MANIFEST_REFRESH_INTERVAL
  )),
  useManifestFromSmartContract: getFromEnv(
    "USE_MANIFEST_FROM_SMART_CONTRACT",
    DEFAULT_USE_MANIFEST_FROM_SMART_CONTRACT
  ),
  manifestFromFile: getOptionallyManifestData(),
  minimumArBalance: Number(getFromEnv(
    "MINIMUM_AR_BALANCE",
    DEFAULT_MINIMUM_AR_BALANCE
  )),
  enableStreamrBroadcaster: getFromEnv(
    "ENABLE_STREAMR_BROADCASTER",
    DEFAULT_ENABLE_STREAMR_BROADCASTER
  ),
  disableSinglePricesBroadcastingInStreamr: getFromEnv(
    "DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR",
    DEFAULT_DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR
  ),
  omitSourcesInArweaveTx: getFromEnv(
    "OMIT_SOURCES_ARWEAVE_TX",
    DEFAULT_OMIT_SOURCES_ARWEAVE_TX
  ),
  httpBroadcasterURLs: JSON.parse(getFromEnv(
    "HTTP_BROADCASTER_URLS",
    process.env["MODE"] === "PROD"
      ? DEFAULT_PROD_HTTP_BROADCASTER_URLS
      : DEFAULT_DEV_HTTP_BROADCASTER_URLS
  )),
  credentials: {
    twelveDataRapidApiKey: getFromEnv(
      "TWELVE_DATA_RAPID_API_KEY",
      DEFAULT_TWELVE_DATA_RAPID_API_KEY
    ),
  },
  privateKeys: {
    arweaveJwk: getArweaveWallet(),
    ethereumPrivateKey: getFromEnv("ETHEREUM_PRIVATE_KEY"),
  }
});

import "dotenv/config";
import { JWKInterface } from "arweave/node/lib/wallet";
import { Manifest, NodeConfig } from "./types";
import { readJSON } from "./utils/objects";

const DEFAULT_ENABLE_PERFORMANCE_TRACKING = true;
const DEFAULT_ENABLE_JSON_LOGS = true;
const DEFAULT_PRINT_DIAGNOSTIC_INFO = true;
const DEFAULT_MANIFEST_REFRESH_INTERVAL = 120000;
const DEFAULT_TWELVE_DATA_RAPID_API_KEY = "";

const getFromEnv = <T>(envName: string, defaultValue?: any): T => {
  let valueFromEnv = process.env[envName];
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
  return valueFromEnv;
};

const getOptionallyManifestData = () => {
  const overrideManifestUsingFile = getFromEnv<string>(
    "OVERRIDE_MANIFEST_USING_FILE",
    null
  );
  if (!!overrideManifestUsingFile) {
    return readJSON(overrideManifestUsingFile) as Manifest;
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
    throw new Error(
      "Env ARWEAVE_KEYS_FILE_PATH or ARWEAVE_KEYS_JWK must be specified"
    );
  }
};

export const config: NodeConfig = Object.freeze({
  enableJsonLogs: getFromEnv<boolean>(
    "ENABLE_JSON_LOGS",
    DEFAULT_ENABLE_JSON_LOGS
  ),
  enablePerformanceTracking: getFromEnv<boolean>(
    "ENABLE_PERFORMANCE_TRACKING",
    DEFAULT_ENABLE_PERFORMANCE_TRACKING
  ),
  printDiagnosticInfo: getFromEnv<boolean>(
    "PRINT_DIAGNOSTIC_INFO",
    DEFAULT_PRINT_DIAGNOSTIC_INFO
  ),
  manifestRefreshInterval: Number(
    getFromEnv<number>(
      "MANIFEST_REFRESH_INTERVAL",
      DEFAULT_MANIFEST_REFRESH_INTERVAL
    )
  ),
  overrideManifestUsingFile: getOptionallyManifestData(),
  credentials: {
    twelveDataRapidApiKey: getFromEnv<string>(
      "TWELVE_DATA_RAPID_API_KEY",
      DEFAULT_TWELVE_DATA_RAPID_API_KEY
    ),
  },
  privateKeys: {
    arweaveJwk: getArweaveWallet(),
    ethereumPrivateKey: getFromEnv<string>("ETHEREUM_PRIVATE_KEY"),
  },
});

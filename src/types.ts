import { JWKInterface } from "arweave/node/lib/wallet";

export interface Manifest {
  txId?: string; // Note, you need to set this field manually (after downloading the manifest data)
  interval: number;
  priceAggregator: string;
  defaultSource?: string[];
  sourceTimeout: number;
  maxPriceDeviationPercent: number;
  evmChainId: number;
  tokens: { [symbol: string]: TokenConfig };
  enableArweaveBackup?: boolean;
}

export interface SourceTimeout {
  default: number;
  source: { [symbol: string]: number };
}

export interface Credentials {
  ethereumPrivateKey: string;
  twelveDataRapidApiKey?: string;
}

export interface TokenConfig {
  source?: string[];
  maxPriceDeviationPercent?: number;
  customUrlDetails?: CustomUrlDetails;
  comment?: string;
}

export interface CustomUrlDetails {
  url: string;
  jsonpath: string;
}

export interface FetcherOpts {
  credentials: Credentials;
  manifest: Manifest;
}

export interface Fetcher {
  fetchAll: (
    tokens: string[],
    opts?: FetcherOpts
  ) => Promise<PriceDataFetched[]>;
}

export interface Aggregator {
  getAggregatedValue: (
    price: PriceDataBeforeAggregation,
    maxPriceDeviationPercent: number
  ) => PriceDataAfterAggregation;
}

export interface Broadcaster {
  broadcast: (prices: PriceDataSigned[]) => Promise<void>;
  broadcastPricePackage: (
    pricePackage: SignedPricePackage,
    providerAddress: string
  ) => Promise<void>;
}

export interface PricesObj {
  [symbol: string]: number;
}

export interface PriceDataFetched {
  symbol: string;
  value: any; // usually it is a positive number, but it may also be 0, null, undefined or "error"
}

export interface PriceDataBeforeAggregation {
  id: string;
  symbol: string;
  source: { [sourceName: string]: any };
  timestamp: number;
  version: string;
}

export interface PriceDataAfterAggregation extends PriceDataBeforeAggregation {
  value: number;
}

export interface PriceDataBeforeSigning extends PriceDataAfterAggregation {
  permawebTx: string;
  provider: string;
}

export interface PriceDataSigned extends PriceDataBeforeSigning {
  evmSignature?: string;
  liteEvmSignature?: string;
}

export interface ShortSinglePrice {
  symbol: string;
  value: any;
}

export interface PricePackage {
  prices: ShortSinglePrice[];
  timestamp: number;
}

export interface SignedPricePackage {
  pricePackage: PricePackage;
  signerAddress: string;
  liteSignature: string;
}

export interface SerializedPriceData {
  symbols: string[];
  values: any[];
  timestamp: number;
}

export interface ArweaveTransactionTags {
  [tag: string]: string;
}

export interface NodeConfig {
  enableJsonLogs: boolean;
  printDiagnosticInfo: boolean;
  performanceTrackingLabelPrefix: string;
  manifestRefreshInterval: number;
  arweaveKeysFile?: string;
  arweaveKeysJWK?: JWKInterface;
  useManifestFromSmartContract: boolean;
  addEvmSignature: boolean;
  manifestFile: string;
  minimumArBalance: number;
  credentials: Credentials;
  httpBroadcasterURLs: string[];
  enableStreamrBroadcaster: boolean;
  disableSinglePricesBroadcastingInStreamr: boolean;
  omitSourcesInArweaveTx: boolean;
}

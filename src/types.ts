export interface Manifest {
  txId?: string; // note: this fiels is set by smart contract while downloading active manifest content
  interval: number;
  priceAggregator: string;
  defaultSource?: string[];
  sourceTimeout: number;
  maxPriceDeviationPercent: number,
  evmChainId: number,
  tokens: { [symbol: string]: TokenConfig };
};

export interface SourceTimeout {
  default: number;
  source: { [symbol: string]: number };
};

export interface Credentials {
  infuraProjectId?: string;
  barchartApiKey?: string;
  ethereumPrivateKey: string;
};

export interface TokenConfig {
  source?: string[];
  maxPriceDeviationPercent?: number;
};

export interface Fetcher {
  fetchAll: (
    tokens: string[],
    opts?: {
      credentials: Credentials;
    }) => Promise<PriceDataFetched[]>;
};

export interface Aggregator {
  getAggregatedValue:
    (price: PriceDataBeforeAggregation, maxPriceDeviationPercent: number) => PriceDataAfterAggregation;
};

export interface Broadcaster {
  broadcast: (prices: PriceDataSigned[]) => Promise<void>;
  broadcastPricePackage: (
    pricePackage: SignedPricePackage,
    providerAddress: string) => Promise<void>;
};

export interface PriceDataFetched {
  symbol: string;
  value: number;
};

export interface PriceDataBeforeAggregation {
  id: string;
  symbol: string;
  source: { [sourceName: string]: number };
  timestamp: number;
  version: string;
};

export interface PriceDataAfterAggregation extends PriceDataBeforeAggregation {
  value: number;
};

export interface PriceDataBeforeSigning extends PriceDataAfterAggregation {
  permawebTx: string;
  provider: string;
};

export interface PriceDataSigned extends PriceDataBeforeSigning {
  signature: string;
  evmSignature?: string;
};

export interface ShortSinglePrice {
  symbol: string;
  value: number;
};

export interface PricePackage {
  prices: ShortSinglePrice[];
  timestamp: number;
};

export interface SignedPricePackage {
  pricePackage: PricePackage;
  signer: string;
  signature: string;
};


export interface ArweaveTransactionTags {
  [tag: string]: string,
};

export interface NodeConfig {
  arweaveKeysFile: string;
  useManifestFromSmartContract?: boolean;
  addEvmSignature?: boolean;
  manifestFile: string;
  minimumArBalance: number;
  credentials: Credentials;
}

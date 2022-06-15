const baseManifest = {
  interval: 2000,
  priceAggregator: "median",
  sourceTimeout: 3000,
  maxPriceDeviationPercent: 25,
  evmChainId: 1,
};

export const MOCK_MANIFEST = {
  ...baseManifest,
  tokens: {
    "BTC": {
      "source": [
        "bitfinex",
        "ftx"
      ]
    },
    "ETH": {
      "source": [
        "binance",
        "bitfinex"
      ]
    },
    "USDT": {
      "source": [
        "ftx",
        "binance"
      ]
    }
  }
};

export const MOCK_NODE_CONFIG = {
  isProd: false,
  enableJsonLogs: false,
  printDiagnosticInfo: false,
  performanceTrackingLabelPrefix: "public",
  manifestRefreshInterval: 120000,
  useManifestFromSmartContract: false,
  manifestFromFile: MOCK_MANIFEST,
  privateKeys: {
    arweaveJwk: { e: "e", kty: "kty", n: "n" },
    ethereumPrivateKey: "0x1111111111111111111111111111111111111111111111111111111111111111"
  },
  minimumArBalance: 0.2,
  enableStreamrBroadcaster: false,
  httpBroadcasterURLs: ["http://localhost:9000"],
  disableSinglePricesBroadcastingInStreamr: true,
  omitSourcesInArweaveTx: true,
  credentials: {}
};

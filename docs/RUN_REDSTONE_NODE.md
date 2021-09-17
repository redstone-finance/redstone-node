# Run node locally

## Prerequisites
- Node.js (v14 or higher) and `yarn`
- Arweave wallet (> 0.1AR)

## Prepare
### 1. Install dependencies
```bash
yarn install
```

### 2. Preare manifest
Manifest is a public JSON file that defines the provider's obligation regarding the data that they provide. It sets fetching interval, tokens, sources and other public technical details for the provided data.

There are 2 options for loading manifest in the redstone-node:
1. Loading from JSON file. This option is preferred for local runs and experiments
2. Loading from [SmartWeave contracts](./DEPLOY_MANIFEST_ON_ARWEAVE.md)

You can use any of our [ready-to-use manifests](../manifests).
For example:
- [main.json](../manifests/main.json) - 1000+ tokens, used by the main redstone provider
- [rapid.json](../manifests/rapid.json) - 10 most popular tokens, used by `redstone-rapid` provider
- [coinbase.json](../manifests/coinbase.json) - 20 tokens, uses only coinbase fetcher

If you want to create your own manifest [read this guide.](./PREPARE_MANIFEST.md)

### 3. Preare config file
Config file is a **private** file created by provider. It contains the following details required by the redstone-node:
| Param                                 | Optionality | Description                                                                 |
|---------------------------------------|-------------|-----------------------------------------------------------------------------|
| arweaveKeysFile                       | required    | path to the arweave wallet                                                  |
| minimumArBalance                      | required    | minimum AR balance required to run the node                                 |
| useManifestFromSmartContract          | optional    | if set to  `true` , manifest will be loaded from Arweave Smart Contracts    |
| manifestFile                          | optional    | path to the manifest file                                                   |
| addEvmSignature                       | optional    | if set to `true`, EVM signature will be added to each price for each asset  |
| credentials                           | required    | object with credentials for APIs and private keys                           |
| credentials.ethereumPrivateKey        | required    | Ethereum private key that will be used for price data signing               |
| credentials.yahooFinanceRapidApiKey   | optional    | API key for the `api-dojo-rapid` fetcher                                    |

You should create your config file] and place it inside the `.secrets` folder.
To read more about config file creation [read this guide](./PREPARE_CONFIG.md)

## Run

### Local run
```bash
yarn start:dev --config <PATH_TO_CONFIG>
```

### Run in docker
You can run a local redstone-node in docker.

1. Build a docker container with redstone-node
```bash
```

2. Run docker container
```bash
```

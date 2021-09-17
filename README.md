# redstone-node

RedStone Node is a core module in the RedStone ecosystem, which is responsible for fetching data from different sources and broadcasting it to the Arweave blockchain and the RedStone cache layer.

## 📖 Main concepts
| Concept | Description |
|---|---|
| Provider | An entity that fetches the data from external APIs, transforms it to a standard format, and persists collected information in the Redstone data ecosystem |
| Fetcher (source) | A module responsible for fetching the data from an external API. Examples: [coinbase fetcher](/src/fetchers/coinbase), [ecb fetcher](/src/fetchers/ecb/EcbFetcher.ts) |
| Manifest | Public JSON file that defines the provider's obligation regarding the data that they provide. It sets fetching interval, tokens, sources and other public technical details |
| Config | **Private** configuration file created by provider |
| Signer | A module responsible for data signing. Examples: EvmPriceSigner, ArweavePriceSigner |
| Aggregator | A module responsible for aggregating the data fetched from different sources. Median aggregator is used by default, it gets the median value.  |
| Broadcaster | A module responsible for broadcasting the signed data. Currently it send the data to the RedStone cache layer. |

## 📜 Instructions
- [Running the node](docs/RUN_REDSTONE_NODE.md)
- [Prepare config file](docs/PREPARE_CONFIG.md)
- [Prepare manifest](docs/PREPARE_MANIFEST.md)
- [Add new source](docs/ADD_NEW_SOURCE.md)
- [Add new token](docs/ADD_NEW_TOKEN.md)
- [Publish to NPM](docs/PUBLISH_TO_NPM.md)
- [Deploy manifest on Arweave](docs/DEPLOY_MANIFEST_ON_ARWEAVE.md)

## 👨‍💻 Development and contributions
We encourage anyone to build and test the code and we welcome any issues with suggestions and pull requests.

### Installing the dependencies
```bash
yarn install
```

### Running the tests
```bash
yarn test
```

### Building typescript to javascript
```bash
yarn build
```

## 🙋‍♂️ Need help?
Please feel free to contact us [on Discord](https://redstone.finance/discord) if you face any problems.

## 📜 License
This software is licensed under the MIT © Redstone

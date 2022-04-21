# How to prepare a config file

Config environment variable is a stringified json created by provider. It contains the following details required by the redstone-node:

| Param | Optionality | Description |
|---|:---:|---|
| arweaveKeysJWK | required | arweave wallet JWK |
| minimumArBalance | required | minimum AR balance required to run the node |
| useManifestFromSmartContract | optional | if set to true , manifest will be loaded from Arweave Smart Contracts |
| manifestFile | optional | path to the manifest file |
| addEvmSignature | optional | if set to true, EVM signature will be added to each price for each asset |
| credentials | required | object with credentials for APIs and private keys |
| credentials.ethereumPrivateKey | required | Ethereum private key that will be used for price data signing |
| credentials.yahooFinanceRapidApiKey | optional | API key for the api-dojo-rapid fetcher |


You should create stringified json and provide it as environment variable to docker image or local node.

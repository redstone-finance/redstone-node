# RedStone oracle technical doc

- [RedStone oracle technical doc](#redstone-oracle-technical-doc)
  * [Introduction](#introduction)
    + [Overview](#overview)
      - [Problem Statement (Defi Pain points)](#problem-statement--defi-pain-points-)
      - [Solution](#solution)
    + [Top level view](#top-level-view)
  * [System architecture](#system-architecture)
    + [Modules](#modules)
      - [External integrations (blue)](#external-integrations--blue-)
      - [Stakeholders (red)](#stakeholders--red-)
      - [RedStone modules (purple)](#redstone-modules--purple-)
    + [Token design](#token-design)
      - [Usage of the token](#usage-of-the-token)
        * [Data access fees](#data-access-fees)
        * [Staking](#staking)
        * [Dispute resolution](#dispute-resolution)
        * [Bootstrapping market](#bootstrapping-market)
  * [RedStone Node](#redstone-node)
    + [Node architecture](#node-architecture)
      - [Top level view](#top-level-view-1)
      - [Process view](#process-view)
    + [Codebase structure](#codebase-structure)
    + [Data format](#data-format)
      - [JSON ticker](#json-ticker)
      - [Arweave transaction](#arweave-transaction)
        * [Transaction tags](#transaction-tags)
        * [Transaction data](#transaction-data)
    + [Running a node](#running-a-node)
      - [Prerequisites](#prerequisites)
      - [Prepare](#prepare)
        * [1. Install dependencies](#1-install-dependencies)
        * [2. Prepare manifest](#2-prepare-manifest)
        * [3. Prepare config file](#3-prepare-config-file)
      - [Run](#run)
        * [Local run](#local-run)
        * [Run in docker](#run-in-docker)
      - [Verify](#verify)
        * [1. Save prices on Arweave](#1-save-prices-on-arweave)
        * [2. Broadcast signed prices to the RedStone cache layer (RedStone API)](#2-broadcast-signed-prices-to-the-redstone-cache-layer--redstone-api-)
        * [Node monitoring](#node-monitoring)
    + [Environments](#environments)
      - [How to configure environments](#how-to-configure-environments)
        * [Using environment variables](#using-environment-variables)
        * [Other environment variables](#other-environment-variables)
        * [Configure in Docker](#configure-in-docker)
    + [Performance tracking](#performance-tracking)
    + [Testing](#testing)
    + [Connecting custom data](#connecting-custom-data)
      - [Add new source / fetcher](#add-new-source---fetcher)
        * [Select a name for the new source](#select-a-name-for-the-new-source)
        * [Implementation](#implementation)
          + [Implement source (fetcher)](#implement-source--fetcher-)
          + [Implement tests](#implement-tests)
        * [Manifest(s)](#manifest-s-)
        * [Sources config [optional]](#sources-config--optional-)
          + [Should I do this?](#should-i-do-this-)
          + [How to add a source to config](#how-to-add-a-source-to-config)
      - [Add new asset](#add-new-asset)
        * [How to add a token](#how-to-add-a-token)
  * [Providers registry](#providers-registry)
    + [RedStone contracts](#redstone-contracts)
    + [Deploying new manifest](#deploying-new-manifest)
  * [Node monitoring tools](#node-monitoring-tools)
  * [RedStone cache layer (RedStone API)](#redstone-cache-layer--redstone-api-)
    + [Implementation](#implementation-1)
    + [Testing](#testing-1)
    + [Running your own cache layer](#running-your-own-cache-layer)
  * [ArGue - Dispute resolution protocol [to be implemented]](#argue---dispute-resolution-protocol--to-be-implemented-)
    + [Introduction](#introduction-1)
    + [Dispute process](#dispute-process)
      - [1. Pre dispute](#1-pre-dispute)
      - [2. Opening dispute](#2-opening-dispute)
      - [3. Voting](#3-voting)
      - [4. Verdict](#4-verdict)
      - [5. Appeal](#5-appeal)
      - [6. Settlement](#6-settlement)
    + [Dispute parameters](#dispute-parameters)
    + [Architecture](#architecture)
    + [Challenges](#challenges)
      - [Low turnout](#low-turnout)
      - [Vote buying](#vote-buying)
      - [Jurors selection](#jurors-selection)
      - [Privacy](#privacy)
  * [Accessing data](#accessing-data)
    + [DeFi protocols](#defi-protocols)
    + [Web integrations](#web-integrations)
      - [RedStone Web App](#redstone-web-app)
      - [RedStone API](#redstone-api)
        * [HTTP Api](#http-api)
        * [NPM module](#npm-module)
    + [Arweave](#arweave)
  * [Need help?](#need-help-)

## Introduction

### Overview
Redstone is a data ecosystem that should deliver fast and accurate financial information in a decentralised fashion.

#### Problem Statement (Defi Pain points)
- It is very expensive to put all the pricing data on-chain (it cost more than 2m to do it for Ethereum Defi with Chainlink)
- To reduce costs current providers cover only a small subset of tokens (Chainlink: 25) and have low update frequency (Chainlink: 10m)
- DeFi protocols cannot expand beyond a small set of assets and cannot offer advanced solutions like margin lending (which require higher update frequency)

#### Solution
- Leverage Arweave blockchain as a cheap and permanent storage
- Use token incentives to motivate data providers to maintain data integrity and the uninterrupted service
- Use signed meta-transactions to deliver prices on-chain

### Top level view
The ecosystem could be divided into 3 main areas:

- **Data provision** responsible for fetching the data from external api, transforming to a common format, and persisting collected information.
  - Implemented as → [RedStone Node](https://github.com/redstone-finance/redstone-node)
- **Data access** responsible for serving data to end user by various means including web portal, http api, discord bots, on-chain feeds or 3rd party applications (like spreadsheet extensions)
  - Web portal → [RedStone App](https://github.com/redstone-finance/redstone-app)
  - HTTP Api → [RedStone Api](https://github.com/redstone-finance/redstone-api)
  - Bots → [Examples](https://github.com/redstone-finance/redstone-api/tree/main/examples/discord-bots)
- **Data integrity** responsible for enforcing high quality of data by incentivising providers with tokens for keeping their service and punishing them for outage and misrepresented data
  - Concept → [Argue protocol](https://github.com/redstone-finance/redstone-node/blob/main/docs/DISPUTE_RESOLUTION.md)


## System architecture

### Modules

![redstone system architecture](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-system-architecture.png)

#### External integrations (blue)
- **Data sources** - provide data (like price information) via API
- **DeFi protocols** - consume aggregated and attested data
- **Web integrations** - utilise provided data to power apps like blockchain wallets, portfolio browsers, defi analytics sites

#### Stakeholders (red)
- **Data providers** - need to register with token stake and operate RedStone node which process and attest data
- **End users** - may browse pricing data and select providers using the web portal
- **Juries** - protect data integrity deciding if a price was manipulated

#### RedStone modules (purple)
- **RedStone node** - fetches data from external sources via api, aggregates and attest information with a cryptographic key, broadcast the results and persist them on the Arweave blockchain
- **Data cache** - a module that holds data and makes it available to interested parties. Multiple services might implement it on various infrastructure to increase availability. It should achieve minimum latency and scale to handle large volume of requests
- **Smart contracts api** - it provides the data to on-chain protocols. Initially, we cover Arweave and EVM (ethereum) infrastructure. It minimizes the running (gas) costs and verifies signed data on-chain
- **HTTP api** - web based that serves information via REST api. It can power websites, node-js scripts and social media bots. There will be a dedicated java script wrapper that will abstract request formatting and error handling to make service easier to integrate
- **Providers registry** - an Arweave smart contract that manages provider's token stake, holds the manifest (SLA of pricing data) and allows checking historical performance (showing any data inconsistency and downtime)
- **Dispute resolution protocol** - a set of Arweave contracts allowing to challenge any existing pricing feed, and managing the dispute process enabling juries to vote for the verdicts
- **Web portal** - a web application that is an interface to browse data, check providers' statistics, see historical feeds with an option to raise a dispute and participate in the voting process

### Token design

The token facilitates providing reliable and accurate information to blockchain networks from the external world.

#### Usage of the token
Tokens are proven to be a very useful tool for achieving coordination in the distributed systems and aligning incentives of various actors. RedStone token facilitates data sharing ecosystem incentivising participants to produce, publish and validate data in a continuous and diligent way.

##### Data access fees
The end users who benefit from access to valuable information use tokens to reward providers that published these data. The exact fee and the subscription terms are at the discretion of the provider and depend on their effort, demand for data and potential competition.

##### Staking
Every provider needs to publish a Service Level Agreement describing the scope of data being served, the source of information, and the frequency of updates. In case a provider breach the terms of service, there will be a penalty applied which is also denominated in tokens. In order to assure users that any further claims could be fully covered, providers need to put aside a certain amount of token and lock it for a period of time. These funds are labelled as a stake in the ecosystem and are an important factor for users to select the most reliable provider. 

##### Dispute resolution
Because of the diverse nature of provided information, it will not always be possible to decide if a data was corrupted. Therefore, it will be necessary to have fallback procedure to resolve any disputes about data quality. The process could be facilitated by tokens when juries will be rewarded for voting alongside the majority and punished for supporting a losing side.

##### Bootstrapping market
At the early stage of development, the token could be distributed to providers to reward their availability and bootstrap the market before there is enough demand coming for data users.

![redstone token design](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-token-design.png)

## RedStone Node
RedStone Node is a core module in the [RedStone ecosystem](docs/REDSTONE_ECOSYSTEM.md), which is responsible for fetching data from different sources and broadcasting it to the Arweave blockchain and the RedStone cache layer.

You can find the implementation of the redstone node in the [github.com/redstone-finance/redstone-node](https://github.com/redstone-finance/redstone-node) repository.

### Node architecture

#### Top level view
In a cycle, we perform 3 major activities:
- **Data fetching** - gathering information from external sources
- **Data processing** - aggregating data and attesting with signature
- **Data broadcasting** - publishing data to users and persisting it on-chain

#### Process view
This component fetches pricing data and makes it available to end users. The process consists of the following steps:
- **Data fetching** - getting data from public or private api and transforming it the standard format
- **Data aggregation** - combining data from multiple sources to produce a single feed using median or volume weighted average
- **Data attestation** - signing data with the provider's cryptographic key
- **Data broadcasting** - publishing the data on publically available message board (like public firebase store)
- **Data persistence** - securing packaged data on the Arweave blockchain

![redstone-node](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-node.png)
### Codebase structure
Each group of subcomponent implements a generic interface and is inter-changable with other implementations:
- **Fetchers:** connect to external api, fetch the data and transform it to the standard form <em>Examples: coingecko-fetcher, uniswap-fetcher</em>
- **Aggregators:** take values from multiple sources and aggregate them in a single value <em>Examples: median-aggregator, volume-weighted-aggregator</em>
- **Signers:** sign the data with the provided private keys <em>Examples: ArweaveSigner, EthSigner</em>
- **Broadcasters**: publish the data and signature <em>Examples: FirebaseBroadcaster, SwarmBroadcaster</em>
- **Runner:** execute the entire process in a loop

You can see a standard flow of the node iteration on the diagram below:
<br />
<br />
![node running detailed](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/node-running-detailed.png)

Currently, the price value is aggregated using default `median-aggregator`. It works in the following way:
<br />
<br />
![median-aggregator](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/median-aggregator.png)

### Data format

#### JSON ticker
The price (ticker) is represented as a single JSON object
```js
{
  "id": "6a206f2d-7514-41df-af83-2acfd16f0916",
  "source": {"coingecko": 22.05, "uniswap": 22.03, "binance": 22.07},
  "symbol": "LINK",
  "timestamp": 1632485695162,
  "version": "0.4",
  "value": 22.05,
  "permawebTx":"g3NL...", // id of Arweave tx that includes this ticker
  "provider": "I-1xz...", // Address of the provider's arweave wallet
  "signature": "0x...",
  "evmSignature": "0x..."
}
```

#### Arweave transaction
Price tickers are aggregated per provider and timestamp and persisted on the Arweave chain. The provider is the tx sender.

##### Transaction tags
```js
{
  "app": "Redstone",
  "type": "data",
  "version": "0.4",
  "Content-Type": "application/json",
  "Content-Encoding": "gzip",
  "timestamp": 1632485616172,
  "AR": 45.083730599999996
}
```

##### Transaction data
We encrypt transaction data using [gzip algorithm](https://www.gzip.org/) to minimize transactions cost. We don't store signature for each price on the Arweave blockchain, because each transaction is already signed using default Arweave transaction signer.
```js
[
  {
    "id":"a890a16a-ef4a-4e45-91fa-0e4e70f28527",
    "source":{
      "ascendex":41415.797549999996,
      "bequant":41437.738515,
      ...
    },
    "symbol":"BTC",
    "timestamp":1632486055268,
    "version":"0.4",
    "value":41416.892911897245
  },
  {
    "id":"81f8c1cc-5472-4298-9d9d-ea48b226c642",
    "source":{
      "ascendex":2820.8997449999997,
      "bequant":2823.8562225,
      ...
    },
    "symbol":"ETH",
    "timestamp":1632486055268,
    "version":"0.4",
    "value":2821.3399649999997
  },
  ...
]
```
### Running a node
#### Prerequisites
- Node.js (v14 or higher) and `yarn`
- Arweave wallet (> 0.1AR)
#### Prepare
##### 1. Install dependencies
```bash
yarn install
```

##### 2. Prepare manifest
Manifest is a public JSON file that defines the provider's obligation regarding the data that they provide. It sets fetching interval, tokens, sources and other public technical details for the provided data.

There are 2 options for loading manifest in the redstone-node:
1. Loading from JSON file. This option is preferred for local runs and experiments
2. Loading from [SmartWeave contracts](./DEPLOY_MANIFEST_ON_ARWEAVE.md)

You can use any of our [ready-to-use manifests](../manifests).
For example:
- [main.json](../manifests/main.json) - 1000+ tokens, used by the main redstone provider
- [rapid.json](../manifests/rapid.json) - 10 most popular tokens, used by `redstone-rapid` provider
- [coinbase.json](../manifests/coinbase.json) - 20 tokens, uses only coinbase fetcher

You can also prepare your own manifest and place it inside the `manifests` folder. The manifest file should be named using kebab case, i.e: `manifest.json`, `good-manifest.json`, or `your-source.json`.

You can also publish your manifest to the Arweave smart contracts.

Here is the structure of the manifest file:
| Param | Optionality | Type | Description |
|---|---|---|---|
| interval | required | Number | Data fetching interval in milliseconds |
| priceAggregator | required | String | Aggregator id. Currently only `median` aggregator is supported |
| defaultSource | optional | String[] | Array of fetcher names that will be used by default for tokens that have no specified sources |
| sourceTimeout | required | Number | Default timeout in milliseconds for sources |
| maxPriceDeviationPercent | required | Number | Default maximum price deviation percent for tokens. It may also be set for each token separately |
| evmChainId | required | Number | EVM chain id, that will be used during EVM price signing. Pass `1` if you're not sure, it will point to the Ethereum Mainnet.  |
| tokens | required | Object | Object with tokens in the following format: `{ "TOKEN_SYMBOL": { "source": ["source-name-1", "source-name-2", ...], "maxPriceDeviationPercent": 25 }, ...  }`. Note that `source` and `maxPriceDeviationPercent` params per token are optional. This is also a correct tokens configuration: `{ "TOKEN_SYMBOL_1": {}, "TOKEN_SYMBOL_2": {} }` |

You can find a list of available sources along with its stability details in the RedStone Web app: [app.redstone.finance/#/app/sources.](https://app.redstone.finance/#/app/sources)

![sources screenshot](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/sources-screenshot.png)

##### 3. Prepare config file

Config file is a **private** file created by provider. It contains the following details required by the redstone-node:

| Param | Optionality | Description |
|---|:---:|---|
| arweaveKeysFile | required | path to the arweave wallet (for relative paths it assumes that you are in the project root folder) |
| minimumArBalance | required | minimum AR balance required to run the node |
| useManifestFromSmartContract | optional | if set to true , manifest will be loaded from Arweave Smart Contracts |
| manifestFile | optional | path to the manifest file |
| addEvmSignature | optional | if set to true, EVM signature will be added to each price for each asset |
| credentials | required | object with credentials for APIs and private keys |
| credentials.ethereumPrivateKey | required | Ethereum private key that will be used for price data signing |
| credentials.yahooFinanceRapidApiKey | optional | API key for the api-dojo-rapid fetcher |

You should place your config file inside the `.secrets` folder, which is included in `.gitignore`. You should **never publish this file.**
#### Run

##### Local run

```bash
yarn start --config PATH_TO_YOUR_CONFIG
```

We recommend redirecting output to some log file(s), for example:
```bash
yarn start --config PATH_TO_YOUR_CONFIG > my-redstone-node.logs 2> my-redstone-node.error.logs
```

You can also enable JSON mode for logs to simplify the log analysing later.
To do this append `ENABLE_JSON_LOGS=true` to the node running command:

```bash
ENABLE_JSON_LOGS=true yarn start --config PATH_TO_YOUR_CONFIG > my-redstone-node.logs 2> my-redstone-node.error.logs
```

##### Run in docker
You can run a local redstone-node in docker.

1. Prepare your Dockerfile based on [./Dockerfile](../Dockerfile).
Name it `Dockerfile.my-redstone-node` and place in the project root folder.

2. Build a docker container with redstone-node
```bash
docker build -f Dockerfile.my-redstone-node -t my-redstone-node .
```

3. Run the docker container
```bash
docker run -it my-redstone-node
```
#### Verify
There are 2 main things that your node needs to do:
##### 1. Save prices on Arweave
To verify if prices are being saved on Arweave, navigate to [https://viewblock.io/arweave/address/YOUR_ADDRESS.](https://viewblock.io/arweave/address/YOUR_ADDRESS)
You should see some transactions with tag `app` and value `Redstone` ~20 minutes after the node running.
##### 2. Broadcast signed prices to the RedStone cache layer (RedStone API)
You can simply open this URL [https://api.redstone.finance/prices?provider=YOUR_ADDRESS](https://api.redstone.finance/prices?provider=YOUR_ADDRESS) in browser and see if it returns signed data. Don't forget to replace `YOUR_ADDRESS` with your Arweave wallet address

##### Node monitoring
We've also implemented an automated monitoring system for nodes. It will be described below in the `Node monitoring tools` section.
### Environments
RedStone node environments (modes) help to differentiate node configuration for different purposes.

There are 2 main environments, that are already created in the RedStone node:
- PROD (should be used for real long-term node deployment)
- LOCAL (should be used for tests, development and experiments)

Production environment automatically enables services, that are not useful in local environment, such as:
- error reporting
- performance tracking
- publishing on Arweave

#### How to configure environments

##### Using environment variables
Environments can be configured using environment variable `MODE`. Set it to `PROD` to run redstone node in production environment or to `LOCAL` to run redstone node locally.

##### Other environment variables
- **ENABLE_JSON_LOGS** - set this variable to `true` to enable logging in JSON format. It is recommended to set it to `true` if you run the node in production environment.
- **PERFORMANCE_TRACKING_LABEL_PREFIX** - human-friendly name that will be appended to the performace tracking labels. (Examples: `main` for `redstone` provider, `stocks` for `redstone-stocks`, `rapid` for `redstone-rapid` provider)

##### Configure in Docker
Dockerfiles are used to build docker images, which are usually executed in Production environment. To configure production environment `ENV` instruction should be added to a Dockerfile.
```dockerfile
ENV MODE=PROD
ENV ENABLE_JSON_LOGS=true
ENV PERFORMANCE_TRACKING_LABEL_PREFIX=stocks
```
### Performance tracking
Performance tracking is enabled in production environment and tracks by default all of the most important processes during each nde iteration. Currently we save perofmance data in AWS cloudwatch, where it can be analysed using convenient chart tool:

![performance chart](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/performance-chart.png)

We track performance for the following processes:
- processing-all
- balance-checking
- fetching-all
- fetching-[SOURCE_NAME]
- signing
- broadcasting
- package-broadcasting
- transaction-preparing
- arweave-keeping

If you set `PERFORMANCE_TRACKING_LABEL_PREFIX` environment variable, its value will be appended to the performance tracking labels (for example: `rapid-processing-all` for `PERFORMANCE_TRACKING_LABEL_PREFIX=rapid`)
### Testing
We use jest framework for automated testing. Test files are located in the `test` folder. We test each fetcher separately (fetchers tests are located in the `test/fetchers` folder). We also have integration tests in the `test/integration` folder and tests for separate modules: - EvmPriceSigner
- ManifestParser
- median-aggregator
- PricesService

You can run the tests in the following way:
```bash
yarn test
```

### Connecting custom data
#### Add new source / fetcher
We will use words `source` and `fetcher`. Сonsider them to be synonymous.

##### Select a name for the new source
First, you should select a name for your source.
It should use kebab case, for example: `source`, `good-source`, `the-best-source`.
Source name must be unique, because it will unambiguously identify your source.

##### Implementation
###### Implement source (fetcher)
Create a folder with a name of your fetcher in [src/fetchers](../src/fetchers).
Place the code of your fetcher inside of this folder and update [src/fetchers/index.ts](../src/fetchers/index.ts) file to export your source. For more information check out [BaseFetcher](../src/fetchers/BaseFetcher.ts) code and implementation of other fetchers, like [coingecko](../src/fetchers/coingecko/CoingeckoFetcher.ts), [coinbase](../src/fetchers/coinbase), and [ecb](../src/fetchers/ecb/EcbFetcher.ts).

###### Implement tests
We strongly recommend to implement tests for your fetcher. It's generaly a good practice and it will help you to avoid silly bugs in your code. You can find examples of tests for other fetchers in the [test/fetchers](../test/fetchers) folder.

##### Manifest(s)
- Create a manifest with the name of the newly added fetcher and place it in the [manifests](../manifests) folder
- [Optional] If the source should be used in the main redstone provider, run `node tools/manifest/generate-main-manifest.js`

##### Sources config [optional]
###### Should I do this?
Sources config file is used in the RedStone web app. If you want your source to be visible there you should add it to config and update the app appropriately.

###### How to add a source to config
- Add source details to the `tools/config/predefined-configs/sources.json` file
- Run `yarn build`. It is required by `generate-sources-config.js` so it can work correctly
- Run `node tools/config/generate-sources-config.js` to generate sources config. It will be saved to `src/config/sources.json`
- Download logo for the newly created source
  - You can simply download it in browser and save as `<SOURCE_NAME>.<IMG_EXTENSTION>`
  - Or you can run `node tools/cdn-images/download-source-logos.js`, but it will download logos for all sources
- Upload the source logo to RedStone CDN (manually through AWS S3 web interface)
- Run `node tools/cdn-images/update-sources-config.js` to replace logo urls in sources config with redstone CDN urls
- Update `redstone-node` dependency in redstone-app for being able to use the new source config file
#### Add new asset
Tokens config file, which is located in `src/config/tokens.json`, is used in RedStone web app and `redstone-api`. If you want your token to be accessible through `redstone-api` npm module you should add it to the config.

##### How to add a token
- Add token details to `tools/config/predefined-configs/tokens.json`
- Run `node tools/config/add-new-tokens-from-predefined-config.js`
- Upload the token logo to RedStone CDN, so it is publicly accessible at `https://cdn.redstone.finance/symbols/<TOKEN_NAME_LOWER_CASE>.<IMG_EXTENSION></IMG_EXTENSION>`
- Run `node tools/cdn-images/update-tokens-config.js` to replace logo urls in tokens config with redstone CDN urls
- Update `redstone-node` dependency in `redstone-api`, `redstone-app` and other packages where `tokens.json` is used.


## Providers registry
Providers registry is an Arweave smart contract that manages provider's token stake, holds the manifest (SLA of pricing data) and allows checking historical performance (showing any data inconsistency and downtime).

### RedStone contracts
You can find the source code of providers registry smart contracts in the [github.com/redstone-finance/redstone-smartweave-contracts](https://github.com/redstone-finance/redstone-smartweave-contracts) repo.

### Deploying new manifest
- place your JWK key in .secrets/redstone-jwk.json
- run the following command `node src/tools/providers-registry.api.js addManifest "<PATH_TO_MANIFEST>" "<UPDATE_COMMENT>" 0 false`

## Node monitoring tools
It's insanely important for oracles to provide high quality data without interruptions.
So, the node operators need to monitor their nodes and immediately fix any potential problems.

That's why we've implemented a special app [redstone-node-monitoring](https://github.com/redstone-finance/redstone-node-monitoring), which is executed in a loop and automatically verifies if a selected node regularly publishes new data to the RedStone cache layer and the Arweave blockchain. In each loop iteration multiple checkers are executed. And if any of these checkers fail then the error is reported.

![node monitoring](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/node-monitoring.png)

**Checker** - a module responsible for data intergtity checking. It can check the number of saved data points during last 5 minutes or the timestamp of the latest saved data point.

Implemented checkers:
- **ArPriceReturnedRedstoneRapid**
- **ArPriceReturned**
- **ArweaveTimestampDelay**
- **HistoricalPricesReturned**
- **StockPricesReturnedRedstoneStocks**
- **TimestampIsCloseToNowRedstoneRapid**
- **TimestampIsCloseToNow**

**Reporter** - a module responsible for error/warning reporting. For example, it can notify a node operator via email, SMS or discord. It can also save a notification to a text file. Currently we send email notifications to our developer team and save logs in AWS Cloudwatch.

You can find more details about running or extending this monitoring service in the [redstone-node-monitoring](https://github.com/redstone-finance/redstone-node-monitoring) GitHub repo.


## RedStone cache layer (RedStone API)
### Implementation
The codebase of the Redstone Cache layer is located in the [github.com/redstone-finance/redstone-cache-layer](https://github.com/redstone-finance/redstone-cache-layer) repo. It is a Node.js Express app, which allows to save and query signed data points (currently  pricing for assets) in MongoDB.

### Testing
We always implement tests for all the core modules of the RedStone ecosystem, including the cache layer app. You can run tests in the following way:
```bash
# Install dependencies
yarn install

# Run tests
yarn test
```

### Running your own cache layer
We run our instance of the cache layer on AWS. However, it can be deployed on GCP, Azure, Heroku or any other service. You should set up a mongoDB instance (the simplest way to do this is using [Mongo Atlas](https://www.mongodb.com/cloud)). Then you should place .secrets.json file into the root folder of the repo and run the app using `yarn dev` command.

## ArGue - Dispute resolution protocol [to be implemented]
### Introduction
Decentralised data feeds have many advantages over centralised competitors. They are more secure, lacking a central point of failure and more censorship-resilient because of diversified governance. However, it’s not trivial to manage data integrity and accuracy without a central point of control.

ARgue protocol enables high data integrity preserving the benefits of keeping a fully decentralised and diverse set of data providers. Users are incentivised to report problems with data quality by opening a dispute. Disputes are resolved by a panel of jurors who vote by staking tokens. The consensus is based on the majority rule, where voters are rewarded for voting alongside others and penalised for being outliers.

The majority rule is the most common strategy for reaching coordination in a decentralised environment. It was researched as a part of game theory studies in the 60s, and the current implementations are based on the work of Thomas Schelling and his idea of the focal point described in the book Strategy and Conflict.

One of the adaptations of this idea was drafted by Vitalik Buterin in 2014 as a Schelling Coin concept. It was also proposed as an architecture for the Ethereum Price Feeds: “For financial contracts for difference, it may actually be possible to decentralize the data feed via a protocol called SchellingCoin” (from the Ethereum whitepaper). However, the network congestion, high gas price and the extreme storage cost of the Ethereum Virtual Machine rendered the solution impractical at the current level of technology.

New generations of blockchains like Arweave could finally make the implementation of Schelling-point based algorithms economically feasible due to the cheaper storage and low contracts execution cost. The challenging part is setting the system parameters to keep the user friction as low as possible and reduce the voting requirement voting while maintaining the high quality of decisions. Hopefully, the recent simulations done by the Redstone team prove that even a small percentage of expert jurors could produce high-quality results when the incentives are properly set up (see the simulations of TCR-based decision model presented during EdCon Paris 2019).

### Dispute process
The dispute is a multi-stage process that involves two main counter-parties: a challenger, who initiates the dispute, a provider, who originated the challenged data entry and a jury panel that makes the final decision. The actors are incentivised to participate with potential token rewards. All of the stages of the process are described below:

#### 1. Pre dispute
A data provider may deposit collateral as a signal to the users that there is a strong financial commitment to maintaining the quality of data. The higher the collateral means the higher potential reward for the challenger but it also translates into a higher fee to open a dispute.

#### 2. Opening dispute
Anyone could open a dispute providing he can deposit an initial stake which is proportional to the provider’s deposit. There is also a minimum stake value introduced to avoid spamming. The challenger stake is locked until the dispute is settled.

#### 3. Voting
Jurors vote by staking their tokens either to support or reject the dispute. The maximum amount of tokens that could be staked is limited by their an additional parameter called voting capacity (see the challenges section for more details).
Voting lasts until a deadline which is typically a week.

#### 4. Verdict
If a required quorum is reached before the deadline, the choice with the highest amount of token staked is called a verdict. A party that is not satisfied with the verdict may submit an appeal during the appeal window (typically 3 days). If there is no appeal the verdict is considered final and the settlement is executed.

#### 5. Appeal
An appeal submission requires doubling the current challenge fee. It will restart the voting and double the required quorum. If the quorum is already above 50% it is impossible to submit another appeal and the current verdict is considered final.

#### 6. Settlement
After the verdict is final the winning party receives a reward which is taken either from a challenger fee or provider deposit. Part of the reward is distributed to the judges. There is also an internal redistribution of tokens among the judges. Those supporting the majority choice get part of the tokens staked on the losing side. The jurors who were on the winning side also increased their voting capacity. The results are persisted on the permaweb and could be used as a base for reputation score for providers, watchers and jurors.

### Dispute parameters
The list below contains system parameters used to manage the dispute resolution process. The values are based on the similar existing models and simulations, therefore they might require tuning after the deployment in the real-world environment. The update could be managed by decentralised governance in the form of token weighted voting by all the stakeholders.

| Parameter | Default value | Description |
|---|---|---|
| voting duration | 7 days | A period when jurors are able to vote on the dispute |
| appeal window | 3 days | A time when the losing side could submit an appeal |
| base quorum | 5% | A minimum percentage of total token supply that needs to be staked during the voting |
| escalation factor | 2x | A multiplier that is applied both to the quorum and challenger fee after the appeal |
| min challenge fee | 100 RDST | A minimum amount of tokens that need to be staked by the watcher (challenger) |
| judgement fee | 20% | Part of the voting stake (from challenger or provider) that is redistributed to the jurors |
| voting penalty | 10% | Part of the losing jurors’ stake that is redistributed to the one who supported the final verdict.  |

### Architecture
The diagram below presents smart-contracts with their connections and descriptions below.

![argue dispute resolution](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/dispute-resolution.png)

**Tribunal** - a master contract orchestrating the dispute process and linking all the dependent components

**Disputes Catalog** - a contract storing current and past disputes with their metadata, status, stake and references to all the parties involved

**Judges Registry**  - a contract keeping a track of jurors with their voting capacity

**Voting engine**  - a contract containing the logic for voting rules, describing the procedure and implementing possible privacy-preserving solutions

**Verdict executor**  - a contract authorised to reallocate tokens according to the results of voting and set the final dispute outcome

**Staking token** - a profit-sharing token that enables staking on a specific topic, in this context, on the dispute-decision key

### Challenges

#### Low turnout
Many blockchain voting systems suffer from voters’ apathy as governance proposals cannot attract the required quorum. Redstone mitigates this problem by introducing a gradual voting scheme. For the first voting on a dispute, there is a low quorum that increases with every appeal. This allows to resolve uncomplicated cases with little friction but allows for proper verification and majority voting if the case is complex enough.

#### Vote buying
Decentralised voting systems use tokens to express voting power. Although the freedom to trade is a necessary feature of every token, buying a large amount of tokens just before important voting could derail the entire system. Not addressing this point was one of the most criticised vulnerabilities of the Aragon court. Redstone mitigates the issue by introducing another dimension to token ownership called holding capacity. It represents the maximum amount of tokens a juror could hold that can increase only as a result of making correct decisions. This ensures that jurors could gradually earn their voting power and the system is immune to short-term votes buying

#### Jurors selection
Jurors benefit from participating in the judgement, therefore there may be a tough competition to vote for a high-stake dispute. To prevent front-running and guarantee an equal right to vote for all the token holders, Redstone plans to implement a random-based selection process. The chances to be selected as a judge are proportional to the voting capacity, a variable that describes that increased gradually with every successful choice made by a juror. This ensures that the best arbiters will have the most opportunities to resolve disputes.

#### Privacy
In most of the cases, public voting will be sufficient and the most cost-effective method to judge the dispute. However, in special cases involving high-stake or confidential content, there could be a need for a privacy-preserving process. We could easily extend the voting mechanism implemented by the Tribunal contract to support either a two-phase commit-reveal process or use zero-knowledge proofs of jurors’ decision.


## Accessing data
### DeFi protocols
Putting data directly into storage is the easiest to make information accessible to smart contracts. However, the convenience comes at a high price, as the storage access is the most costly operation in EVM (20k gas for 256bit word ~ $160k for 1Mb checked 30/08/2021) making it prohibitively expensive to use.

`redstone-flash-storage` implements an alternative design of providing data to smart contracts. Instead of constantly persisting data on EVM storage, the information is brought on-chain only when needed (on-demand fetching). Until that moment, the data remains available in the Arweave blockchain where data providers are incentivised to keep information accurate and up to date. Data is transferred to EVM via a mechanism based on a meta-transaction pattern and the information integrity is verified on-chain through signature checking.

The `redstone-flash-storage` tool can be installed from the NPM regstry:
```bash
# using npm
npm install redstone-flash-storage

# or using yarn
yarn add redstone-flash-storage
```

You can find more details and documentation in its GitHub repo: [github.com/redstone-finance/redstone-flash-storage](https://github.com/redstone-finance/redstone-flash-storage)
### Web integrations
#### RedStone Web App
Data provided by current RedStone providers is accessible in the RedStone web app: [app.redstone.finance](https://app.redstone.finance).

![redstone app screenshot tokens](img/redstone-app-screenshot-tokens.png)

![redstone app screenshot price chart](img/redstone-app-screenshot-price-chart.png)
#### RedStone API
##### HTTP Api

Redstone HTTP API allows to fetch data from the RedStone cache layer.

Base url: `https://api.redstone.finance`

More details about RedStone HTTP API: https://api.docs.redstone.finance/http-api/prices
##### NPM module
We've also implemented a Javascript library for fetching RedStone data from the RedStone cache layer.

It can be installed from the NPM registry:
```bash
# using npm
npm install redstone-api

# using yarn
yarn add redstone-api
```

You can find much more details and API documentation using the links below:
- Documentation: https://api.docs.redstone.finance/
- Source code: https://github.com/redstone-finance/redstone-api
- NPM module: https://www.npmjs.com/package/redstone-api
### Arweave
You can fetch all the data provided by RedStone providers directly from the Arweave blockchain using its graphql endpoint: https://arweave.net/graphql.

But keep in mind that you should decompress it using `gzip` algorithm after fetching.

Example query to fetch RedStone transactions
```json
{
  transactions(
    tags: [
      { name: "app", values: "Redstone" }
      { name: "type", values: "data" }
      { name: "Content-Type", values: "application/json"}
      { name: "version", values: "0.4" }
    ]
    block: { min: 775000 }
    owners: ["I-5rWUehEv-MjdK9gFw09RxfSLQX9DIHxG614Wf8qo0"]
    first: 50
  ) {
    edges {
      node {
        tags {
          name
          value
        }
        id
      }
    }
  }
}
```

You can learn more about fetching data from the Arweave blockchain at: https://gql-guide.vercel.app/

## Need help?
If you have any questions about the technical documentation, please send us a message via:
- Discord: https://redstone.finance/discord
- E-Mail: dev@redstone.finance
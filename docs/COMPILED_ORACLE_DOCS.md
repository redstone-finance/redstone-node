# RedStone oracle technical doc

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

![redstone system architecture](img/redstone-system-architecture.png)

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
- **Providers registry** - an Arweave smart contract that manages provider's token stake, holds the manifesto (SLA of pricing data) and allows checking historical performance (showing any data inconsistency and downtime)
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

![redstone token design](img/redstone-token-design.png)

## RedStone Node
### General description (from Readme)
### Node architecture
### Running a node
#### Prepare config
#### Prepare manifest
##### Sources
### Environments
### Codebase structure
### Performance tracking
### Testing
### Connecting custom data
#### Add new source / fetcher
#### Add new asset

## Providers registry
### RedStone contracts
### Deploying new manifest

## Node monitoring tools

## RedStone cache layer (RedStone API)
### API implementation
#### Testing
### Running your own api instance

## ArGue - Dispute resolution protocol [to be implemented]

## Accessing data
### DeFi protocols
#### Accessing data in EVM smart contracts
### Web integrations
#### RedStone Web App
#### RedStone API
#### NPM module
#### HTTP API
### Arweave
#### NPM module
#### Arweave GraphQL

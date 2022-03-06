# RedStone预言机技术文档（更新中） RedStone oracle technical doc(updating)

- [导览 Introduction](#导览-introduction)
  - [综述 Overview](#综述-overview)
    - [Defi痛点 Defi Pain Points](#defi痛点-defi-pain-points)
    - [解决方案 Solution](#解决方案-solution)
    - [预言机一览 Oracles Landscape](#预言机一览-oracles-landscape)
  - [顶层视野 Top level view](#顶层视野-top-level-view)
- [系统架构 System Architecture](#系统架构-system-architecture)
  - [模块 Modules](#模块-modules)
    - [外部集成 (蓝色) External integrations (blue)](#外部集成-蓝色-external-integrations-blue)
    - [利益相关方 (红色) Stakeholders (red)](#利益相关方-红色-stakeholders-red)
    - [RedStone模块(紫色) RedStone modules (purple)](#redstone模块紫色-redstone-modules-purple)
  - [代币设计 Token design](#代币设计-token-design)
    - [代币使用场景 Usage of the token](#代币使用场景-usage-of-the-token)
      - [数据访问费用 Data access fees](#数据访问费用-data-access-fees)
      - [质押 Staking](#质押-staking)
      - [争议解决 Dispute resolution](#争议解决-dispute-resolution)
      - [引导式营销 Bootstrapping market](#引导式营销-bootstrapping-market)
- [RedStone节点 RedStone Node](#redstone节点-redstone-node)
  - [节点架构 Node architecture](#节点架构-node-architecture)
    - [顶层视野 Top level view](#顶层视野-top-level-view-1)
    - [流程视野 Process view](#流程视野-process-view)
  - [代码库架构 Codebase structure](#代码库架构-codebase-structure)
  - [数据格式 Data format](#数据格式-data-format)
    - [JSON ticker](#json-ticker)
    - [Arweave交易 Arweave transaction](#arweave交易-arweave-transaction)
      - [交易标签 Transaction tags](#交易标签-transaction-tags)
      - [交易数据 Transaction data](#交易数据-transaction-data)
  - [运行一个节点 Running a node](#运行一个节点-running-a-node)
    - [节点运营费用 Node operating costs](#节点运营费用-node-operating-costs)
    - [前提 Prerequisites](#前提-prerequisites)
    - [准备 Prepare](#准备-prepare)
      - [1. 安装依赖 Install dependencies](#1-安装依赖-install-dependencies)
      - [2. 准备manifest Prepare manifest](#2-准备manifest-prepare-manifest)
      - [3. 准备配置文件 Prepare config file](#3-准备配置文件-prepare-config-file)
    - [运行 Run](#运行-run)
      - [本地运行 Local run](#本地运行-local-run)
      - [在docker中运行 Run in docker](#在docker中运行-run-in-docker)
    - [验证 Verify](#验证-verify)
      - [1. 在Arweave上保留价格 Save prices on Arweave](#1-在arweave上保留价格-save-prices-on-arweave)
      - [2. 向RedStone缓存层 (RedStone API) 播报已签名价格 Broadcast signed prices to the RedStone cache layer (RedStone API)](#2-向redstone缓存层-redstone-api-播报已签名价格-broadcast-signed-prices-to-the-redstone-cache-layer-redstone-api)
      - [节点监控 Node monitoring](#节点监控-node-monitoring)
  - [环境 Environments](#环境-environments)
    - [如何配置环境 How to configure environments](#如何配置环境-how-to-configure-environments)
      - [使用环境变量 Using environment variables](#使用环境变量-using-environment-variables)
      - [其他环境变量 Other environment variables](#其他环境变量-other-environment-variables)
      - [在Docker中的设置 Configure in Docker](#在docker中的设置-configure-in-docker)
  - [表现追踪 Performance tracking](#表现追踪-performance-tracking)
  - [测试 Testing](#测试-testing)
  - [连接自定义数据 Connecting custom data](#连接自定义数据-connecting-custom-data)
    - [添加新数据源/获取器 Add new source / fetcher](#添加新数据源获取器-add-new-source--fetcher)
      - [为新数据源命名 Select a name for the new source](#为新数据源命名-select-a-name-for-the-new-source)
      - [实现 Implementation](#实现-implementation)
        - [实现数据源(获取器) Implement source (fetcher)](#实现数据源获取器-implement-source-fetcher)
        - [实现测试 Implement tests](#实现测试-implement-tests)
      - [Manifest(s)](#manifests)
      - [数据源设置[可选] Sources config [optional]](#数据源设置可选-sources-config-optional)
        - [我该做这个吗？Should I do this?](#我该做这个吗should-i-do-this)
        - [如何添加数据源到配置 How to add a source to config](#如何添加数据源到配置-how-to-add-a-source-to-config)
    - [添加新资产 Add new asset](#添加新资产-add-new-asset)
      - [如何添加代币 How to add a token](#如何添加代币-how-to-add-a-token)
- [供应者注册 Providers registry](#供应者注册-providers-registry)
  - [RedStone智能合约 RedStone contracts](#redstone智能合约-redstone-contracts)
  - [部署新manifest Deploying new manifest](#部署新manifest-deploying-new-manifest)
- [节点监控工具 Node monitoring tools](#节点监控工具-node-monitoring-tools)
- [RedStone缓存层 (RedStone API) RedStone cache layers (RedStone API)](#redstone缓存层-redstone-api-redstone-cache-layers-redstone-api)
  - [实现 Implementation](#实现-implementation-1)
  - [测试 Testing](#测试-testing-1)
  - [运行您自己的缓存层 Running your own cache layer](#运行您自己的缓存层-running-your-own-cache-layer)
## 导览 Introduction

### 综述 Overview

RedStone is a data ecosystem that delivers fast and accurate financial information in a decentralised fashion.

RedStone是一个数据生态系统，以去中心化的方式提供快速准确的财务信息。

#### Defi痛点 Defi Pain Points

- It is not sustainable to put all the pricing data into the Ethereum blockchain, as it wasn’t designed for this purpose. Sourcing data becomes enormously expensive with Gas price spikes. On a historically busy day on Ethereum, with a day average 500gwei Gas price, a single transaction may cost above $100, so if we persist every 10m across 30 sources, the daily bill will be more than $400k per one token
  
- 将所有价格数据放入以太坊区块链是不可持续的，因为它本来就不是为此而设计。随着Gas价格飙升，获取数据会变得极为昂贵。在以太坊历史上繁忙的一天，平均Gas价格为 500gwei，单笔交易的成本可能超过100美元，所以如果我们坚持每每10分钟就向30个数据源请求一次，那么每个代币的单日数据账单将超过40万美元
  
- To reduce costs current providers cover only a small subset of tokens and have low update frequency
  
- 为了降低成本，当前的供应者只覆盖了一小部分代币并且更新频率低
  
- DeFi protocols cannot expand beyond a small set of assets and cannot offer advanced solutions like [margin lending](https://www.nasdaq.com/articles/hodling-coins-is-one-plan-of-action-but-serious-investors-will-look-at-marginal-lending) (which require higher update frequency)
  
- DeFi协议不能扩展到一小组资产之外，也不能提供像[保证金借贷](https://www.nasdaq.com/articles/hodling-coins-is-one-plan-of-action-but-serious-investors-will-look-at-marginal-lending) 那样的高级解决方案（需要更高的更新频率）
  

#### 解决方案 Solution

RedStone offers a radically different design of Oracles catering for the needs of modern Defi protocols.

- Leverage Arweave blockchain as a cheap and permanent storage
- Use token incentives to motivate data providers to maintain data integrity and the uninterrupted service
- Use signed meta-transactions to deliver prices on-chain
- Although the data at RedStone is persisted on the Arweave chain, it could be used with any other blockchain

RedStone 提供了完全不同的预言机设计，以满足现代 Defi 协议的需求。

- 利用 Arweave 区块链作为廉价且永久存储
- 使用代币激励来鼓励数据供应者维护数据完整可信，同时提供不间断服务
- 使用已签名元交易在链上分发价格（信息）
- 虽然 RedStone 的数据保存在 Arweave 链上，但它可与任何区块链一起使用

#### 预言机一览 Oracles Landscape

Initially, the most commonly utilised form for Oracle operations were the “two phase approach”:

1. A contract submits a request for data to an Oracle Service;
2. An Oracle Service sends back a response with data.

最初，预言机运营最常用的形式是“两步走”：

1. 智能合约向预言机服务提交数据请求；
2. 预言机服务发回带有数据的响应。

This simple and flexible solution was pioneered by Oraclize (now Provable) and Chainlink as Basic Request Pattern, but the main disadvantage to this approach is that the contract cannot access data immediately as it requires two separate transactions. Such design kills usability as the client needs to wait until the data comes to contract to see a result of an action. An even bigger problem is that fetching data is not atomic (meaning not in a single transaction) which means that synchronizing multiple contracts is complex, slow and ultimately kills interoperability.

这种简单而灵活的解决方案是由 Oraclize（现在的Provable）和 Chainlink 作为基本请求模式而开创的，但这种方法的主要缺点是智能合约无法立即访问数据，因为它需要两个单独的交易。如此设计可能会扼杀可用性，因为客户端需要等到数据开始返回智能合约才能看到操作的结果。更大的问题是获取数据不是原子的（即不是在单个交易中），这意味着同步多个合约是复杂、缓慢的并且最终会破坏交互性。

Currently, the most popular approach taken by blockchains in an attempt to address the aforementioned issues is to persist all data directly on-chain, so that the information is available in the context of a single transaction. Protocols have also formed syndicates around the most popular oracles using common standardized configuration. Here, we listed some of popular Oracle solutions:

目前，为解决上述问题，区块链行业最流行的解决方法是将所有数据直接保存在链上，以便信息在单个交易的维度上可用。各类协议还采用通用的标准化配置，围绕最流行的预言机形成了辛迪加。在这里，我们列出了一些流行的 Oracle 解决方案：

| 项目名称 | Redstone | Chainlink | Band Protocol | DIA | API3 | Flux | Pyth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 数据存储链 | Arweave | Ethereum | Cosmos | 数据库与多个主链不同的预言机合作 | DAO on Ethereum | NEAR | Solana |
| 支持的资产数量 | 1084 | 79  | 175 | 50  | 无信息 | 无信息 | 无信息 |
| 去中心化治理 | Yes | No  | Yes | No  | Yes | Yes | No  |
| 多链支持 | Yes | Yes | 依赖Cosmos IBC | No  | 依赖平行链 | Yes | No  |
| 预言机加速器 | Yes | No  | No  | Yes | Yes | Yes | No  |
| 社区来的新数据请求 | Yes | No  | No  | No  | No  | Yes | No  |
| 支持自定义数据流 | Yes | No  | No  | No  | No  | No  | No  |

### 顶层视野 Top level view

RedStone ecosystem could be divided into 3 main areas:

RedStone生态系统有3个主要方面：

- **Data provision** responsible for fetching the data from external api, transforming to a common format, and persisting collected information.
  
  - Implemented as → [RedStone Node](https://github.com/redstone-finance/redstone-node)
  
  **数据提供**负责从外部 api 获取数据，转换为通用格式，并持久化收集的信息。
  
  - 实现为 → [RedStone Node](https://github.com/redstone-finance/redstone-node)
- **Data access** responsible for serving data to end user by various means including web portal, http api, discord bots, on-chain feeds or 3rd party applications (like spreadsheet extensions)
  
  - Web portal → [RedStone App](https://github.com/redstone-finance/redstone-app)
  - HTTP Api → [RedStone Api](https://github.com/redstone-finance/redstone-api)
  - Bots → [Examples](https://github.com/redstone-finance/redstone-api/tree/main/examples/discord-bots)
  
  **数据访问**负责通过各种方式向最终用户提供数据，包括门户网站、http api、discord bots、链上提要或第 3 方应用程序（如电子表格扩展）
  
  - 门户网站 → [RedStone App](https://github.com/redstone-finance/redstone-app)
  - HTTP Api → [RedStone Api](https://github.com/redstone-finance/redstone-api)
  - 机器人 → [示例](https://github.com/redstone-finance/redstone-api/tree/main/examples/discord-bots)
- **Data integrity** responsible for enforcing high quality of data by incentivising providers with tokens for keeping their service and punishing them for outage and misrepresented data
  
  - Concept → [Argue protocol](https://github.com/redstone-finance/redstone-node/blob/main/docs/DISPUTE_RESOLUTION.md)
  
  **数据完整性**负责通过使用代币激励供应者来保持其服务并惩罚他们因中断和歪曲数据而执行的高质量数据
  
  - 概念 → [争论协议](https://github.com/redstone-finance/redstone-node/blob/main/docs/DISPUTE_RESOLUTION.md)

## 系统架构 System Architecture

### 模块 Modules

![redstonesystemarchitecture](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-system-architecture.png?raw=true)

#### 外部集成 (蓝色) External integrations (blue)

- **Data sources** - provide data (like price information) via API
  
- **DeFi protocols** - consume aggregated and attested data
  
- **Web integrations** - utilise provided data to power apps like blockchain wallets, portfolio browsers, defi analytics sites
  
- **数据源** - 通过 API 提供数据（如价格信息）
  
- **DeFi 协议** - 使用汇总和（已）证明的数据
  
- **Web 集成** - 利用提供的数据为区块链钱包、投资组合浏览器、defi 分析网站等应用提供支持
  

#### 利益相关方 (红色) Stakeholders (red)

- **Data providers** - need to register with token stake and operate RedStone node which process and attest data
  
- **End users** - may browse pricing data and select providers using the web portal
  
- **Juries** - protect data integrity deciding if a price was manipulated
  

- **数据供应者** - 需要质押代币来注册，操作处理和证明数据的 RedStone 节点
  
- **最终用户** - 可以浏览定价数据并选择供应者
  
- **陪审团** - 保护数据完整性，决定价格是否被操纵
  

#### RedStone模块(紫色) RedStone modules (purple)

- **RedStone node** - fetches data from external sources via api, aggregates and attest information with a cryptographic key, broadcast the results and persist them on the Arweave blockchain
  
  **RedStone 节点** - 通过 api 从外部源获取数据，使用密钥聚合和证明信息，广播结果并将它们保存在 Arweave 区块链上
  
- **Data cache** - a module that holds data and makes it available to interested parties. Multiple services might implement it on various infrastructure to increase availability. It should achieve minimum latency and scale to handle large volume of requests
  
  **数据缓存** - 一个保存数据并将其提供给相关方的模块。多个服务可能会在各种基础架构上实施它来提高可用性。它应该实现最小延迟和规模化以便处理大量请求
  
- **Smart contracts api** - it provides the data to on-chain protocols. Initially, we cover Arweave and EVM (ethereum) infrastructure. It minimizes the running (gas) costs and verifies signed data on-chain
  
  **智能合约 api** - 它给链上协议提供数据。最开始，我们将支持 Arweave 和 EVM（以太坊）。它最大限度地降低了运行（gas）成本并可以验证链上的签名数据
  
- **HTTP api** - web based that serves information via REST api. It can power websites, node-js scripts and social media bots. There will be a dedicated java script wrapper that will abstract request formatting and error handling to make service easier to integrate
  
  **HTTP api** - 基于网络，通过 REST api 提供信息。它可以为网站、node-js 脚本和社交媒体机器人提供动力。会有一个专用的 java 脚本封装器来抽象请求的格式和报错的处理，以使服务更易于集成
  
- **Providers registry** - an Arweave smart contract that manages provider's token stake, holds the manifest (SLA of pricing data) and allows checking historical performance (showing any data inconsistency and downtime)
  
  **供应者注册表** - 一个 Arweave 智能合约，用于管理供应者的代币质押、持有的manifest（定价数据的 SLA）并允许检查历史性能（显示任何数据不一致及停机时间）
  
- **Dispute resolution protocol** - a set of Arweave contracts allowing to challenge any existing pricing feed, and managing the dispute process enabling juries to vote for the verdicts
  
  **争议解决协议** - 一组 Arweave 智能合约，允许挑战任何现有的定价信息，并管理争议过程，使陪审团能够投票支持裁决
  
- **Web portal** - a web application that is an interface to browse data, check providers' statistics, see historical feeds with an option to raise a dispute and participate in the voting process
  
  **Web 门户** - 一个 Web 应用，它是一个界面，用于浏览数据、检查供应者的统计数据、查看历史信息流，并可选择提出争议与参加投票进程
  

### 代币设计 Token design

The token facilitates providing reliable and accurate information to blockchain networks from the external world.

该代币有助于从外部世界向区块链网络提供可靠和准确的信息。

#### 代币使用场景 Usage of the token

Tokens are proven to be a very useful tool for achieving coordination in the distributed systems and aligning incentives of various actors. RedStone token facilitates data sharing ecosystem incentivising participants to produce, publish and validate data in a continuous and diligent way.

代币被证明是一种非常有用的工具，可以在分布式系统中协调各方并调整各参与者的激励方式。 RedStone 代币将促进数据共享生态，激励参与者持续和勤奋地生产、发布和验证数据。

##### 数据访问费用 Data access fees

The end users who benefit from access to valuable information use tokens to reward providers that published these data. The exact fee and the subscription terms are at the discretion of the provider and depend on their effort, demand for data and potential competition.

从访问有价值信息获益的最终用户，使用代币奖励发布这些数据的供应者。确切的费用和订阅条款由提供商自行决定，并受其自身努力、数据需求和潜在竞争影响。

##### 质押 Staking

Every provider needs to publish a Service Level Agreement describing the scope of data being served, the source of information, and the frequency of updates. In case a provider breaches the terms of service, there will be a penalty applied which is also denominated in tokens. In order to assure users that any further claims could be fully covered, providers need to put aside a certain amount of token and lock it for a period of time. These funds are labelled as a stake in the ecosystem and are an important factor for users to select the most reliable provider.

每个供应者都需要发布“服务水平协议”，其中应描述所服务的数据范围、信息来源和更新频率。如果提供商违反服务条款，那它将受到惩罚，惩罚也以代币计价。为了向用户保证可以完全覆盖任何未来的索赔，供应者需要留出一定数量的代币并将其锁定一段时间。这些资金被标记为生态系统中的“质押”，也是用户选择最可靠供应者的重要因素。

##### 争议解决 Dispute resolution

Because of the diverse nature of provided information, it will not always be possible to decide if a data was corrupted. Therefore, it will be necessary to have a fallback procedure to resolve any disputes about data quality. The process could be facilitated by tokens when juries will be rewarded for voting alongside the majority and punished for supporting a losing side.

由于提供的信息具有多样性，所以并不总是能够确定数据是否已损坏（被污染）。因此，设立一个回顾流程来解决有关数据质量的争议就显得很有必要。代币可以促进这一过程：陪审团与多数人投票倾向一致，则会受到奖励，反之则会受到惩罚。

##### 引导式营销 Bootstrapping market

At the early stage of development, the token could be distributed to providers to reward their availability and bootstrap the market before there is enough demand coming for data users.

在开发的早期阶段，代币可以分发给供应者，奖励他们（提供）的可用性，并在数据用户有足够的需求之前引导市场。

![redstonetokendesign](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-token-design.png?raw=true)

## RedStone节点 RedStone Node

RedStone Node is a core module in the [RedStone ecosystem](docs/REDSTONE_ECOSYSTEM.md), which is responsible for fetching data from different sources and broadcasting it to the Arweave blockchain and the RedStone cache layer.

You can find the implementation of the redstone node in the [github.com/redstone-finance/redstone-node](https://github.com/redstone-finance/redstone-node) repository.

RedStone节点是 [RedStone 生态系统](docs/REDSTONE_ECOSYSTEM.md) 中的核心模块，负责从不同来源获取数据，并广播到 Arweave 区块链和 RedStone 缓存层。
您可以在 [github.com/redstone-finance/redstone-node](https://github.com/redstone-finance/redstone-node) 存储库中找到RedStone节点的实例。

### 节点架构 Node architecture

#### 顶层视野 Top level view

In a cycle, we perform 3 major activities:

在一个循环内，我们只要有3种活动：

- **Data fetching** - gathering information from external sources
  
- **Data processing** - aggregating data and attesting with signature
  
- **Data broadcasting** - publishing data to users and persisting it on-chain
  
- **数据获取** - 从外部来源收集信息
  
- **数据处理** - 汇总数据并用签名证明
  
- **数据广播** - 向用户发布数据并将其保存在链上
  

#### 流程视野 Process view

This component fetches pricing data and makes it available to end users. The process consists of the following steps:

该组件会获取定价数据并将其提供给最终用户。该过程包括以下步骤：

- **Data fetching** - getting data from public or private api and transforming it the standard format
  
- **Data aggregation** - combining data from multiple sources to produce a single feed using median or volume weighted average
  
- **Data attestation** - signing data with the provider's cryptographic key
  
- **Data broadcasting** - publishing the data on publically available message board (like public firebase store)
  
- **Data persistence** - securing packaged data on the Arweave blockchain
  
- **数据获取** - 从公共或私有 api 获取数据并将其转换为标准格式
  
- **数据聚合** - 聚合多个来源的数据，使用中值或（交易量）加权平均值，生成单个数据流
  
- **数据证明** - 使用供应者的加密密钥签署数据
  
- **数据广播** - 在公开可用的留言板上发布数据（如公共 Firebase 商店）
  
- **数据永续** - 确保Arweave 区块链上的打包数据（的存储）
  

![redstonenode](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-node.png?raw=true)

### 代码库架构 Codebase structure

Each group of subcomponent implements a generic interface and is interchangable with other implementations:

每一组子部件都实现了一个通用接口，并且可以与其他实现互换：

- **Fetchers:** connect to external api, fetch the data and transform it to the standard form <em>Examples: coingecko-fetcher, uniswap-fetcher</em>
  
- **Aggregators:** take values from multiple sources and aggregate them in a single value <em>Examples: median-aggregator, volume-weighted-aggregator</em>
  
- **Signers:** sign the data with the provided private keys <em>Examples: ArweaveSigner, EthSigner</em>
  
- **Broadcasters**: publish the data and signature <em>Examples: FirebaseBroadcaster, SwarmBroadcaster</em>
  
- **Runner:** execute the entire process in a loop
  

- **获取器：** 连接到外部 api，获取数据并将其转换为标准形式 <em>示例：coingecko-fetcher、uniswap-fetcher</em>
  
- **聚合器：** 从多个来源获取值并将它们聚合为单个值 <em>示例：中值聚合器、体积加权聚合器</em>
  
- **签名者：** 使用提供的私钥对数据进行签名 <em>示例：ArweaveSigner、EthSigner</em>
  
- **发布者**：发布数据和签名 <em>示例：FirebaseBroadcaster、SwarmBroadcaster</em>
  
- **执行者**：循环执行整个流程
  

You can see a standard flow of the node iteration on the diagram below:

您可以查看如下节点循环的标准流程图：

<br />
<br />

![noderunningdetailed](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/node-running-detailed.png?raw=true)

Currently, the price value is aggregated using the default `median-aggregator`. It works in the following way:

目前，价格值是使用默认的`median-aggregator`聚合的。它的工作方式如下：

<br />
<br />

![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/median-aggregator.png?raw=true)

### 数据格式 Data format

#### JSON ticker

The price (ticker) is represented as a single JSON object

价格(报价)由一个单独的JSON对象代表：

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

#### Arweave交易 Arweave transaction

Price tickers are aggregated per provider and timestamp and persisted on the Arweave chain. The provider is the tx sender.

价格信息按供应者和时间戳汇总，并保留在 Arweave 链上。供应者是 tx 发送者。

##### 交易标签 Transaction tags

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

##### 交易数据 Transaction data

We encrypt transaction data using the [gzip algorithm](https://www.gzip.org/) to minimize transaction cost. We don't store a signature for each price on the Arweave blockchain, because each transaction is already signed using the default Arweave transaction signer.

我们使用 [gzip 算法](https://www.gzip.org/) 对交易数据进行加密，以最大限度地降低交易成本。我们不会在 Arweave 上存储每个价格的签名，因为每笔交易都已经使用默认的 Arweave 交易签名者进行了签名。

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

### 运行一个节点 Running a node

#### 节点运营费用 Node operating costs

- **Arweave storage** - an average node spends **~0.00003AR/iteration**, resulting in 0.00003 * 60 * 24 * 30 = **1.296AR/month** assuming that the data fetching interval is 60 seconds. With the current AR price it is **~$55/month**
  
- **Node infrastructure** - depending on a selected infrastructure and logs retention policy the Node infrastructure costs may be in the range from **~$10/month** (simple EC2 machine on AWS) to **~$70/month** (ECS cluster with connected Cloudwatch for logs querying)
  
- **Cache layer** - a provider can also configure their cache layer, wchich costs **~$5/month** on AWS
  
- **Arweave 存储** - 平均每个节点花费 **~0.00003AR/每次迭代**，假设数据获取间隔为 60 秒，那就是 0.00003 * 60 * 24 * 30 = **1.296AR/月**。目前的 AR 价格是 **~$55/月**
  
- **节点基础设施** - 根据选定的基础设施和日志保留政策，节点基础设施成本可能在 **$10/月 （AWS 上的简单 EC2 机器）到$70/月之间** (ECS 集群连接 Cloudwatch 用于日志查询)
  
- **缓存层** - 提供商还可以配置他们的缓存层，在 AWS 上的成本为 **~5 美元/月**
  

Summing all up, the average monthly node operating cost is in the range from **$70** to **$130**.
Please also keep in mind that RedStone providers also need to pay some stake (min **$100** in RedStone tokens) before running their node.

总而言之，平均每月节点运营成本在 **$70 到 $130** 之间。
另请记住，RedStone 提供商在运行其节点之前还需要支付一些质押（最低 **$100**的RedStone 代币）。

#### 前提 Prerequisites

- Node.js (v14 or higher) and `yarn`
  
- Arweave wallet (> 0.1AR)
  
- Node.js（v14 或更高版本）和 `yarn`
  
- Arweave 钱包 (> 0.1AR)
  

#### 准备 Prepare

##### 1. 安装依赖 Install dependencies

```bash
yarn install
```

##### 2. 准备manifest Prepare manifest

Manifest is a public JSON file that defines the provider's obligation regarding the data that they provide. It sets fetching interval, tokens, sources and other public technical details for the provided data.

Manifest是一个公共 JSON 文件，它定义了供应者对其提供的数据的义务。它为提供的数据设置获取间隔、代币、来源和其他公共技术细节。

There are 2 options for loading manifest in the redstone-node:

1. Loading from JSON file. This option is preferred for local runs and experiments
2. Loading from [SmartWeave contracts](./DEPLOY_MANIFEST_ON_ARWEAVE.md)

在 redstone-node 中加载manifest，有 2 个选项：

1. 从 JSON 文件加载。此选项适用于本地运行和实验
2. 从 [SmartWeave 合约](./DEPLOY_MANIFEST_ON_ARWEAVE.md) 加载

You can use any of our [ready-to-use manifests](../manifests).

您可以使用我们任何 [ready-to-use manifests](../manifests)。

For example:

比如:

- [main.json](../manifests/main.json) - 1000+ tokens, used by the main redstone provider
  
- [rapid.json](../manifests/rapid.json) - 10 most popular tokens, used by `redstone-rapid` provider
  
- [coinbase.json](../manifests/coinbase.json) - 20 tokens, uses only coinbase fetcher
  
- [main.json](../manifests/main.json) - 1000+ 个代币，由主要RedStone供应者使用
  
- [rapid.json](../manifests/rapid.json) - 10 个最受欢迎的代币，由 `redstone-rapid` 供应者使用
  
- [coinbase.json](../manifests/coinbase.json) - 20 个代币，仅使用 coinbase fetcher
  

You can also prepare your own manifest and place it inside the `manifests` folder. The manifest file should be named using kebab case, i.e: `manifest.json`, `good-manifest.json`, or `your-source.json`.

您还可以准备自己的manifest并将其放在“manifest”文件夹中。manifest文件应使用 kebab 大小写命名，即：`manifest.json`、`good-manifest.json` 或 `your-source.json`。

You can also publish your manifest to the Arweave smart contracts.

您还可以将manifest发布到 Arweave 智能合约。

Here is the structure of the manifest file:

以下是manifest文件的结构：

| 参数 Param | 可选性Optionality | 类型Type | 描述 Description |
| --- | --- | --- | --- |
| interval | 必须 required | 数字Number | 毫秒表示的数据请求间隔 <br/>Data fetching interval in milliseconds |
| priceAggregator | 必须required | 字符串String | 聚合器 ID。目前仅支持 `median` 聚合器 <br/>Aggregator id. Currently only `median` aggregator is supported |
| defaultSource | 可选 optional | 字符串String[] | 获取器名称数组，默认情况下将用于没有指定来源的代币 <br/>Array of fetcher names that will be used by default for tokens that have no specified sources |
| sourceTimeout | 必须required | 数字Number | 以毫秒为单位的数据源默认超时时间<br/>Default timeout in milliseconds for sources |
| maxPriceDeviationPercent | 必须required | 数字Number | 代币默认最大的价格偏差百分比。也可以为每个token单独设置<br/>Default maximum price deviation percent for tokens. It may also be set for each token separately |
| evmChainId | 必须required | 数字Number | EVM 链 ID，将在 EVM 价格签名时使用。如果您不确定，请输入“1”，它将指向以太坊主网。<br/>EVM chain id, that will be used during EVM price signing. Pass `1` if you're not sure, it will point to the Ethereum Mainnet. |
| tokens | 必须required | 对象Object | 带有以下格式标记的对象：`{ "TOKEN_SYMBOL": { "source": ["source-name-1", "source-name-2", ...], "maxPriceDeviationPercent": 25 }, .. .}`。请注意，每个代币的 `source` 和 `maxPriceDeviationPercent` 参数都是可选的。这也是正确的代币配置：`{ "TOKEN_SYMBOL_1": {}, "TOKEN_SYMBOL_2": {} } <br/> `Object with tokens in the following format: `{ "TOKEN_SYMBOL": { "source": ["source-name-1", "source-name-2", ...], "maxPriceDeviationPercent": 25 }, ... }`. Note that `source` and `maxPriceDeviationPercent` params per token are optional. This is also a correct tokens configuration: `{ "TOKEN_SYMBOL_1": {}, "TOKEN_SYMBOL_2": {} }` |

You can find a list of available sources along with its stability details in the RedStone Web app: [app.redstone.finance/#/app/sources.](https://app.redstone.finance/#/app/sources)

您可以在 RedStone Web 应用程序中找到可用资源列表及其稳定性详细信息：[app.redstone.finance/#/app/sources.](https://app.redstone.finance/#/app/sources)

![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/sources-screenshot.png?raw=true)

##### 3. 准备配置文件 Prepare config file

Config file is a **private** file created by a provider. It contains the following details required by the redstone-node:

配置文件是由供应者创建的**私有**文件。它包含RedStone节点所需的以下详细信息：

| 参数 Param | 可选性Optionality | 描述 Description |
| --- | --- | --- |
| arweaveKeysFile | 必须 required | arweave 钱包的路径（若是相对路径，则假定在项目根文件夹中）<br/>path to the arweave wallet (for relative paths it assumes that you are in the project root folder) |
| minimumArBalance | 必须 required | 运行节点最低需要的AR余额 <br/>minimum AR balance required to run the node |
| useManifestFromSmartContract | 可选 optional | 如果设置为true,manifest会从Arweave的智能合约中调用 <br/>if set to true , manifest will be loaded from Arweave Smart Contracts |
| manifestFile | 可选 optional | manifest文件的路径<br/>path to the manifest file |
| addEvmSignature | 可选 optional | 如果设置为itrue,EVM签名将会被添加到每个资产的价格中<br/>if set to true, EVM signature will be added to each price for each asset |
| credentials | 必须 required | 具有 API 和私钥凭据的对象<br/>object with credentials for APIs and private keys |
| credentials.ethereumPrivateKey | 必须 required | 将用于价格数据签名的以太坊私钥<br/>Ethereum private key that will be used for price data signing |
| credentials.yahooFinanceRapidApiKey | 可选 optional | api-dojo-rapid 获取器 的 API 密钥<br/>API key for the api-dojo-rapid fetcher |

You should place your config file inside the `.secrets` folder, which is included in `.gitignore`. You should **never publish this file.**

您应该将配置文件放在 `.secrets` 文件夹中，该文件夹包含在 `.gitignore` 中。您应该**永远不发布此文件。**

#### 运行 Run

##### 本地运行 Local run

Please note, the instruction below is for Unix operating systems (like Linux or MacOS).
If you use Windows, we recommend running the redstone node in a Docker container.

请注意，以下说明适用于 Unix 操作系统（如 Linux 或 MacOS）。
如果您使用 Windows，我们建议在 Docker 容器中运行RedStone节点。

```bash
yarn start --config PATH_TO_YOUR_CONFIG
```

We recommend redirecting output to some log file(s), for example:

我们建议将输出重定向到一些日志文件，例如：

```bash
yarn start --config PATH_TO_YOUR_CONFIG > my-redstone-node.logs 2> my-redstone-node.error.logs
```

You can also enable JSON mode for logs to simplify the log analysing later.
To do this append `ENABLE_JSON_LOGS=true` to the node running command:

您还可以为日志启用 JSON 模式，从而简化以后的日志分析。
为此，将 `ENABLE_JSON_LOGS=true` 添加到节点运行命令：

```bash
ENABLE_JSON_LOGS=true yarn start --config PATH_TO_YOUR_CONFIG > my-redstone-node.logs 2> my-redstone-node.error.logs
```

##### 在docker中运行 Run in docker

You can run a local redstone-node in docker.

1. Prepare your Dockerfile based on [./Dockerfile](../Dockerfile).
  Name it `Dockerfile.my-redstone-node` and place it in the project root folder.
  
  根据 [./Dockerfile](../Dockerfile) 准备 Dockerfile。
  将其命名为 `Dockerfile.my-redstone-node` 并将其放在项目的根文件夹中。
  
2. Build a docker container with redstone-node
  
  使用 redstone-node 构建一个 docker 容器
  

```bash
docker build -f Dockerfile.my-redstone-node -t my-redstone-node .
```

3. Run the docker container
  
  运行docker容器
  

```bash
docker run -it my-redstone-node
```

#### 验证 Verify

There are 2 main things that your node needs to do:

有两件重要的事您需要做：

##### 1. 在Arweave上保留价格 Save prices on Arweave

To verify if prices are being saved on Arweave, navigate to [https://viewblock.io/arweave/address/YOUR_ADDRESS.](https://viewblock.io/arweave/address/YOUR_ADDRESS)
You should see some transactions with the tag `app` and value `Redstone` ~20 minutes after the node running.

要验证价格是否保存在 Arweave 上，请导航至 [https://viewblock.io/arweave/address/YOUR_ADDRESS。](https://viewblock.io/arweave/address/YOUR_ADDRESS)
在节点运行约 20 分钟后，您应该会看到一些带有`app`标签和`Redstone`标签的交易。

##### 2. 向RedStone缓存层 (RedStone API) 播报已签名价格 Broadcast signed prices to the RedStone cache layer (RedStone API)

You can simply open this URL [https://api.redstone.finance/prices?provider=YOUR_ADDRESS](https://api.redstone.finance/prices?provider=YOUR_ADDRESS) in browser and see if it returns signed data. Don't forget to replace `YOUR_ADDRESS` with your Arweave wallet address

您只需在浏览器中打开URL [https://api.redstone.finance/prices?provider=YOUR_ADDRESS](https://api.redstone.finance/prices?provider=YOUR_ADDRESS) 并查看它是否返回已签名数据。不要忘记用你的 Arweave 钱包地址替换 `YOUR_ADDRESS`

##### 节点监控 Node monitoring

We've also implemented an automated monitoring system for nodes. It will be described below in the `Node monitoring tools` section.

我们还为节点实施了自动监控系统。将在下面的“节点监控工具”部分详述。

### 环境 Environments

RedStone node environments (modes) help to differentiate node configuration for different purposes.

RedStone 节点环境（模式）有助于区分不同目标的节点配置。

There are 2 main environments, that are already created in the RedStone node:

- **PROD** (should be used for real long-term node deployment)
- **LOCAL** (should be used for tests, development and experiments)

RedStone 节点中已经创建了 2 个主要环境：

- **PROD**（应用于真正的长期节点部署）
- **LOCAL**（应用于测试、开发和实验）

Production environment automatically enables services, that are not useful in local environment, such as:

- error reporting
- performance tracking
- publishing on Arweave

生产环境会自动启用本地环境中没用的服务，例如：

- 错误报告
- 性能跟踪
- 在 Arweave 上发布

#### 如何配置环境 How to configure environments

##### 使用环境变量 Using environment variables

Environments can be configured using environment variable `MODE`. Set it to `PROD` to run redstone node in the production environment or to `LOCAL` to run redstone node locally.

可以使用环境变量 MODE 配置环境。将其设置为 `PROD` 以在生产环境中运行红石节点或设置为 `LOCAL` 以在本地运行红石节点。

##### 其他环境变量 Other environment variables

- **ENABLE_JSON_LOGS** - set this variable to `true` to enable logging in JSON format. It is recommended to set it to `true` if you run the node in the production environment.
  
  **ENABLE_JSON_LOGS** - 将此变量设置为 `true` 可启用 JSON 格式的日志记录。如果您在生产环境中运行节点，建议将其设置为 `true`。
  
- **PERFORMANCE_TRACKING_LABEL_PREFIX** - human-friendly name that will be appended to the performance tracking labels. (Examples: `main` for `redstone` provider, `stocks` for `redstone-stocks`, `rapid` for `redstone-rapid` provider)
  
  **PERFORMANCE_TRACKING_LABEL_PREFIX** - 将添加到性能跟踪标签的人性化名称。 （示例：`redstone` 供应者的`main`，`redstone-stocks` 的`stocks`，`redstone-rapid` 供应者的`rapid`）
  

##### 在Docker中的设置 Configure in Docker

Dockerfiles are used to build docker images, which are usually executed in the Production environment. To configure the production environment, `ENV` instruction should be added to a Dockerfile.

Dockerfiles 用于构建 docker 镜像，通常在生产环境中执行。要配置生产环境，应在 Dockerfile 中添加 `ENV` 指令。

```dockerfile
ENV MODE=PROD
ENV ENABLE_JSON_LOGS=true
ENV PERFORMANCE_TRACKING_LABEL_PREFIX=stocks
```

### 表现追踪 Performance tracking

Performance tracking is enabled in the production environment and tracks by default all of the most important processes during each node iteration. Currently we save performance data in AWS cloudwatch, where it can be analysed using convenient chart tool:

生产环境中默认启用表现追踪，并在每个节点迭代期间默认跟踪所有最重要的进程。目前我们将性能数据保存在 AWS cloudwatch 中，可以使用方便的图表工具对其进行分析：

![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/performance-chart.png?raw=true)

We track performance for the following processes:

我们通过以下流程追踪表现：

- processing-all 处理所有
- balance-checking 余额检测
- fetching-all 获取所有
- fetching-[SOURCE_NAME] 获取特定数据源
- signing 签名
- broadcasting 广播
- package-broadcasting 包广播
- transaction-preparing 准备交易
- arweave-keeping arweave保存

If you set `PERFORMANCE_TRACKING_LABEL_PREFIX` environment variable, its value will be appended to the performance tracking labels (for example: `rapid-processing-all` for `PERFORMANCE_TRACKING_LABEL_PREFIX=rapid`)

如果您设置 `PERFORMANCE_TRACKING_LABEL_PREFIX` 环境变量，其值将添加到性能跟踪标签（例如：`rapid-processing-all` for `PERFORMANCE_TRACKING_LABEL_PREFIX=rapid`）

### 测试 Testing

We use the [jest](https://jestjs.io/) framework for automated testing. Test files are located in the `test` folder. We test each fetcher separately (fetchers tests are located in the `test/fetchers` folder). We also have integration tests in the `test/integration` folder and tests for separate modules:

我们使用 [jest](https://jestjs.io/) 框架进行自动测试。测试文件位于 `test` 文件夹中。我们分别测试每个 获取器（获取器测试位于 `test/fetchers` 文件夹中）。我们还在 `test/integration` 文件夹中进行了集成测试，并对单独的模块进行了测试：

- EvmPriceSigner.spec.ts
- ManifestParser.spec.ts
- median-aggregator.spec.ts
- PricesService.spec.ts

You can run the tests in the following way:

您可以通过以下命令进行测试：

```bash
yarn test
```

### 连接自定义数据 Connecting custom data

#### 添加新数据源/获取器 Add new source / fetcher

We will use words `source` and `fetcher`. Сonsider them to be synonymous.

我们将使用`source` and `fetcher`,可以将他们视为同义词。

##### 为新数据源命名 Select a name for the new source

First, you should select a name for your source.
It should use kebab case, for example: `source`, `good-source`, `the-best-source`.
Source name must be unique, because it will unambiguously identify your source.

首先，您应该为您的来源选择一个名称。
它应该使用 kebab 大小写，例如：`source`、`good-source`、`the-best-source`。
源名称必须是唯一的，因为它将明确标识您的源。

##### 实现 Implementation

###### 实现数据源(获取器) Implement source (fetcher)

Create a folder with a name of your fetcher in [src/fetchers](../src/fetchers).
Place the code of your fetcher inside of this folder and update [src/fetchers/index.ts](../src/fetchers/index.ts) file to export your source. For more information check out [BaseFetcher](../src/fetchers/BaseFetcher.ts) code and implementation of other fetchers, like [coingecko](../src/fetchers/coingecko/CoingeckoFetcher.ts), [coinbase](../src/fetchers/coinbase), and [ecb](../src/fetchers/ecb/EcbFetcher.ts).

在 [src/fetchers](../src/fetchers) 中创建一个以您的获取器名称命名的文件夹。
将您的获取器代码放在此文件夹中并更新 [src/fetchers/index.ts](../src/fetchers/index.ts) 文件以导出您的源代码。有关更多信息，请查看 [BaseFetcher](../src/fetchers/BaseFetcher.ts) 代码和其他获取器的实现，例如 [coingecko](../src/fetchers/coingecko/CoingeckoFetcher.ts)、[coinbase]( ../src/fetchers/coinbase) 和 [ecb](../src/fetchers/ecb/EcbFetcher.ts)。

###### 实现测试 Implement tests

We strongly recommend implementing tests for your fetcher. It's generally a good practice and it will help you to avoid silly bugs in your code. You can find examples of tests for other fetchers in the [test/fetchers](../test/fetchers) folder.

我们强烈建议为您的获取器实施测试。这通常是一种很好的做法，它将帮助您避免代码中出现愚蠢的错误。您可以在 [test/fetchers](../test/fetchers) 文件夹中找到其他获取器的测试示例。

##### Manifest(s)

- Create a manifest with the name of the newly added fetcher and place it in the [manifests](../manifests) folder
  
  使用新添加的获取器的名称创建一个清单，并将其放在 [manifests](../manifests) 文件夹中
  
- [Optional] If the source should be used in the main redstone provider, run `node tools/manifest/generate-main-manifest.js`
  
  [可选] 如果数据源在主要的RedStone供应者中使用，那么请运行 `node tools/manifest/generate-main-manifest.js`
  

##### 数据源设置[可选] Sources config [optional]

###### 我该做这个吗？Should I do this?

Sources config file is used in the RedStone web app. If you want your source to be visible there you should add it to config and update the app appropriately.

数据源配置文件用于 RedStone Web 应用。如果您希望数据源在那里可见，您应该将其添加到配置并适当地更新应用程序。

###### 如何添加数据源到配置 How to add a source to config

- Add source details to the `tools/config/predefined-configs/sources.json` file
  
  将数据源详细信息添加到 `tools/config/predefined-configs/sources.json` 文件
  
- Run `yarn build`. It is required by `generate-sources-config.js` so it can work correctly
  
  运行`yarn build`， `generate-sources-config.js` 需要它才可以正常工作
  
- Run `node tools/config/generate-sources-config.js` to generate sources config. It will be saved to `src/config/sources.json`
  
  运行 `node tools/config/generate-sources-config.js` 生成数据源配置。它将被保存到`src/config/sources.json`
  
- Download logo for the newly created source
  
  - You can simply download it in browser and save as `<SOURCE_NAME>.<IMG_EXTENSTION>`
  - Or you can run `node tools/cdn-images/download-source-logos.js`, but it will download logos for all sources
  
  为新创建的数据源下载logo
  
  - 您可以简单地在浏览器中下载并保存为`<SOURCE_NAME>.<IMG_EXTENSTION>`
  - 您还可以运行 `node tools/cdn-images/download-source-logos.js`，但它会下载所有数据源的徽标
- Upload the source logo to RedStone CDN (manually through AWS S3 web interface)
  
  将数据源logo上传到 RedStone CDN（通过 AWS S3 Web 界面手动操作）
  
- Run `node tools/cdn-images/update-sources-config.js` to replace logo urls in sources config with redstone CDN urls
  
  运行 `node tools/cdn-images/update-sources-config.js` 将数据源配置中的 logo url 替换为 redstone CDN url
  
- Update `redstone-node` dependency in redstone-app for being able to use the new source config file
  
  更新 redstone-app 中的 `redstone-node` 依赖，以便能够使用新的数据源配置文件
  

#### 添加新资产 Add new asset

Tokens config file, which is located in `src/config/tokens.json`, is used in the RedStone web app and `redstone-api`. If you want your token to be accessible through the `redstone-api` npm module you should add it to the config.

令牌配置文件位于 `src/config/tokens.json` 中，用于 RedStone Web 应用程序和 `redstone-api`。如果您希望您的令牌可以通过 `redstone-api` npm 模块访问，您应该将其添加到配置中。

##### 如何添加代币 How to add a token

- Add token details to `tools/config/predefined-configs/tokens.json`
  
- Run `node tools/config/add-new-tokens-from-predefined-config.js`
  
- Upload the token logo to RedStone CDN, so it is publicly accessible at `https://cdn.redstone.finance/symbols/<TOKEN_NAME_LOWER_CASE>.<IMG_EXTENSION></IMG_EXTENSION>`
  
- Run `node tools/cdn-images/update-tokens-config.js` to replace logo urls in tokens config with redstone CDN urls
  
- Update `redstone-node` dependency in `redstone-api`, `redstone-app` and other packages where `tokens.json` is used.
  
- 将代币详细信息添加到 `tools/config/predefined-configs/tokens.json`
  
- 运行`node tools/config/add-new-tokens-from-predefined-config.js`
  
- 将代币上传到 RedStone CDN，以便在 `https://cdn.redstone.finance/symbols/<TOKEN_NAME_LOWER_CASE>.<IMG_EXTENSION></IMG_EXTENSION>` 上公开访问
  
- 运行 `node tools/cdn-images/update-tokens-config.js` 将代币配置中的logo url 替换为 redstone CDN url
  
- 更新 `redstone-api`、`redstone-app` 和其他使用 `tokens.json` 的软件包中的 `redstone-node` 依赖项。
  

## 供应者注册 Providers registry

Providers registry is an Arweave smart contract that manages provider's token stake, holds the manifest (SLA of pricing data) and allows checking historical performance (showing any data inconsistency and downtime).

供应者注册表是一个 Arweave 智能合约，用于管理供应者的代币质押、持有manifest（定价数据的 SLA）并允许检查历史性能（显示任何数据不一致和停机时间）。

### RedStone智能合约 RedStone contracts

You can find the source code of providers registry smart contract [here](https://github.com/redstone-finance/redstone-smartweave-contracts/blob/main/src/providers-registry/providers-registry.contract.ts).

您可以在[此处](https://github.com/redstone-finance/redstone-smartweave-contracts/blob/main/src/providers-registry/providers-registry.contract.ts)找到供应者注册智能合约的源代码。

This contract:

这个智能合约：

1. Tracks profile data of all the currently available RedStone data providers.
  
  追踪所有当前可用的 RedStone 数据供应者的配置文件数据。
  
  | 名字 name | 描述 description |
  | --- | --- |
  | id  | 某个数据提供者的唯一 ID<br/>unique id of a given data provider |
  | name | 数据供应者的可读名称<br/>human-readable name of the data provider |
  | description | 提供数据的描述<br/>description of the provided data |
  | url | 数据供应者网站的 url<br/>url to the data provider's website |
  | urlImg | 带有供应商logo的 img 网址<br/>url to an img with provider's logo |
  
2. Keeps current and historical manifests data for all the registered nodes.
  
  保留所有已注册节点的当前和历史manifests数据。
  
3. Allows updating of a given provider's manifest.
  
  允许更新给定供应者的清单。
  
4. Allows updating of a given provider's meta-data.
  
  允许更新给定供应者的元数据。
  
5. Allows adding and removing providers.
  
  允许增删供应者
  
6. Allows configuring provider's admin accounts (i.e. account that are allowed to change provider's manifest and meta-data).
  
  允许配置供应者的管理员帐户（即允许更改供应者的manifest和元数据的帐户）。
  

Contract is implemented as an Arweave SmartWeave contract and is currently available under `OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU` address.
Most of the administrative operations can be also performed using a dedicated user interface in [app.redstone.finance](https://app.redstone.finance/#/app/providers).

在`OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU`地址下。
大多数管理操作也可以使用 [app.redstone.finance](https://app.redstone.finance/#/app/providers) 中的专用用户界面执行。

List of available data providers loaded from the Arweave:

从 Arweave 加载的可用数据供应者列表：![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-app-providers.png?raw=true)

Details of the provided data for the selected provider (selected provider: RedStone):

精选供应者（RedStone）提供的数据详细信息：

![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-app-provider-details.png?raw=true)

Provider's manifests history loaded from the Arweave:

从 Arweave 加载的供应者清单历史记录：
![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-app-provider-manifests.png?raw=true)

UI for the manifest creation and updating:

manifest创建和更新的 UI：![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/redstone-app-new-manifest.png?raw=true)

In order to perform any operation, you need to connect the provider's wallet first (using [ArConnect Browser extension](https://arconnect.io/)).

执行任何操作之前，您需要先连接供应者的钱包（使用 [ArConnect 浏览器扩展](https://arconnect.io/)）。

There are also currently two other contracts implemented:

目前有两种其他智能合约实现：

1. [contracts-registry](https://github.com/redstone-finance/redstone-smartweave-contracts/blob/main/src/contracts-registry/contracts-registry.contract.ts) contract - this contract keeps track of all the RedStone's SmartWeave contracts
  and allows to abstract a given contract's logical name from its current Arweave tx address.
  It also allows versioning of the contracts.
  We also post the Arweave transaction id of the contract [here](https://raw.githubusercontent.com/redstone-finance/redstone-smartweave-contracts/main/contracts-registry.address.txt) to make web integrations easier.
  
  [contracts-registry](https://github.com/redstone-finance/redstone-smartweave-contracts/blob/main/src/contracts-registry/contracts-registry.contract.ts) 智能合约 - 该合约跟踪所有RedStone 的 SmartWeave 合约
  并允许从当前 Arweave tx 地址中抽象出给定合约的逻辑名称。
  它还允许对合约进行版本控制。
  我们还在 [此处](https://raw.githubusercontent.com/redstone-finance/redstone-smartweave-contracts/main/contracts-registry.address.txt) 发布了合约的 Arweave 交易 ID，以使 Web 集成更容易。
  
2. [token](https://github.com/redstone-finance/redstone-smartweave-contracts/blob/main/src/token/token.contract.ts) contract - this a work-in-progress of a RedStone Token contract, which is an implementation of a Profit Sharing Token with additional features - like
  "deposit" on another contract and wallet id (e.g. provider can stake some tokens on his own node registered in `providers-registry` contract).
  Due to the current technical limitations of the SmartWeave SDK, the information about the deposit is currently stored in the "token" contract - which is inconvenient from the "withdraw" operation perspective -
  as this operation has to first ask the dependent contract how many tokens can be withdrawn - in order to this,
  dependent contract has to then first read the "token" contract state and check how many tokens are deposited.
  This complicated flow will be greatly simplified when our new [RedStone SmartContracts SDK](https://github.com/redstone-finance/redstone-smartcontracts) will allow performing "interactWrite" operations between
  contracts - i.e. changing state of one contract from the source code of another contract.
  
  [代币](https://github.com/redstone-finance/redstone-smartweave-contracts/blob/main/src/token/token.contract.ts) 合约 - 这是一个进行中的 RedStone 代币合约，具有利润分享等附加功能代币的实现 - 例如
  在另一个合约和钱包的 ID 上“存款”（例如，供应者可以在他自己的在 `providers-registry` 合约中注册的节点上质押一些代币）。
  因SmartWeave SDK目前的技术限制，关于存款的信息目前存储在“token”合约中——从“提款”操作的角度来看是不方便的——
  因为此操作必须首先询问依赖合约可以提取多少代币 - 为此，
  依赖合约必须首先读取“代币”合约状态并检查存入了多少代币。
  这个复杂的流程会得到大幅简化：我们的新 [RedStone SmartContracts SDK](https://github.com/redstone-finance/redstone-smartcontracts) 会允许在
  合约间进行“互写” - 即从另一个合约的源代码更改一个合约的状态。
  

### 部署新manifest Deploying new manifest

- place your JWK key in .secrets/redstone-jwk.json
- run the following command `node src/tools/providers-registry.api.js addManifest "<PATH_TO_MANIFEST>" "<UPDATE_COMMENT>" 0 false`
- 将您的 JWK 密钥放入 .secrets/redstone-jwk.json
- 运行以下命令 `node src/tools/providers-registry.api.js addManifest "<PATH_TO_MANIFEST>" "<UPDATE_COMMENT>" 0 false`

## 节点监控工具 Node monitoring tools

It's insanely important for oracles to provide high quality data without interruptions.
So, the node operators need to monitor their nodes and immediately fix any potential problems.

对于预言机而言，不间断地提供高质量数据非常重要。
因此，节点运营商需要监控他们的节点并立即修复任何潜在问题。

That's why we've implemented a special app [redstone-node-monitoring](https://github.com/redstone-finance/redstone-node-monitoring), which is executed in a loop and automatically verifies if a selected node regularly publishes new data to the RedStone cache layer and the Arweave blockchain. In each loop iteration multiple checkers are executed. And if any of these checkers fail then the error is reported.

这就是为什么我们实现了一个特殊的应用程序 [redstone-node-monitoring](https://github.com/redstone-finance/redstone-node-monitoring)，它循环执行并自动验证选定的节点是否定期将新数据发布到 RedStone 缓存层和 Arweave 区块链。在每次循环迭代中，都会执行多个检查器。如果这些检查器中的任何一个失败，就会报错。

![redstone image](https://github.com/redstone-finance/redstone-node/blob/main/docs/img/node-monitoring.png?raw=true)

**Checker** - a module responsible for data integrity checking. It can check the number of saved data points during the last 5 minutes or the timestamp of the latest saved data point.

**检查器** - 负责数据完整性检查的模块。它可以检查最近 5 分钟内保存的数据点的数量或最近保存的数据点的时间戳。

Implemented checkers:

已实施的检查器：

- **ArPriceReturnedRedstoneRapid**
- **ArPriceReturned**
- **ArweaveTimestampDelay**
- **HistoricalPricesReturned**
- **StockPricesReturnedRedstoneStocks**
- **TimestampIsCloseToNowRedstoneRapid**
- **TimestampIsCloseToNow**

**Reporter** - a module responsible for error/warning reporting. For example, it can notify a node operator via email, SMS or discord. It can also save a notification to a text file. Currently we send email notifications to our developer team and save logs in AWS Cloudwatch.

**报告器** - 负责错误/警告汇报的模块。例如，它可以通过电子邮件、短信或discord通知节点供应者。它还可以将通知保存到文本文件中。目前，我们向开发团队发送电子邮件通知，并将日志保存在 AWS Cloudwatch 中。

You can find more details about running or extending this monitoring service in the [redstone-node-monitoring](https://github.com/redstone-finance/redstone-node-monitoring) GitHub repo.

您可以在 [redstone-node-monitoring](https://github.com/redstone-finance/redstone-node-monitoring) GitHub 存储库中找到有关运行或扩展此监控服务的更多详细信息。

## RedStone缓存层 (RedStone API) RedStone cache layers (RedStone API)

The data signed by a provider should be broadcasted to multiple cache layers in order to ensure the data accessibility and to keep the whole system more decentralised, stable and resistant to attacks. By default, redstone-node uses a single RedStone API cache layer. However each data provider is able to update the broadcasting logic in their node and enable broadcasting to several cache layers.

供应者签名的数据应该广播到多个缓存层，以确保数据的可访问性，并使整个系统更加去中心化、稳定和抗攻击。默认情况下，redstone-node 使用单个 RedStone API 缓存层。然而，每个数据供应者都能够更新其节点中的广播逻辑并启用对多个缓存层的广播。

The cache layer code is Open Source and can be downloaded from our [GitHub](https://github.com/redstone-finance/redstone-cache-layer). You can find more details about its architecture and the deployment process below.

缓存层代码是开源的，可以从我们的[GitHub](https://github.com/redstone-finance/redstone-cache-layer)下载。您可以在下面找到有关其架构和部署过程的更多详细信息。

### 实现 Implementation

RedStone cache layer is a Node.js Express app, which allows users to save and query signed data points (currently pricing for assets) in MongoDB.

RedStone 缓存层是一个 Node.js Express 应用，它使得用户在 MongoDB 中保存和查询签名数据点（目前主要是资产的定价）。

### 测试 Testing

We always implement tests for all the core modules of the RedStone ecosystem, including the cache layer app. You can run tests in the following way:

我们总是对 RedStone 生态系统的所有核心模块进行测试，包括缓存层应用。您可以通过以下方式运行测试：

```bash
# Install dependencies
yarn install

# Run tests
yarn test
```

### 运行您自己的缓存层 Running your own cache layer

We run our instance of the cache layer on AWS. However, it can be deployed on GCP, Azure, Heroku or any other service. You should set up a mongoDB instance (the simplest way to do this is using [Mongo Atlas](https://www.mongodb.com/cloud)). Then you should place .secrets.json file into the root folder of the repo and run the app using the `yarn dev` command.

我们在 AWS 上运行我们的缓存层实例。但是，它可以部署在 GCP、Azure、Heroku 或任何其他服务上。您可以设置一个 mongoDB 实例（最简单的方法是使用 [Mongo Atlas](https://www.mongodb.com/cloud)）。然后，您可以将 .secrets.json 文件放入 repo 的根文件夹并使用 `yarn dev` 命令运行应用程序。

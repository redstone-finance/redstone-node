# Run node locally

## Prerequisites
- Node.js (v14 or higher) and `yarn`
- Arweave wallet (> 0.1AR)

## Prepare
### 1. Install dependencies
```bash
yarn install
```

### 2. Prepare manifest
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

### 3. Prepare config file

Config file is a **private** file created by provider. You should create your config file and place it inside the `.secrets` folder. To read more about config file creation [read this guide](./PREPARE_CONFIG.md)

## Run the node

### Local run

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

### Run in docker
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

## Verify if node is running
There are 2 main things that your node need to do:
### 1. Save prices on Arweave
To verify if prices are being saved on Arweave, navigate to [https://viewblock.io/arweave/address/YOUR_ADDRESS.](https://viewblock.io/arweave/address/YOUR_ADDRESS)
You should see some transactions with tag `app` and value `Redstone` ~20 minutes after the node running.
### 2. Broadcast signed prices to the RedStone cache layer (RedStone API)
You can simply open this URL [https://api.redstone.finance/prices?provider=YOUR_ADDRESS](https://api.redstone.finance/prices?provider=YOUR_ADDRESS) in browser and see if it returns signed data. Don't forget to replace `YOUR_ADDRESS` with your Arweave wallet address.

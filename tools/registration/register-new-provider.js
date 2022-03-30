const prompts = require("prompts");
const fs = require("fs");
const Arweave = require("arweave");
const { SmartWeaveNodeFactory } = require('redstone-smartweave');
const { generateNewRandomNodeConfig } = require('../docker/generate-new-random-config');


const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave)
  .useRedStoneGateway( {confirmed: true} )
  .build();

const PROVIDERS_REGISTRY_ADDRESS = "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU";

const DEFAULTS = {
  name: "RedStone Avalanche prod 5",
  description: "Most popular tokens from the Avalanche ecosystem",
  manifestTxId: "y7ppr6m9MuP65Fiivd9CX84qcPLoYBMifUrFK3jXw2k",
  url: "https://redstone.finance/",
  logo: "https://redstone.finance/assets/img/redstone-logo-full.svg",
};

main();

async function main() {
  let nodeConfig = await generateNewRandomNodeConfig();
  let jwk = nodeConfig.config.arweaveKeysJWK;

  //const providerDetails = await promptProviderDetails();
  const providerConfig = await prepareProviderConfig(DEFAULTS, jwk);

  await registerProviderInContract(providerConfig);
  await saveProviderConfig(providerConfig, nodeConfig);

  console.log("\n*** Please set this SECRET config in the REDSTONE_NODE_CONFIG env variable:\n");
  console.log(JSON.stringify(nodeConfig.config));

  //return await checkContractState(providerConfig);
  //return await removeProvider(providerConfig);
  //return await getManifestId(providerConfig);
}

async function registerProviderInContract(providerConfig) {

  console.info(`Registering provider on contract: ${PROVIDERS_REGISTRY_ADDRESS}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const writeTxId = await contract.bundleInteraction(
    {
      function: "registerProvider",
      data: {
        provider: providerConfig.provider
      },
    },
  );

  console.log(writeTxId);
}


async function saveProviderConfig(providerConfig, nodeConfig) {
  const path = __dirname + "/../../src/config/providers.json";
  const rawConfigFile = fs.readFileSync(path);
  const currentConfig = JSON.parse(rawConfigFile);
  const formattedName = providerConfig.provider.profile.name.replaceAll(" ", "-").toLowerCase();
  currentConfig[formattedName] = nodeConfig.publicProviderDetails;
  fs.writeFileSync(path, JSON.stringify(currentConfig, null, 2));
}


async function removeProvider(providerConfig) {

  console.info(`Removing provider: ${providerConfig.address} from contract: ${PROVIDERS_REGISTRY_ADDRESS}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const writeTxId = await contract.bundleInteraction(
    {
      function: "removeProvider",
      data: {
        providerId: providerConfig.address
      },
    },
  );

  console.log(writeTxId);
}


async function checkContractState(providerConfig) {

  console.info(`Checking contract state: ${PROVIDERS_REGISTRY_ADDRESS}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const { result: providersData } = await contract.viewState({
    function: 'providersData',
  });

  console.log(JSON.stringify(providersData, null, 2));
}


async function getManifestId(providerConfig) {
  console.info(`Getting manifestId for: ${providerConfig.address}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const { result } = await contract.viewState({
    function: 'activeManifest',
    data: {
      providerId: providerConfig.address,
      eagerManifestLoad: true
    }
  });

  console.log(result);
}

async function prepareProviderConfig(providerDetails, jwk) {
  const address = await arweave.wallets.jwkToAddress(jwk);

  const providerConfig = {
    provider: {
      adminsPool: [address],
      profile: {
        name: providerDetails.name,
        description: providerDetails.description,
        url: providerDetails.url,
        imgUrl: providerDetails.logo,
      },
    },
    address,
    jwk,
  };

  if (providerDetails.manifestTxId) {
    providerConfig.provider.manifests = [{
      changeMessage: "initial manifest",
      lockedHours: 0,
      manifestTxId: providerDetails.manifestTxId,
    }];
  }

  return providerConfig;
}

async function promptProviderDetails() {
  const name = await promptString("Please enter provider name (e.g. RedStone Avalanche prod 1");
  const description = await promptString("Please enter provider description (e.g. Most popular tokens from the Avalanche ecosystem)");
  const url = await promptString("Please enter url", DEFAULTS.url);
  const logo = await promptString("Please enter logo url", DEFAULTS.logo);
  const manifestTxId = await promptString("Please enter initial manifest tx id", DEFAULTS.manifestTxId);

  return {
    name,
    description,
    url,
    logo,
    manifestTxId,
  };
}

async function promptString(msg, defaultValue) {
  const response = await prompts({
    type: "text",
    name: "result",
    message: msg,
    initial: defaultValue,
  });

  return response.result;
}


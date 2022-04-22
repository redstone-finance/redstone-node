const { ethers } = require("ethers");
const arweaveMnemonicKeys = require("arweave-mnemonic-keys");
const Arweave = require("arweave/node");

main();

async function main() {
  const { publicProviderDetails, config } = await generateNewRandomNodeConfig();

  console.log(`\n\n== Public provider details ==\n`);
  console.log(JSON.stringify(publicProviderDetails, null, 2));

  console.log(`\n\n== Provider JWK ==\n`);
  console.log(JSON.stringify(config.arweaveKeysJWK));

  console.log(`\n\n== Private provider config ==\n`);
  console.log(JSON.stringify(config));
}

async function generateNewRandomNodeConfig() {
  const arweave = Arweave.init({
    host: "arweave.net", // Hostname or IP address for a Arweave host
    port: 443,           // Port
    protocol: "https",   // Network protocol http or https
    timeout: 60000,      // Network request timeouts in milliseconds
    logging: false,      // Enable network request logging
  });

  const evmWallet = ethers.Wallet.createRandom();
  const arweaveMnemonic = await arweaveMnemonicKeys.generateMnemonic();
  const jwk = await arweaveMnemonicKeys.getKeyFromMnemonic(arweaveMnemonic);
  const arweaveAddress = await arweave.wallets.jwkToAddress(jwk);
  const arweavePublicKey = getPublicKey(jwk);

  return {
    config: {
      arweaveKeysJWK: jwk,
      minimumArBalance: 0.1,
      useManifestFromSmartContract: true,
      addEvmSignature: true,
      enableStreamrBroadcaster: true,
      omitSourcesInArweaveTx: true,
      credentials: {
        ethereumPrivateKey: evmWallet.privateKey,
      },
      httpBroadcasterURLs: [
        "https://api.redstone.finance",
        "https://vwx3eni8c7.eu-west-1.awsapprunner.com",
        "https://container-service-1.dv9sai71f4rsq.eu-central-1.cs.amazonlightsail.com"
      ]
    },
    publicProviderDetails: {
      address: arweaveAddress,
      publicKey: arweavePublicKey,
      evmAddress: evmWallet.address,
    },
  };
}

// Public key is saved in the "n"
// More info: https://docs.arweave.org/developers/server/http-api#addressing
function getPublicKey(jwk) {
  return jwk.n;
}

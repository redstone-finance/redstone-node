const { generateMnemonic, getKeyFromMnemonic } = require("arweave-mnemonic-keys");
const { ethers } = require("ethers");
const _ = require("lodash");

const REPEAT_COUNT = 3;

main();

async function main() {
  // Menmonic generation
  const mnemonic = await measure(
    "Mnemonic generation",
    () => generateMnemonic());
  // const mnemonic = "barrel dose mimic wide coral include rapid issue charge region buyer night";

  // JWK and private key generation (many times)
  let prevJwk, prevPrivateKey;
  for (let i = 0; i < REPEAT_COUNT; i++) {
    // Converting to JWK
    const jwk = await measure(
      `Converting to JWK - ${i + 1}`,
      () => getKeyFromMnemonic(mnemonic));
    if (prevJwk) {
      const isPrevJwkEqualToCurrentOne = _.isEqual(prevJwk, jwk);
      console.log({ isPrevJwkEqualToCurrentOne });
    } else {
      prevJwk = jwk;
    }

    // Converting to private key
    const privateKey = await measure(
      `Converting to ethereum private key - ${i + 1}`,
      () => ethers.Wallet.fromMnemonic(mnemonic).privateKey);
    if (prevPrivateKey) {
      const isPrevPrivateKeyEqualToCurrentOne =
        _.isEqual(prevPrivateKey, privateKey);
      console.log({ isPrevPrivateKeyEqualToCurrentOne });
    } else {
      prevPrivateKey = privateKey;
    }
  }
}

async function measure(title, fun) {
  console.log(`\n\n${title}: started`);

  console.time(title);
  const result = await fun();
  console.log("Result:", result);
  console.timeEnd(title);

  console.log(`${title}: completed`);

  return result;
}

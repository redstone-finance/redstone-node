import { Consola } from "consola"
import NodeRunner from "./src/NodeRunner";
import { getConfigFromEnv } from "./src/config/get-config-from-env";
import { getArweaveWallet } from "./src/config/get-arweave-wallet";

const logger = require("./src/utils/logger")("index") as Consola;

async function start() {
  try {
    await main();
  } catch (e: any) {
    logger.error(e.stack);
    logger.info(
      "USAGE: yarn start:prod");
  }
}

async function main(): Promise<void> {
  const jwk = getArweaveWallet();
  const config = getConfigFromEnv();

  // Running RedStone node with manifest
  const runner = await NodeRunner.create(
    jwk,
    config
  );
  await runner.run();
}

start();

export = {};

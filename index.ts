import yargs from "yargs";
import {Consola} from "consola"
import NodeRunner from "./src/NodeRunner";
import {NodeConfig} from "./src/types";
import {readJSON} from "./src/utils/objects";

const logger = require("./src/utils/logger")("index") as Consola;
const {hideBin} = require("yargs/helpers") as any;

async function start() {
  try {
    await main();
  } catch (e) {
    logger.error(e.stack);
    logger.info(
      "USAGE: yarn start:prod --config <PATH_TO_CONFIG_FILE>");
  }
}

async function main(): Promise<void> {
  // Reading cli arguments
  const argv = yargs(hideBin(process.argv)).argv;
  const configFilePath = argv.config as string;

  // Validating cli arguments
  if (configFilePath === undefined || configFilePath === "") {
    throw new Error("Path to the config file cannot be empty");
  }

  // TODO: validate config files and manifest files - use json schema? https://2ality.com/2020/06/validating-data-typescript.html
  const config: NodeConfig = readJSON(configFilePath);
  const jwk = readJSON(config.arweaveKeysFile);

  // Running limestone-node with manifest
  const runner = await NodeRunner.create(
    jwk,
    config
  );
  await runner.run();
}

start();

export = {};

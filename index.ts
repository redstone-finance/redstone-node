import fs from "fs";
import yargs from "yargs";
import {Consola} from "consola"
import NodeRunner from "./src/NodeRunner";
import {NodeConfig} from "./src/types";

const logger = require("./src/utils/logger")("index") as Consola;
const { hideBin } = require("yargs/helpers") as any;

async function start() {
  try {
    await main();
  } catch (e) {
    logger.error(e.stack);
    logger.info(
      "USAGE: yarn start:prod --config <PATH_TO_CONFIG_FILE>");
  };
}

async function main(): Promise<void> {
  // Reading cli arguments
  const argv = yargs(hideBin(process.argv)).argv;
  const configFilePath = argv.config as string;

  // Validating cli arguments
  if (configFilePath === undefined || configFilePath === "") {
    throw new Error("Path to the config file cannot be empty");
  }

  //TODO: validate config files and manifest files - use json schema? https://2ality.com/2020/06/validating-data-typescript.html
  const config: NodeConfig = readJSON(configFilePath);
  const jwk = readJSON(config.arweaveKeysFile);
  const manifest = readJSON(config.manifestFile);

  // Running limestone-node with manifest
  const runner = await NodeRunner.create(
    manifest,
    jwk,
    config
  );
  await runner.run();
}

function readJSON(path: string): any {
  const content = fs.readFileSync(path, "utf-8");
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`File "${path}" does not contain a valid JSON`);
  }
}

start();

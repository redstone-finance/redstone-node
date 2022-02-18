import Bundlr from "@bundlr-network/client";
import BundlrTransaction from "@bundlr-network/client/build/common/transaction";
import { JWKInterface } from "arweave/node/lib/wallet";
import { Consola } from "consola";
import bundlrDefaults from "./bundlr-defaults.json";
import util from "util";
import { gzip } from "zlib";

const logger = require("./src/utils/logger")("BundlrProxy") as Consola;

export default class BundlrProxy  {

  private bundlrClient: Bundlr;

  constructor(jwk: JWKInterface) {
    this.bundlrClient = new Bundlr(
      bundlrDefaults.defaultUrl,
      bundlrDefaults.defaultCurrency,
      jwk
    );
  }

  async prepareSignedTrasaction(data: any): Promise<BundlrTransaction> {
    // Compressing
    const stringifiedData = JSON.stringify(data);
    const gzipPromisified = util.promisify(gzip);
    const compressedData = await gzipPromisified(stringifiedData);

    // Transaction creating and signing
    const tx = this.bundlrClient.createTransaction(compressedData);
    await tx.sign();

    return tx;
  }

  async uploadBundlrTransaction(tx: BundlrTransaction): Promise<void> {
    logger.info(`Uploading bundlr transaction: ${tx.id}`);
    const receipt = await tx.upload();
    logger.info(`Uploaded bundlr transaction: ${tx.id}. Receipt: ${JSON.stringify(receipt)}`);
  }

  async getBalance(): Promise<number> {
    const winstonsBalance = await this.bundlrClient.getLoadedBalance();
    return winstonsBalance.div(10 ** 12).toNumber();
  }
}

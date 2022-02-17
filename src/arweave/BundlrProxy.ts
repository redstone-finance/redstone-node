import Bundlr from "@bundlr-network/client";
import { JWKInterface } from "arweave/node/lib/wallet";
import { sleep } from "@bundlr-network/client/build/common/utils";
import { Consola } from "consola";

const logger = require("./src/utils/logger")("BundlrProxy") as Consola;

const BUNDLR_URL = "https://node1.bundlr.network";
const BUNDLR_CURRENCY = "arweave";
const AUTO_FUNDING_INTERVAL = 3 * 3600 * 1000; // 3 hours
const MIN_BUNDLR_AR_BALANCE = 1e10; // 0.01 AR
const BUNDLR_FUND_AMOUNT = 1e11; // 0.1 AR

let autoFundingEnabled = false;

export default class BundlrProxy  {

  private bundlrClient: Bundlr;

  constructor(jwk: JWKInterface) {
    this.bundlrClient = new Bundlr(BUNDLR_URL, BUNDLR_CURRENCY, jwk);

    this.enableAutoFunding();
  }

  async enableAutoFunding() {
    if (!autoFundingEnabled) {
      autoFundingEnabled = true;

      // Continuously perform balance checks
      while (true) {
        // Check your balance
        const balance = await this.bundlrClient.getLoadedBalance();

        logger.info(`Bundlr balance: ${balance.div(1e9).toNumber() / 1000}`);

        if (balance.lt(MIN_BUNDLR_AR_BALANCE)) {
          logger.info(`Buying more ARs to use in bundlr`);
          await this.bundlrClient.fund(BUNDLR_FUND_AMOUNT);
        }

        // Wait for an hour before checking again (Arweave specific)
        await sleep(AUTO_FUNDING_INTERVAL);
      }
    }
  }

  // TODO: implement
  async prepareTx(data: string | Uint8Array) {
    const tx = this.bundlrClient.createTransaction(data);
    await tx.sign();
    return tx;
  }

  // TODO: update types
  async uploadWithLazyFunding() {
    // Get the cost for upload
    const price = await this.bundlrClient!.getPrice(data.length);

    console.log(`Bundlr price`, price.toNumber() / 1e12);

    // Get your current balance
    // const balance = await this.bundlrClient!.getLoadedBalance();

    // // If you don't have enough balance for the upload
    // if (price.lt(balance)) {
    //   // Fund your account with the difference
    //   // We multiply by 1.1 to make sure we don't run out of funds
    //   const amountToFund = price.minus(balance).multipliedBy(1.1);
    //   await this.bundlrClient.fund(amountToFund);
    // }

    // Create, sign and upload the transaction
    const tx = this.bundlrClient.createTransaction(data);
    await tx.sign();
    await tx.upload();

    return tx;
  }
}

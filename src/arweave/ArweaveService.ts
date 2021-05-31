import {Consola} from "consola";
import {ArweaveTransactionTags, PriceDataAfterAggregation, PriceDataBeforeSigning, PriceDataSigned} from "../types";
import ArweaveProxy from "./ArweaveProxy";
import {trackEnd, trackStart} from "../utils/performance-tracker";
import Transaction from "arweave/node/lib/transaction";

const logger = require("../utils/logger")("ArweaveService") as Consola;
const deepSortObject = require("deep-sort-object");

export type BalanceCheckResult = { balance: number, isBalanceLow: boolean }

// Business service that supplies operations required by Redstone-Node.
export default class ArweaveService {

  constructor(
    private arweave: ArweaveProxy,
    private minBalance: number
  ) {
  }

  async prepareArweaveTransaction(prices: PriceDataAfterAggregation[], nodeVersion: string)
    : Promise<Transaction> {
    trackStart("transaction-preparing");

    logger.info("Keeping prices on arweave blockchain - preparing transaction");
    this.checkAllPricesHaveSameTimestamp(prices);

    const tags = this.prepareTransactionTags(nodeVersion, prices);

    const transaction = await this.arweave.prepareUploadTransaction(tags, prices);
    trackEnd("transaction-preparing");

    return transaction;
  }

  async checkBalance(): Promise<BalanceCheckResult> {
    try {
      const balance = await this.arweave.getBalance();
      const isBalanceLow = balance < this.minBalance;
      logger.info(`Balance: ${balance}`);
      return {balance, isBalanceLow};
    } catch (e) {
      logger.error("Error while checking balance on Arweave", e.stack);
      return {balance: 0, isBalanceLow: true};
    }

  }

  async storePricesOnArweave(arTransaction: Transaction) {
    logger.info(
      `Keeping prices on arweave blockchain - posting transaction
       arTransaction.id`);
    trackStart("keeping");
    //TODO: Handle errors in a more sensible way ;-) https://app.clickup.com/t/k38r91
    try {
      await this.arweave.postTransaction(arTransaction);
    } catch (e) {
      logger.error("Error while storing prices on Arweave", e.stack);
    }
    trackEnd("keeping");
    logger.info(`Transaction posted: ${arTransaction.id}`);
  }

  async signPrices(
    prices: PriceDataAfterAggregation[],
    idArTransaction: string,
    providerAddress: string
  ): Promise<PriceDataSigned[]> {
    trackStart("signing");

    const signedPrices: PriceDataSigned[] = [];

    for (const price of prices) {
      logger.info(`Signing price: ${price.id}`);

      //TODO: check if signing in parallel would improve performance -  https://app.clickup.com/t/k391rf
      const signed: PriceDataSigned = await this.signPrice({
        ...price,
        permawebTx: idArTransaction,
        provider: providerAddress,
      });

      signedPrices.push(signed);
    }
    trackEnd("signing");

    return signedPrices;
  }

  private async signPrice(price: PriceDataBeforeSigning): Promise<PriceDataSigned> {
    const priceWithSortedProps = deepSortObject(price);
    const priceStringified = JSON.stringify(priceWithSortedProps);
    const signature = await this.arweave.sign(priceStringified);

    return {
      ...price,
      signature,
    };
  }

  private checkAllPricesHaveSameTimestamp(prices: PriceDataAfterAggregation[]) {
    if (!prices || prices.length === 0) {
      throw new Error("Can not keep empty array of prices in Arweave");
    }

    const differentTimestamps = new Set(prices.map(price => price.timestamp));
    if (differentTimestamps.size !== 1) {
      throw new Error(`All prices should have same timestamps.
     Found ${differentTimestamps.size} different timestamps.`);
    }
  }

  private prepareTransactionTags(nodeVersion: string, prices: PriceDataAfterAggregation[]) {
    const tags: ArweaveTransactionTags = {
      app: "Redstone",
      type: "data",
      version: nodeVersion,

      // Tags for HTTP headers
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",

      // All prices have the same timestamp
      timestamp: String(prices[0].timestamp),
    };

    // Adding AR price to tags if possible
    const arPrice = prices.find(p => p.symbol === "AR");
    if (arPrice !== undefined) {
      tags["AR"] = String(arPrice.value);
    }
    return tags;
  }
}

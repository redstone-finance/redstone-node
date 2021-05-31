import Arweave from "arweave/node";
import Transaction from "arweave/node/lib/transaction";
import { JWKInterface } from "arweave/node/lib/wallet";
import { Consola } from "consola";
import util from "util";
import { gzip } from "zlib";
import _  from "lodash";

const logger =
  require("../utils/logger")("utils/arweave-proxy") as Consola;

// This is a low-level "DAO" that allows to interact with Arweave blockchain
export default class ArweaveProxy  {
  jwk: JWKInterface;
  arweave: Arweave;

  constructor(jwk: JWKInterface) {
    this.jwk = jwk;
    this.arweave = Arweave.init({
      host: "arweave.dev", // Hostname or IP address for a Arweave host
      port: 443,           // Port
      protocol: "https",   // Network protocol http or https
      timeout: 60000,      // Network request timeouts in milliseconds
      logging: false,      // Enable network request logging
    });
  }

  async sign(strToSign: string): Promise<string> {
    // TODO: check alternative methods
    // crypto module is marked as deprecated
    const dataToSign: Uint8Array = new TextEncoder().encode(strToSign);
    const signature = await this.arweave.crypto.sign(this.jwk, dataToSign);
    const buffer = Buffer.from(signature);

    return buffer.toString("base64");
  }

  async getAddress(): Promise<string> {
    return await this.arweave.wallets.jwkToAddress(this.jwk);
  }

  async getBalance(): Promise<number> {
    const address = await this.getAddress();
    const rawBalance = await this.arweave.wallets.getBalance(address);
    return parseFloat(this.arweave.ar.winstonToAr(rawBalance));
  }

  // This method creates and signs arweave transaction
  // It doesn't post transaction to arweave, to do so use postTransaction
  async prepareUploadTransaction(tags: any, data: any): Promise<Transaction> {
    const stringifiedData = JSON.stringify(data);

    // Compressing
    const gzipPromisified = util.promisify(gzip);
    const gzippedData = await gzipPromisified(stringifiedData);

    // Transaction creation
    const uploadTx = await this.arweave.createTransaction({
      data: gzippedData,
    }, this.jwk);

    _.keys(tags).forEach((key) => {
      uploadTx.addTag(key, tags[key]);
    });

    // This is an experiment
    // We want to measure transaction confirmation delay
    // For smaller gas costs
    // [UPDATE] looks like any transaction with smaller than default reward
    // is not accepted by arweave :(
    // uploadTx.reward = String(Math.round(Number(uploadTx.reward) * 0.5));

    // Transaction id is generated during signing
    await this.arweave.transactions.sign(uploadTx, this.jwk);

    return uploadTx;
  }

  async postTransaction(tx: Transaction): Promise<void> {
    const uploader = await this.arweave.transactions.getUploader(tx);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      logger.info(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }
  }

};

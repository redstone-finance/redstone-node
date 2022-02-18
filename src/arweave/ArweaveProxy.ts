import Arweave from "arweave/node";
import { JWKInterface } from "arweave/node/lib/wallet";
import { Consola } from "consola";
import _  from "lodash";
import ArweaveMultihost from "arweave-multihost";
import { SmartWeave, SmartWeaveNodeFactory, LoggerFactory } from "redstone-smartweave";
import BundlrProxy from "./BundlrProxy";

const logger =
  require("../utils/logger")("utils/arweave-proxy") as Consola;

// This is a low-level "DAO" that allows to interact with Arweave blockchain
export default class ArweaveProxy  {
  jwk: JWKInterface;
  arweave: Arweave;
  smartweave: SmartWeave;
  bundlr: BundlrProxy;

  constructor(jwk: JWKInterface) {
    this.jwk = jwk;
    this.arweave = ArweaveMultihost.initWithDefaultHosts({
      timeout: 60000,      // Network request timeouts in milliseconds
      logging: true,      // Enable network request logging
      logger: logger.info,
      onError: (...args: any) => {
        logger.warn("Arweave request failed", ...args);
      },
    });
    this.bundlr = new BundlrProxy(jwk);

    LoggerFactory.INST.setOptions({
      type: "json",
      displayFilePath: "hidden",
      displayInstanceName: false,
      minLevel: "info",
    });

    this.smartweave = SmartWeaveNodeFactory.memCached(this.arweave);
  }

  async getAddress(): Promise<string> {
    return await this.arweave.wallets.jwkToAddress(this.jwk);
  }

  async getBalance(): Promise<number> {
    const address = await this.getAddress();
    const rawBalance = await this.arweave.wallets.getBalance(address);
    return parseFloat(this.arweave.ar.winstonToAr(rawBalance));
  }
};

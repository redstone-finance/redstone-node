import {Consola} from "consola";
import _ from "lodash";
import EvmPriceSigner from "./EvmPriceSigner";
import ArweaveService from "../arweave/ArweaveService";
import { PriceDataBeforeSigning, PriceDataSigned, SignedPricePackage } from "../types";
import { trackStart, trackEnd } from "../utils/performance-tracker";

const logger = require("../utils/logger")("ArweaveService") as Consola;

interface PriceSignerConfig {
  version: string;
  evmChainId: number;
  ethereumPrivateKey: string;
  arweaveService: ArweaveService;
};

// Business service that supplies signing operations required by Redstone-Node
export default class PriceSignerService {
  private arweaveService: ArweaveService;
  private evmSigner: EvmPriceSigner;
  private ethereumPrivateKey: string;

  constructor(config: PriceSignerConfig) {
    this.evmSigner = new EvmPriceSigner(config.version, config.evmChainId);
    this.arweaveService = config.arweaveService;
    this.ethereumPrivateKey = config.ethereumPrivateKey;
  }

  async signPrices(prices: PriceDataBeforeSigning[], ): Promise<PriceDataSigned[]> {
    const signingTrackingId = trackStart("signing");
    const signedPrices: PriceDataSigned[] = [];

    try {
      for (const price of prices) {
        logger.info(`Signing price: ${price.id}`);
        const signedPrice = await this.signSinglePrice(price);
        signedPrices.push(signedPrice);
      }
      return signedPrices;
    } finally {
      trackEnd(signingTrackingId);
    }
  }

  async signSinglePrice(price: PriceDataBeforeSigning): Promise<PriceDataSigned> {
    logger.info(`Signing price with arweave signer: ${price.id}`);
    const signedWithArweave = await this.arweaveService.signPrice(price);

    // Signing with evm signer
    logger.info(`Signing price with evm signer: ${price.id}`);
    const packageWithSinglePrice = this.evmSigner.signPricePackage({
      prices: [_.pick(price, ["symbol", "value"])],
      timestamp: price.timestamp,
    }, this.ethereumPrivateKey);

    return {
      ...signedWithArweave,
      evmSignature: packageWithSinglePrice.signature,
    };
  }

  signPricePackage(prices: PriceDataSigned[]): SignedPricePackage {
    if (prices.length === 0) {
      throw new Error("Price package should contain at least one price");
    }

    const pricePackage = {
      timestamp: prices[0].timestamp,
      prices: prices.map(p => _.pick(p, ["symbol", "value"])),
    };

    return this.evmSigner.signPricePackage(
      pricePackage,
      this.ethereumPrivateKey);
  }
}

import { toBuffer } from "ethereumjs-util";
import { signTypedMessage, recoverTypedMessage } from "eth-sig-util";
import { ethers } from "ethers";
import sortDeepObjectArrays from "sort-deep-object-arrays";
import {
  PricePackage,
  ShortSinglePrice,
  SignedPricePackage,
  PriceDataSigned,
} from "../types";
import _ from "lodash";

const PriceData = [
  {name: "symbols", type: "bytes32[]"},
  {name: "values", type: "uint256[]"},
  {name: "timestamp", type: "uint256"},
];

const EIP712Domain = [
  {name: "name", type: "string"},
  {name: "version", type: "string"},
  {name: "chainId", type: "uint256"}
];

const serializePriceValue = (value: any) => Math.round(value * (10 ** 8));

export default class EvmPriceSigner {
  private _domainData: object;

  constructor(version: string = "0.4", chainId: number = 1) {
    this._domainData =  {
      name: "Redstone",
      version: version,
      chainId : chainId,
    };
  }

  private serializeToMessage(pricePackage: PricePackage): object {
    // We clean and sort prices to be sure that prices
    // always have the same format
    const cleanPricesData = pricePackage.prices.map(
      (p) => _.pick(p, ["symbol", "value"]));
    const sortedPrices = sortDeepObjectArrays(cleanPricesData);

    return {
      symbols: sortedPrices.map((p: ShortSinglePrice) =>
        ethers.utils.formatBytes32String(p.symbol)),
      values: sortedPrices.map((p: ShortSinglePrice) =>
        serializePriceValue(p.value)),
      timestamp: pricePackage.timestamp,
    };
  }

  getSignedPackage(prices: PriceDataSigned[], privateKey: string) {
    if (prices.length === 0) {
      throw new Error("Price package should contain at least one price");
    }

    const pricePackage = {
      timestamp: prices[0].timestamp,
      prices: prices.map(p => _.pick(p, ["symbol", "value"])),
    };

    return this.signPricePackage(
      pricePackage,
      privateKey);
  }

  signPricePackage(pricePackage: PricePackage, privateKey: string): SignedPricePackage {
    const data: any = {
      types: {
        EIP712Domain,
        PriceData: PriceData,
      },
      domain: this._domainData,
      primaryType: "PriceData",
      message: this.serializeToMessage(pricePackage),
    };

    return {
      pricePackage,
      signer: (new ethers.Wallet(privateKey)).address,
      signature: signTypedMessage(toBuffer(privateKey), {data}, "V4"),
    };
  }

  verifySignature(signedPricePackage: SignedPricePackage): boolean {
    const data: any = {
      types: {
        EIP712Domain,
        PriceData,
      },
      domain: this._domainData,
      primaryType: "PriceData",
      message: this.serializeToMessage(signedPricePackage.pricePackage),
    };

    const signer = recoverTypedMessage({
      data,
      sig: signedPricePackage.signature,
    });

    return signer.toUpperCase() === signedPricePackage.signer.toUpperCase();
  }
}

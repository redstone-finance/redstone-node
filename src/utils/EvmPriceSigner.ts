import { toBuffer } from "ethereumjs-util";
import { signTypedMessage, recoverTypedMessage } from "eth-sig-util";
import { ethers } from "hardhat";
import sortDeepObjectArrays from "sort-deep-object-arrays";

export interface ShortSinglePriceDataType {
  symbol: string;
  value: number;
};

export interface PricesBatchType {
  prices: ShortSinglePriceDataType[];
  timestamp: number;
};

export type SignedPriceDataType = {
  pricesBatch: PricesBatchType;
  signer: string;
  signature: string;
};

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

const serializeBN = (value: any) => value.toString();

export class EvmPriceSigner {
  private _domainData: object;

  constructor(version: string = "0.4", chainId: number = 1) {
    this._domainData =  {
      name: "Redstone",
      version: version,
      chainId : chainId,
    };
  }

  private serializeToMessage(pricesBatch: PricesBatchType): object {
    const sortedPrices = sortDeepObjectArrays(pricesBatch.prices);

    return {
      symbols: sortedPrices.map((p: any) => p.symbol),
      values: sortedPrices.map((p: any) => serializeBN(p.value)),
      timestamp: serializeBN(pricesBatch.timestamp),
    };
  }

  signPriceData(pricesBatch: PricesBatchType, privateKey: string): SignedPriceDataType {
    const data: any = {
      types: {
        EIP712Domain,
        PriceData: PriceData,
      },
      domain: this._domainData,
      primaryType: "PriceData",
      message: this.serializeToMessage(pricesBatch),
    };

    return {
      pricesBatch,
      signer: (new ethers.Wallet(privateKey)).address,
      signature: signTypedMessage(toBuffer(privateKey), {data}, "V4"),
    };
  }

  verifySignature(signedPriceData: SignedPriceDataType): boolean {
    const data: any = {
      types: {
        EIP712Domain,
        PriceData,
      },
      domain: this._domainData,
      primaryType: "PriceData",
      message: this.serializeToMessage(signedPriceData.pricesBatch),
    };

    const signer = recoverTypedMessage({data: data, sig: signedPriceData.signature});

    return signer.toUpperCase() === signedPriceData.signer.toUpperCase();
  }
}

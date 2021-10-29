import { PriceDataSigned, SignedPricePackage } from "../types";

export class Broadcaster {

  async broadcast(_prices: PriceDataSigned[]): Promise<void> {
    throw new Error("`broadcast` method must be implemented");
  }

  async broadcastPricePackage(
    _signedData: SignedPricePackage,
    _providerAddress: string): Promise<void> {
      throw new Error("`broadcast` method must be implemented");
    }
};

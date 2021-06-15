import axios from "axios";
import mode from "../../mode";
import { PriceDataSigned, Broadcaster, SignedPricePackage } from "../types";

// "lambda" as this is deployed on AWS Lambda
const lambdaBroadcaster: Broadcaster = {

  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    await axios.post(mode.broadcasterUrl + '/prices', prices);
  },

  async broadcastPricePackage(
    signedData: SignedPricePackage,
    providerAddress: string): Promise<void> {
      const body = {
        timestamp: signedData.pricePackage.timestamp,
        signature: signedData.signature,
        signer: signedData.signer,
        provider: providerAddress,
      };

      await axios.post(mode.broadcasterUrl + '/packages', body);
    },
};

export default lambdaBroadcaster;

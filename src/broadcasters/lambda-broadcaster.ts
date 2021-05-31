import axios from "axios";
import mode from "../../mode";
import { PriceDataSigned, Broadcaster } from "../types";

// "lambda" as this is deployed on AWS Lambda
const lambdaBroadcaster: Broadcaster = {

  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    await axios.post(mode.broadcasterUrl, prices);
  },
};

export default lambdaBroadcaster;

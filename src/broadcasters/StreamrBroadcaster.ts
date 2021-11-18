import axios from "axios";
import { Broadcaster } from "./Broadcaster";
import { PriceDataSigned, SignedPricePackage } from "../types";
import { Consola } from "consola";
import StreamrClient from "streamr-client";

const logger = require("../utils/logger")("StreamrBroadcaster") as Consola;

const STREAMR_BROADCASTING_INTERVAL_MILLISECONDS = 3000;

export class StreamrBroadcaster implements Broadcaster {
  private streamrClient: any;
  private timer: any;
  private pricesToBroadcast: PriceDataSigned[] = [];
  private packageToBroadcast: SignedPricePackage | undefined;

  // TODO: initialize
  constructor(private readonly ethereumPrivateKey: string) {
    this.streamrClient = new StreamrClient();
  }

  // TODO: send
  private async broadcastInternal(): Promise<void> {
    if (this.pricesToBroadcast.length > 0) {
      console.log("Broadcasting prices", this.pricesToBroadcast);
    }

    if (this.packageToBroadcast) {
      console.log("Broadcasting package", this.packageToBroadcast);
    }
  }

  private lazyEnableTimer(): void {
    if (!this.timer) {
      this.timer = setInterval(
        this.broadcastInternal.bind(this),
        STREAMR_BROADCASTING_INTERVAL_MILLISECONDS)
    }
  }

  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    this.pricesToBroadcast = prices;
    this.lazyEnableTimer();
  }

  async broadcastPricePackage(
    signedData: SignedPricePackage,
    _providerAddress: string): Promise<void> {
      this.packageToBroadcast = signedData;
      this.lazyEnableTimer();
    }
}

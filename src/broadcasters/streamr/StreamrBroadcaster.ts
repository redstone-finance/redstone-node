import { Broadcaster } from "../Broadcaster";
import { PriceDataSigned, SignedPricePackage } from "../../types";
import { Consola } from "consola";
import { StreamrProxy } from "./StreamrProxy";

const logger = require("../../utils/logger")("StreamrBroadcaster") as Consola;

const STREAMR_BROADCASTING_INTERVAL_MILLISECONDS = 3000;
const PACKAGE_STREAM_NAME = "package";
const PRICES_STREAM_NAME = "prices";

export class StreamrBroadcaster implements Broadcaster {
  private streamrProxy: StreamrProxy;
  private timer: any;
  private pricesToBroadcast: PriceDataSigned[] = [];
  private packageToBroadcast: SignedPricePackage | undefined;

  constructor(ethereumPrivateKey: string) {
    this.streamrProxy = new StreamrProxy(ethereumPrivateKey);
    this.streamrProxy.tryCreateStream(PACKAGE_STREAM_NAME);
    this.streamrProxy.tryCreateStream(PRICES_STREAM_NAME);
  }

  private async broadcastInternal(): Promise<void> {
    const promises = [];

    if (this.pricesToBroadcast.length > 0) {
      const data = this.pricesToBroadcast;
      const streamName = PRICES_STREAM_NAME;
      logger.info("Broadcasting prices to streamr");
      promises.push(this.streamrProxy.publishToStreamByName(data, streamName));
    }

    if (this.packageToBroadcast) {
      const data = this.packageToBroadcast;
      const streamName = PACKAGE_STREAM_NAME;
      logger.info("Broadcasting package to streamr");
      promises.push(this.streamrProxy.publishToStreamByName(data, streamName));
    }

    await Promise.all(promises);
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

import {
  StreamrClient,
  StreamPermission,
  STREAMR_STORAGE_NODE_GERMANY,
} from "streamr-client";
import { Consola } from "consola";

const logger = require("../../utils/logger")("StreamrProxy") as Consola;

export class StreamrProxy {
  private streamrClient: StreamrClient;

  constructor(ethPrivateKey: string) {
    this.streamrClient = new StreamrClient({
      auth: { privateKey: ethPrivateKey },
    });
  }

  public async publishToStreamByName(data: any, streamName: string) {
    const streamId = await this.getStreamIdForStreamName(streamName);
    const doesStreamExist = await this.doesStreamExist(streamId);
    if (!doesStreamExist) {
      throw new Error(
        `Stream ${streamId} doesn't exist, please create Streamr stream before starting node`
      );
    }
    return await this.publish(data, streamId);
  }

  // Publishes data to the stream
  private async publish(data: any, streamId: string) {
    await this.streamrClient.publish(streamId, {
      ...data,
    });
    logger.info(`New data published to the stream: ${streamId}`);
  }

  private async getStreamIdForStreamName(name: string): Promise<string> {
    const publicAddress = await this.streamrClient.getAddress();
    const path = `/redstone-oracle/${name}`;
    return `${publicAddress}${path}`;
  }

  private async doesStreamExist(streamId: string): Promise<boolean> {
    try {
      await this.streamrClient.getStream(streamId);
      return true;
    } catch (e: any) {
      if (e.toString().includes("NOT_FOUND")) {
        return false;
      } else {
        throw e;
      }
    }
  }
}

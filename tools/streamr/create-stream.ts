import {
  StreamrClient,
  StreamPermission,
  STREAMR_STORAGE_NODE_GERMANY,
} from "streamr-client";

const privateKey = "";
const streamPath = "/redstone-oracle/";

(async () => {
  try {
    const streamrClient = new StreamrClient({
      auth: { privateKey: privateKey },
    });
    const publicAddress = await streamrClient.getAddress();
    const path = streamPath;
    const id = `${publicAddress}${path}`;

    const stream = await streamrClient.createStream({
      id,
      storageDays: 7,
      requireSignedData: false,
      inactivityThresholdHours: 24 * 20, // 20 days
    });
    console.log(`Stream created: ${stream.id}`);
    await stream.addToStorageNode(STREAMR_STORAGE_NODE_GERMANY, {
      timeout: 50000,
    });
    console.log("Stream added to the storage node: STREAMR_GERMANY");
    await stream.grantPermissions({
      permissions: [StreamPermission.SUBSCRIBE],
      public: true,
    });
    console.log(`Added permissions to the stream: ${stream.id}`);
  } catch (error: any) {
    console.error(error.stack);
  }
})();

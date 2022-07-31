import prompts from "prompts";
import {
  StreamrClient,
  StreamPermission,
  STREAMR_STORAGE_NODE_GERMANY,
} from "streamr-client";

/* A small amount of MATIC (around 0.1) is needed for gas to create stream */

const streamPath = "/redstone-oracle/";

(async () => {
  const response = await prompts([
    {
      type: "text",
      name: "privateKey",
      message: "Provide private key",
      validate: (value) => (!value ? "Private key is required" : true),
    },
  ]);

  const privateKey = response.privateKey;
  try {
    const streamrClient = new StreamrClient({
      auth: { privateKey },
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

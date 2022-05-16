import express from "express";
import { setExpressRoutes } from "../../src/routes/index";

const MOCK_NODE_CONFIG = {
  arweaveKeysFile: "",
  credentials: {
    ethereumPrivateKey: "0x1111111111111111111111111111111111111111111111111111111111111111"
  },
  addEvmSignature: true,
  manifestFile: "",
  minimumArBalance: 0.2,
  enableStreamrBroadcaster: false,
};

export function getApp() {
  const app = express();
  setExpressRoutes(app, MOCK_NODE_CONFIG);
  return app;
}

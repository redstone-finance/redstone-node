import { JWKInterface } from "arweave/node/lib/wallet";
import { Consola } from "consola";
import express from "express";
import { NodeConfig } from "./types";
import { setupRoutes } from "./routes/index";

const logger = require("./utils/logger")("express") as Consola;

const PORT = 8080;

// For now we run a very simple express app to allow running the
// redstone node in the AWS App runner.
// Read more at:

// This class will be extended in future and will be used for
// communication between nodes
export class ExpressAppRunner {
  private app: express.Application;

  constructor(private jwk: JWKInterface, private nodeConfig: NodeConfig) {
    this.app = express();

    setupRoutes(this.app, nodeConfig);
  }

  run() {
    if (process.env.NODE_ENV === "test") {
      logger.info(`Express server running skipped in test environment`);
      return;
    }
    logger.info(`Running express server on port: ${PORT}`);
    this.app.listen(PORT, () => {
      logger.info(`Server started at http://localhost:${PORT}`);
    });
  }

}

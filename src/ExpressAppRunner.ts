import { Consola } from "consola";
import exprress from "express";

const logger = require("./utils/logger")("express") as Consola;

const PORT = 8080;

// For now we run a very simple express app to allow running the
// redstone node in the AWS App runner.
// Read more at:

// This class will be extended in future and will be used for
// communication between nodes
export class ExpressAppRunner {
  private app: exprress.Application;

  constructor() {
    this.app = exprress();

    this.app.get("/", (_req, res) => {
      res.send("Hello App Runner. My name is RedStone node and I am doing good ;)");
    });
  }

  run() {
    logger.info(`Running express server on port: ${PORT}`);
    this.app.listen(PORT, () => {
      logger.info(`Server started at http://localhost:${PORT}`);
    });
  }

}

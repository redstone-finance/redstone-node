import exprress from "express";
import { NodeConfig } from "../types";
import setCustomUrlRequestsRoute from "./custom-url-requests.route";
import setHomeRoute from "./home.route";

export function setExpressRoutes(app: exprress.Application, nodeConfig: NodeConfig) {
  setCustomUrlRequestsRoute(app, nodeConfig);
  setHomeRoute(app);
}

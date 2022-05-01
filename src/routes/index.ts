import express from "express";
import setupRootRoute from "./root.route";
import setupEhloRoute from "./ehlo.route";
import setupCustomUrlRequestsRoute from "./custom-url-requests.route";
import { NodeConfig } from "../types";

export function setupRoutes(app: express.Application, nodeConfig: NodeConfig) {
  setupRootRoute(app);
  setupEhloRoute(app);
  setupCustomUrlRequestsRoute(app, nodeConfig);
}

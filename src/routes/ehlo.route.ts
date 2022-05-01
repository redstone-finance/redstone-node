// Should return
// - arweave address
// - node id (arweave address)
// - ethereum address
// - current manifest link

import express from "express";

export default (app: express.Application) => {
  app.get("/ehlo", (_req, res) => {
    res.send("TODO: implement");
  });
};

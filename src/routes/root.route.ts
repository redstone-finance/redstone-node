import express from "express";

export default (app: express.Application) => {
  app.get("/", (_req, res) => {
    res.send("Hello world! My name is RedStone node and I am doing good ;)");
  });
};

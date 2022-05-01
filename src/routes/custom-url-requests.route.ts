import { stringToBuffer } from "arweave/node/lib/utils";
import axios from "axios";
import express from "express";
import jp from "jsonpath";
import { ethers } from "ethers";
import { NodeConfig } from "../types";
import EvmPriceSigner from "../signers/EvmPriceSigner";

const EVM_CHAIN_ID = 1; // TODO: get rid of EVM_CHAIN_ID

// TODO: refactor this implementation later
// TODO: add more logging

export default (app: express.Application, nodeConfig: NodeConfig) => {
  // TODO: get version from config
  const evmSigner = new EvmPriceSigner("0.4", EVM_CHAIN_ID);

  app.get("/custom-url-requests/send", async (req, res) => {
    // TODO: add beeter invalid params handling
    const customRequestConfigBase64 = req.query["custom-request-config"] as string;
    const customRequestConfigStr = stringToBuffer(customRequestConfigBase64).buffer.toString("utf-8");
    console.log({customRequestConfigStr});
    const customRequestConfig = JSON.parse(customRequestConfigStr);

    const { url, jsonpath } = customRequestConfig;

    // Sending the request
    const response = await axios.get(url);
    const fetchedData = response.data;
    // TODO: validate if data is not empty and is a valid json
    console.log({ fetchedData });

    // Extracting the data using jsonpath
    const extractedValue = jp.query(fetchedData, jsonpath)[0];
    if (isNaN(extractedValue)) {
      throw new Error(`Extracted value is not a number: ${extractedValue}`);
    }

    // Preparing a signed data package
    const timestamp = Date.now();
    const symbol = ethers.utils.id(`${jsonpath}---${url}`);
    const dataPackage = {
      timestamp,
      prices: [{ symbol, value: extractedValue }],
    };
    const signedPackage = evmSigner.signPricePackage(
      dataPackage,
      nodeConfig.credentials.ethereumPrivateKey);

    return res.json({
      provider: signedPackage.signerPublicKey,
      liteSignature: signedPackage.liteSignature,
      prices: dataPackage.prices,
      customRequestConfig,
      timestamp,
    });
  });
};

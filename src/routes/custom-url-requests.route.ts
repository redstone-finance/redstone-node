import express from "express";
import { Consola } from "consola";
import { ethers } from "ethers";
import axios from "axios";
import jp from "jsonpath";

import { fromBase64 } from "../utils/base64";
import EvmPriceSigner from "../signers/EvmPriceSigner";
import { NodeConfig } from "../types";
import { stringifyError } from "../utils/error-stringifier";

const EVM_CHAIN_ID = 1;
const QUERY_PARAM_NAME = "custom-url-request-config-base64";
const DEFAULT_TIMEOUT_MILLISECONDS = 10000;
const logger = require("../utils/logger")(
  "custom-url-requests-route"
) as Consola;
const evmSigner = new EvmPriceSigner("0.4", EVM_CHAIN_ID);

export default function (app: express.Application, nodeConfig: NodeConfig) {
  app.get("/custom-url-requests", async (req, res) => {
    try {
      // Parsing request details
      const customRequestConfig = parseCustomUrlDetails(
        req.query[QUERY_PARAM_NAME] as string
      );
      const { url, jsonpath } = customRequestConfig;

      // Sending the request
      logger.info(`Fetching data from custom url: ${url}`);
      const response = await axios.get(url, {
        timeout: DEFAULT_TIMEOUT_MILLISECONDS,
      });
      const fetchedData = response.data;
      logger.info(
        `Fetched data from url: ${url}: ${JSON.stringify(fetchedData)}`
      );

      // Extracting value
      logger.info(`Extracting data using jsonpath: ${jsonpath}`);
      const extractedValue = jp.query(fetchedData, jsonpath)[0];
      if (isNaN(extractedValue)) {
        throw new Error(`Extracted value is not a number: ${extractedValue}`);
      }

      // Preparing a signed data package
      const timestamp = Date.now();
      const symbol = getSymbol({ url, jsonpath });
      const dataPackage = {
        timestamp,
        prices: [{ symbol, value: extractedValue }],
      };
      const signedPackage = evmSigner.signPricePackage(
        dataPackage,
        nodeConfig.credentials.ethereumPrivateKey
      );

      // Sending response
      return res.json({
        signerAddress: signedPackage.signerAddress,
        liteSignature: signedPackage.liteSignature,
        prices: dataPackage.prices,
        customRequestConfig,
        timestamp,
      });
    } catch (e) {
      const errText = stringifyError(e);
      // TODO: improve error catching later:
      // differentiate types of errors and
      // use appropriate HTTP error codes
      res.status(400).json({
        err: errText,
      });
    }
  });
}

function parseCustomUrlDetails(customRequestParamBase64: string) {
  const stringifiedConfig = fromBase64(customRequestParamBase64);
  return JSON.parse(stringifiedConfig);
}

function getSymbol(customRequestConfig: { url: string; jsonpath: string }) {
  const { url, jsonpath } = customRequestConfig;
  return ethers.utils.id(`${jsonpath}---${url}`).slice(0, 18);
}

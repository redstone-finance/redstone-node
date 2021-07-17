import {timeout} from "./utils/objects";
import {Consola} from "consola";
import {Manifest} from "./types";
import ArweaveService from "./arweave/ArweaveService";
import ArweaveProxy from "./arweave/ArweaveProxy";
import {JWKInterface} from "arweave/node/lib/wallet";
import {trackEnd, trackStart} from "./utils/performance-tracker";

const logger = require("./utils/logger")("manifest-load") as Consola;

// possible risk - https://github.com/nodejs/node/issues/15651

const load = async (currentManifestTxId: string, jwk: JWKInterface, minArBalance: number): Promise<any> => {
  const arweave = new ArweaveProxy(jwk);
  const arweaveService = new ArweaveService(arweave, minArBalance);
  const manifestFetchTrackingId = trackStart("Fetching manifest.");

  try {
    return Promise.race([
      arweaveService.getCurrentManifest(),
      timeout(25000)
    ]).then((value) => {
      if (value === "timeout") {
        logger.warn("Manifest load promise timeout");
      } else {
        handleLoadedManifest(value, currentManifestTxId);
      }
    }).finally(() => {
      trackEnd(manifestFetchTrackingId);
    });

  } catch (e) {
    logger.error("Error while calling manifest load function.", e);
    trackEnd(manifestFetchTrackingId);
    process.exit(1);
  }
}

const handleLoadedManifest = (loadedManifest: Manifest | null, currentManifestTxId: string) => {
  if (!loadedManifest) {
    return;
  }
  logger.info("Manifest successfully loaded", {
    "loadedManifestTxId": loadedManifest.txId,
    "currentTxId": currentManifestTxId
  });
  if (loadedManifest.txId !== undefined && loadedManifest.txId != currentManifestTxId) {
    logger.info("Loaded and current manifest differ, updating on next runIteration call.");
    // @ts-ignore
    process.send(loadedManifest);
  } else {
    logger.info("Loaded manifest same as current, not updating.");
  }
  loadedManifest = null;
}

process.on('message', (msg) => {
  logger.info("Manifest load forked process...");
  load(msg.currentManifestTxId, msg.jwk, msg.minArBalance).then(() => {
    logger.info("Exiting forked process...");
    process.exit(0);
  });
});

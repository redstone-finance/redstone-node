import { Consola } from "consola";
import { getKeyFromMnemonic } from "arweave-mnemonic-keys";
import { Wallet } from "ethers";
import aggregators from "./aggregators";
import ArweaveProxy from "./arweave/ArweaveProxy";
import mode from "../mode";
import ManifestHelper, { TokensBySource } from "./manifest/ManifestParser";
import ArweaveService from "./arweave/ArweaveService";
import { mergeObjects, readJSON, timeout } from "./utils/objects";
import PriceSignerService from "./signers/PriceSignerService";
import { ExpressAppRunner } from "./ExpressAppRunner";
import {
  printTrackingState,
  trackEnd,
  trackStart,
} from "./utils/performance-tracker";
import PricesService, {
  PricesBeforeAggregation,
  PricesDataFetched,
} from "./fetchers/PricesService";
import {
  Broadcaster,
  HttpBroadcaster,
  StreamrBroadcaster,
} from "./broadcasters";
import {
  Manifest,
  NodeConfig,
  PriceDataAfterAggregation,
  PriceDataSigned,
  SignedPricePackage,
} from "./types";
import { BundlrService } from "./arweave/BundlrService";
import BundlrTransaction from "@bundlr-network/client/build/common/transaction";

const logger = require("./utils/logger")("runner") as Consola;
const pjson = require("../package.json") as any;

export const MANIFEST_REFRESH_INTERVAL = 120 * 1000;
const MANIFEST_LOAD_TIMEOUT_MS = 25 * 1000;

export default class NodeRunner {
  private readonly version: string;

  private lastManifestLoadTimestamp?: number;
  // note: all below '?' class fields have to be re-initialized after reading
  // new manifest in this.useNewManifest(manifest); - as they depend on the current manifest.
  private currentManifest?: Manifest;
  private pricesService?: PricesService;
  private tokensBySource?: TokensBySource;
  private newManifest: Manifest | null = null;
  private priceSignerService?: PriceSignerService;
  private httpBroadcaster: Broadcaster;
  private streamrBroadcaster: Broadcaster;

  private constructor(
    private readonly arweaveService: ArweaveService,
    private readonly bundlrService: BundlrService,
    private readonly providerAddress: string,
    private readonly nodeConfig: NodeConfig,
    initialManifest: Manifest,
  ) {
    this.version = getVersionFromPackageJSON();
    const minimumArBalance = this.nodeConfig.minimumArBalance;
    if (this.nodeConfig.minimumArBalance === undefined || typeof (minimumArBalance) !== "number") {
      throw new Error("minimumArBalance not defined in config file");
    }
    this.useNewManifest(initialManifest);
    this.lastManifestLoadTimestamp = Date.now();
    this.httpBroadcaster = new HttpBroadcaster(nodeConfig.httpBroadcasterURLs);
    const ethersWallet = Wallet.fromMnemonic(nodeConfig.mnemonic);
    this.streamrBroadcaster = new StreamrBroadcaster(ethersWallet.privateKey);

    // https://www.freecodecamp.org/news/the-complete-guide-to-this-in-javascript/
    // alternatively use arrow functions...
    this.runIteration = this.runIteration.bind(this);
    this.handleLoadedManifest = this.handleLoadedManifest.bind(this);
  }

  static async create(nodeConfig: NodeConfig): Promise<NodeRunner> {
    // Running a simple web server
    // It should be called as early as possible
    // Otherwise App Runner crashes ¯\_(ツ)_/¯
    new ExpressAppRunner().run();
  
    const { mnemonic, useManifestFromSmartContract, manifestFile } = nodeConfig;
    const jwk = await getKeyFromMnemonic(mnemonic);
    const arweave = new ArweaveProxy(jwk);
    const providerAddress = await arweave.getAddress();
    const arweaveService = new ArweaveService(arweave);
    const bundlrService = new BundlrService(jwk, nodeConfig.minimumArBalance);

    let manifestData = null;
    if (useManifestFromSmartContract) {
      while (true) {
        logger.info("Fetching manifest data.");
        try {
          manifestData = await arweaveService.getCurrentManifest();
        } catch (e: any) {
          logger.error("Initial manifest read failed.", e.stack || e);
        }
        if (manifestData !== null) {
          logger.info("Fetched manifest", manifestData)
          break;
        }
      }
    } else {
      manifestData = readJSON(manifestFile!);
    }

    return new NodeRunner(
      arweaveService,
      bundlrService,
      providerAddress,
      nodeConfig,
      manifestData
    );
  }

  async run(): Promise<void> {
    logger.info(
      `Running redstone-node with manifest:
      ${JSON.stringify(this.currentManifest)}
      Version: ${this.version}
      Address: ${this.providerAddress}
    `);

    await this.warnIfARBalanceLow();

    try {
      await this.runIteration(); // Start immediately then repeat in manifest.interval
      setInterval(this.runIteration, this.currentManifest!.interval);
    } catch (e: any) {
      NodeRunner.reThrowIfManifestConfigError(e);
    }
  }

  private async runIteration() {
    logger.info("Running new iteration.");

    if (this.newManifest !== null) {
      logger.info("Using new manifest: ", this.newManifest.txId);
      this.useNewManifest(this.newManifest)
    }

    this.maybeLoadManifestFromSmartContract();
    await this.safeProcessManifestTokens();
    await this.warnIfARBalanceLow();

    printTrackingState();
  };

  private async safeProcessManifestTokens() {
    const processingAllTrackingId = trackStart("processing-all");
    try {
      await this.doProcessTokens();
    } catch (e: any) {
      NodeRunner.reThrowIfManifestConfigError(e);
    } finally {
      trackEnd(processingAllTrackingId);
    }
  }

  private async warnIfARBalanceLow() {
    const balanceCheckingTrackingId = trackStart("balance-checking");
    try {
      const {balance, isBalanceLow} = await this.bundlrService.checkBalance();
      if (isBalanceLow) {
        logger.warn(`AR balance is quite low on bundlr wallet: ${balance}`);
      }
    } catch (e: any) {
      logger.error("Balance checking failed", e.stack);
    } finally {
      trackEnd(balanceCheckingTrackingId);
    }
  }

  private async doProcessTokens(): Promise<void> {
    logger.info("Processing tokens");

    // Fetching and aggregating
    const aggregatedPrices: PriceDataAfterAggregation[] = await this.fetchPrices();
    const bundlrTx: BundlrTransaction = await this.bundlrService.prepareBundlrTransaction(
      aggregatedPrices,
      this.nodeConfig.omitSourcesInArweaveTx);
    const pricesReadyForSigning = this.pricesService!.preparePricesForSigning(
      aggregatedPrices,
      bundlrTx.id,
      this.providerAddress);

    // Signing
    const signedPrices: PriceDataSigned[] =
      await this.priceSignerService!.signPrices(pricesReadyForSigning);

    // Broadcasting
    await this.broadcastPrices(signedPrices);
    await this.broadcastEvmPricePackage(signedPrices);

    if (this.shouldBackupOnArweave()) {
      await this.bundlrService.uploadBundlrTransaction(bundlrTx);
    } else {
      logger.info(`Arweave (bundlr) tx posting skipped: ${bundlrTx.id}`);
    }
  }

  private shouldBackupOnArweave() {
    return mode.isProd && this.currentManifest?.enableArweaveBackup;
  }

  private async fetchPrices(): Promise<PriceDataAfterAggregation[]> {
    const fetchingAllTrackingId = trackStart("fetching-all");

    const fetchTimestamp = Date.now();
    const fetchedPrices = await this.pricesService!.fetchInParallel(this.tokensBySource!)
    const pricesData: PricesDataFetched = mergeObjects(fetchedPrices);
    const pricesBeforeAggregation: PricesBeforeAggregation =
      PricesService.groupPricesByToken(fetchTimestamp, pricesData, this.version);

    const aggregatedPrices: PriceDataAfterAggregation[] = this.pricesService!.calculateAggregatedValues(
      Object.values(pricesBeforeAggregation), // what is the advantage of using lodash.values?
      aggregators[this.currentManifest!.priceAggregator]
    );
    NodeRunner.printAggregatedPrices(aggregatedPrices);
    trackEnd(fetchingAllTrackingId);
    return aggregatedPrices;
  }

  private async broadcastPrices(signedPrices: PriceDataSigned[]) {
    logger.info("Broadcasting prices");
    const broadcastingTrackingId = trackStart("broadcasting");
    try {
      const promises = [];
      promises.push(this.httpBroadcaster.broadcast(signedPrices));
      if (this.nodeConfig.enableStreamrBroadcaster && !this.nodeConfig.disableSinglePricesBroadcastingInStreamr) {
        promises.push(this.streamrBroadcaster.broadcast(signedPrices));
      }
      const results = await Promise.allSettled(promises);

      // Check if all promises resolved
      const failedBroadcastersCount =
        results.filter(res => res.status === "rejected").length;
      if (failedBroadcastersCount > 0) {
        throw new Error(`${failedBroadcastersCount} broadcasters failed`);
      }

      logger.info("Broadcasting completed");
    } catch (e: any) {
      if (e.response !== undefined) {
        logger.error("Broadcasting failed: " + e.response.data, e.stack);
      } else {
        logger.error("Broadcasting failed", e.stack);
      }
    } finally {
      trackEnd(broadcastingTrackingId);
    }
  }

  private static printAggregatedPrices(prices: PriceDataAfterAggregation[]): void {
    for (const price of prices) {
      const sourcesData = JSON.stringify(price.source);
      logger.info(
        `Fetched price : ${price.symbol} : ${price.value} | ${sourcesData}`);
    }
  }

  private async broadcastEvmPricePackage(signedPrices: PriceDataSigned[]) {
    logger.info("Broadcasting price package");
    const packageBroadcastingTrackingId = trackStart("package-broadcasting");
    try {
      const signedPackage = this.priceSignerService!.signPricePackage(signedPrices);
      await this.broadcastSignedPricePackage(signedPackage);
      logger.info("Package broadcasting completed");
    } catch (e: any) {
      logger.error("Package broadcasting failed", e.stack);
    } finally {
      trackEnd(packageBroadcastingTrackingId);
    }
  }

  private async broadcastSignedPricePackage(signedPackage: SignedPricePackage) {
    const signedPackageBroadcastingTrackingId =
      trackStart("signed-package-broadcasting");
    try {
      const promises = [];
      promises.push(this.httpBroadcaster.broadcastPricePackage(
        signedPackage,
        this.providerAddress));
      if (this.nodeConfig.enableStreamrBroadcaster) {
        promises.push(this.streamrBroadcaster.broadcastPricePackage(
          signedPackage,
          this.providerAddress));
      }
      await Promise.all(promises);
    } catch (e: any) {
      if (e.response !== undefined) {
        logger.error(
          "Signed package broadcasting failed: " + e.response.data,
          e.stack);
      } else {
        logger.error("Signed package broadcasting failed", e.stack);
      }
    } finally {
      trackEnd(signedPackageBroadcastingTrackingId);
    }
  }

  private static reThrowIfManifestConfigError(e: Error) {
    if (e.name == "ManifestConfigError") {
      throw e;
    } else {
      logger.error(e.stack);
    }
  }

  // TODO: refactor to a separate service?
  private maybeLoadManifestFromSmartContract() {
    if (!this.nodeConfig.useManifestFromSmartContract) {
      return;
    }

    const now = Date.now();
    const timeDiff = now - this.lastManifestLoadTimestamp!;
    logger.info("Checking time since last manifest load", {
      timeDiff,
      "manifestRefreshInterval": MANIFEST_REFRESH_INTERVAL
    })

    if (timeDiff >= MANIFEST_REFRESH_INTERVAL) {
      this.lastManifestLoadTimestamp = now;
      logger.info("Trying to fetch new manifest version.");
      const manifestFetchTrackingId = trackStart("Fetching manifest.");
      try {
        // note: not using "await" here, as loading manifest's data takes about 6 seconds and we do not want to
        // block standard node processing for so long (especially for nodes with low "interval" value)
        Promise.race([
          this.arweaveService.getCurrentManifest(),
          timeout(MANIFEST_LOAD_TIMEOUT_MS)
        ]).then((value) => {
          if (value === "timeout") {
            logger.warn("Manifest load promise timeout");
          } else {
            this.handleLoadedManifest(value);
          }
          trackEnd(manifestFetchTrackingId);
        });

      } catch (e: any) {
        logger.info("Error while calling manifest load function.")
      }
    } else {
      logger.info("Skipping manifest download in this iteration run.")
    }
  }

  private handleLoadedManifest(loadedManifest: Manifest | null) {
    if (!loadedManifest) {
      return;
    }
    logger.info("Manifest successfully loaded", {
      "loadedManifestTxId": loadedManifest.txId,
      "currentTxId": this.currentManifest?.txId
    });
    if (loadedManifest.txId != this.currentManifest?.txId) {
      logger.info("Loaded and current manifest differ, updating on next runIteration call.");
      // we're temporarily saving loaded manifest on a separate "newManifest" field
      // - calling "this.useNewManifest(this.newManifest)" here could cause that
      // that different manifests would be used by different services during given "runIteration" execution.
      this.newManifest = loadedManifest;
      loadedManifest = null;
    } else {
      logger.info("Loaded manifest same as current, not updating.");
    }
  }

  private useNewManifest(newManifest: Manifest) {
    this.currentManifest = newManifest;
    this.pricesService = new PricesService(newManifest, this.nodeConfig.credentials);
    this.tokensBySource = ManifestHelper.groupTokensBySource(newManifest);
    const ethersWallet = Wallet.fromMnemonic(this.nodeConfig.mnemonic);
    this.priceSignerService = new PriceSignerService({
      ethereumPrivateKey: ethersWallet.privateKey,
      evmChainId: newManifest.evmChainId,
      version: this.version,
      addEvmSignature: Boolean(this.nodeConfig.addEvmSignature),
    });
    this.newManifest = null;
  }

};

function getVersionFromPackageJSON() {
  const [major, minor] = pjson.version.split(".");
  return major + '.' + minor;
}

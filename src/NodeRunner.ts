import {Consola} from "consola";
import {JWKInterface} from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
import aggregators from "./aggregators";
import broadcaster from "./broadcasters/lambda-broadcaster";
import ArweaveProxy from "./arweave/ArweaveProxy";
import EvmPriceSigner from "./utils/EvmPriceSigner";
import {trackEnd, trackStart, printTrackingState} from "./utils/performance-tracker";
import {Manifest, NodeConfig, PriceDataAfterAggregation, PriceDataSigned, SignedPricePackage} from "./types";
import mode from "../mode";
import ManifestHelper, {TokensBySource} from "./manifest/ManifestParser";
import ArweaveService from "./arweave/ArweaveService";
import PricesService, {PricesBeforeAggregation, PricesDataFetched} from "./fetchers/PricesService";
import {mergeObjects} from "./utils/objects";
import _ from "lodash";

const logger = require("./utils/logger")("runner") as Consola;
const pjson = require("../package.json") as any;


export default class NodeRunner {
  private version: string;
  private arService: ArweaveService;
  private pricesService: PricesService;
  private tokensBySource: TokensBySource;
  private evmSigner: EvmPriceSigner;

  private constructor(
    private manifest: Manifest,
    private arweave: ArweaveProxy,
    private providerAddress: string,
    private nodeConfig: NodeConfig,
  ) {
    this.version = getVersionFromPackageJSON();
    const minimumArBalance = this.nodeConfig.minimumArBalance;
    if (this.nodeConfig.minimumArBalance === undefined || typeof(minimumArBalance) !== "number") {
      throw new Error("minimumArBalance not defined in config file");
    }
    this.arService = new ArweaveService(this.arweave, minimumArBalance);
    this.pricesService = new PricesService(manifest, this.nodeConfig.credentials);
    this.tokensBySource = ManifestHelper.groupTokensBySource(manifest);
    this.evmSigner = new EvmPriceSigner(this.version, this.manifest.evmChainId);

    //note: setInterval binds "this" to a new context
    //https://www.freecodecamp.org/news/the-complete-guide-to-this-in-javascript/
    //alternatively use arrow functions...
    this.runIteration = this.runIteration.bind(this);
  }

  static async create(
    manifest: Manifest,
    jwk: JWKInterface,
    nodeConfig: NodeConfig,
  ): Promise<NodeRunner> {
    const arweave = new ArweaveProxy(jwk);
    const providerAddress = await arweave.getAddress();

    return new NodeRunner(
      manifest,
      arweave,
      providerAddress,
      nodeConfig
    );
  }

  async run(): Promise<void> {
    logger.info(
      `Running redstone-node with manifest:
      ${JSON.stringify(this.manifest)}
      Version: ${this.version}
      Address: ${this.providerAddress}
    `);

    await this.exitIfBalanceTooLow();

    try {
      await this.runIteration(); // Start immediately then repeat in manifest.interval
      setInterval(this.runIteration, this.manifest.interval);
    } catch (e) {
      this.reThrowIfManifestConfigError(e);
    }
  }

  private async exitIfBalanceTooLow() {
    const {balance, isBalanceLow} = await this.arService.checkBalance();
    if (isBalanceLow) {
      logger.fatal(
        `You should have at least ${this.nodeConfig.minimumArBalance}
         AR to start a node service. Current balance: ${balance}`);
      throw new Error("AR balance too low to start node.");
    }
  }

  private async runIteration() {
    await this.safeProcessManifestTokens();
    await this.warnIfARBalanceLow();
    printTrackingState();
  };

  private async safeProcessManifestTokens() {
    const processingAllTrackingId = trackStart("processing-all");
    try {
      await this.doProcessTokens();
    } catch (e) {
      this.reThrowIfManifestConfigError(e);
    } finally {
      trackEnd(processingAllTrackingId);
    }
  }

  private async warnIfARBalanceLow() {
    const balanceCheckingTrackingId = trackStart("balance-checking");
    try {
      const {balance, isBalanceLow} = await this.arService.checkBalance();
      if (isBalanceLow) {
        logger.warn(`AR balance is quite low: ${balance}`);
      }
    } catch (e) {
      logger.error("Balance checking failed", e.stack);
    } finally {
      trackEnd(balanceCheckingTrackingId);
    }
  }

  private async doProcessTokens(): Promise<void> {
    logger.info("Processing tokens");

    const aggregatedPrices: PriceDataAfterAggregation[] = await this.fetchPrices();

    const arTransaction: Transaction = await this.arService.prepareArweaveTransaction(aggregatedPrices, this.version);

    const signedPrices: PriceDataSigned[] = await this.arService.signPrices(
      aggregatedPrices, arTransaction.id, this.providerAddress);

    await this.broadcastPrices(signedPrices)

    await this.broadcastEvmPricePackage(signedPrices);

    if (mode.isProd) {
      await this.arService.storePricesOnArweave(arTransaction);
    } else {
      logger.info(
        `Transaction posting skipped in non-prod env: ${arTransaction.id}`);
    }
  }

  private async fetchPrices(): Promise<PriceDataAfterAggregation[]> {
    const fetchingAllTrackingId = trackStart("fetching-all");

    const fetchTimestamp = Date.now();
    const fetchedPrices = await this.pricesService.fetchInParallel(this.tokensBySource)
    const pricesData: PricesDataFetched = mergeObjects(fetchedPrices);
    const pricesBeforeAggregation: PricesBeforeAggregation =
      PricesService.groupPricesByToken(fetchTimestamp, pricesData, this.version);

    const aggregatedPrices: PriceDataAfterAggregation[] = this.pricesService.calculateAggregatedValues(
      Object.values(pricesBeforeAggregation), //what is the advantage of using lodash.values?
      aggregators[this.manifest.priceAggregator]
    );
    this.printAggregatedPrices(aggregatedPrices);

    trackEnd(fetchingAllTrackingId);

    return aggregatedPrices;
  }

  private async broadcastPrices(signedPrices: PriceDataSigned[]) {
    logger.info("Broadcasting prices");
    const broadcastingTrackingId = trackStart("broadcasting");
    try {
      await broadcaster.broadcast(signedPrices);
      logger.info("Broadcasting completed");
    } catch (e) {
      if (e.response !== undefined) {
        logger.error("Broadcasting failed: " + e.response.data, e.stack);
      } else {
        logger.error("Broadcasting failed", e.stack);
      }
    } finally {
      trackEnd(broadcastingTrackingId);
    }
  }

  private async broadcastEvmPricePackage(signedPrices: PriceDataSigned[]) {
    logger.info("Broadcasting price package");
    const packageBroadcastingTrackingId = trackStart("package-broadcasting");
    try {
      const signedPackage = this.evmSigner.getSignedPackage(
        signedPrices,
        this.nodeConfig.credentials.ethereumPrivateKey);
      await this.broadcastSignedPricePackage(signedPackage);
      logger.info("Package broadcasting completed");
    } catch (e) {
      logger.error("Package broadcasting failed", e.stack);
    } finally {
      trackEnd(packageBroadcastingTrackingId);
    }
  }

  private async broadcastSignedPricePackage(signedPackage: SignedPricePackage) {
    const signedPackageBroadcastingTrackingId =
      trackStart("signed-package-broadcasting");
    try {
      await broadcaster.broadcastPricePackage(
        signedPackage,
        this.providerAddress);
    } catch (e) {
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

  private printAggregatedPrices(prices: PriceDataAfterAggregation[]): void {
    for (const price of prices) {
      const sourcesData = JSON.stringify(price.source);
      logger.info(
        `Fetched price : ${price.symbol} : ${price.value} | ${sourcesData}`);
    }
  }

  private reThrowIfManifestConfigError(e: Error) {
    if (e.name == "ManifestConfigError") {
      throw e;
    } else {
      logger.error(e.stack);
    }
  }
};

function getVersionFromPackageJSON() {
  const [major, minor] = pjson.version.split(".");
  return major + '.' + minor;
}

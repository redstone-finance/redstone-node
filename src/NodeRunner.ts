import {Consola} from "consola";
import {JWKInterface} from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
import aggregators from "./aggregators";
import broadcaster from "./broadcasters/lambda-broadcaster";
import ArweaveProxy from "./arweave/ArweaveProxy";
import {trackEnd, trackStart} from "./utils/performance-tracker";
import {Manifest, NodeConfig, PriceDataAfterAggregation, PriceDataSigned} from "./types";
import mode from "../mode";
import ManifestHelper, {TokensBySource} from "./manifest/ManifestParser";
import ArweaveService from "./arweave/ArweaveService";
import PricesService, {PricesBeforeAggregation, PricesDataFetched} from "./fetchers/PricesService";
import {mergeObjects} from "./utils/objects";
import ManifestConfigError from "./manifest/ManifestConfigError";

const logger = require("./utils/logger")("runner") as Consola;
const pjson = require("../package.json") as any;


export default class NodeRunner {
  private version: string;
  private arService: ArweaveService;
  private pricesService: PricesService;
  private tokensBySource: TokensBySource;

  private constructor(
    private manifest: Manifest,
    private arweave: ArweaveProxy,
    private providerAddress: string,
    private nodeConfig: NodeConfig,
  ) {
    this.version = getVersionFromPackageJSON();
    this.arService = new ArweaveService(
      this.arweave, this.nodeConfig.minimumArBalance);
    this.pricesService = new PricesService(manifest, this.nodeConfig.credentials);
    this.tokensBySource = ManifestHelper.groupTokensBySource(manifest);

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
  };

  private async safeProcessManifestTokens() {
    try {
      trackStart("processing-all");
      await this.doProcessTokens();
    } catch (e) {
      this.reThrowIfManifestConfigError(e);
    } finally {
      trackEnd("processing-all");
    }
  }

  private async warnIfARBalanceLow() {
    try {
      trackStart("balance-checking");
      const {balance, isBalanceLow} = await this.arService.checkBalance();
      if (isBalanceLow) {
        logger.warn(`AR balance is quite low: ${balance}`);
      }
    } catch (e) {
      logger.error("Balance checking failed", e.stack);
    } finally {
      trackEnd("balance-checking");
    }
  }

  private async doProcessTokens(): Promise<void> {
    logger.info("Processing tokens");

    const aggregatedPrices: PriceDataAfterAggregation[] = await this.fetchPrices();

    const arTransaction: Transaction = await this.arService.prepareArweaveTransaction(aggregatedPrices, this.version);

    const signedPrices: PriceDataSigned[] = await this.arService.signPrices(
      aggregatedPrices, arTransaction.id, this.providerAddress);

    await this.broadcastPrices(signedPrices)

    if (mode.isProd) {
      await this.arService.storePricesOnArweave(arTransaction);
    } else {
      logger.info(
        `Transaction posting skipped in non-prod env: ${arTransaction.id}`);
    }
  }

  private async fetchPrices(): Promise<PriceDataAfterAggregation[]> {
    trackStart("fetching-all");

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

    trackEnd("fetching-all");

    return aggregatedPrices;
  }

  private async broadcastPrices(signedPrices: PriceDataSigned[]) {
    logger.info("Broadcasting prices");
    try {
      trackStart("broadcasting");
      await broadcaster.broadcast(signedPrices);
      logger.info("Broadcasting completed");
    } catch (e) {
      if (e.response !== undefined) {
        logger.error("Broadcasting failed: " + e.response.data, e.stack);
      } else {
        logger.error("Broadcasting failed", e.stack);
      }
    } finally {
      trackEnd("broadcasting");
    }
  }

  private printAggregatedPrices(prices: PriceDataAfterAggregation[]): void {
    trackStart("fetched-prices-printing");
    for (const price of prices) {
      const sourcesData = JSON.stringify(price.source);
      logger.info(
        `Fetched price : ${price.symbol} : ${price.value} | ${sourcesData}`);
    }
    trackEnd("fetched-prices-printing");
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

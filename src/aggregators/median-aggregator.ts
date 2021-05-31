import {Consola} from "consola";
import {Aggregator, Manifest, PriceDataAfterAggregation, PriceDataBeforeAggregation,} from "../types";
import ManifestHelper from "../manifest/ManifestParser";

const logger =
  require("../utils/logger")("aggregators/median-aggregator") as Consola;

const medianAggregator: Aggregator = {
  getAggregatedValue(
    price: PriceDataBeforeAggregation,
    maxPriceDeviationPercent: number
  ): PriceDataAfterAggregation {
    const initialValues = getNonZeroValues(price);
    const initialMedian = getMedianValue(initialValues);

    // Filtering out values based on deviation from the initial median
    const finalValues = [];
    for (const value of initialValues) {
      const deviation =
        (Math.abs(value - initialMedian) / initialMedian) * 100;
      if (deviation > maxPriceDeviationPercent) {
        logger.warn(
          `Value ${value} has too big deviation (${deviation}) from median. `
          + `Symbol: ${price.symbol}. Skipping...`,
          price);
      } else {
        finalValues.push(value);
      }
    }

    return {
      ...price,
      value: getMedianValue(finalValues),
    };
  },
};

export function getNonZeroValues(price: PriceDataBeforeAggregation): number[] {
  const values: number[] = [];

  for (const source of Object.keys(price.source)) {
    const value = price.source[source];
    if (value <= 0) {
      logger.warn(
        `Incorrect price value (<= 0) for source: ${source}`,
        price);
    } else {
      values.push(value);
    }
  }

  return values;
}

export function getMedianValue(arr: number[]): number {
  if (arr.length === 0) {
    throw new Error("Cannot get median value of an empty array");
  }

  arr = arr.sort((a, b) => a - b);

  const middle = Math.floor(arr.length / 2);

  if (arr.length % 2 === 0) {
    return (arr[middle] + arr[middle - 1]) / 2;
  } else {
    return arr[middle];
  }
}

export default medianAggregator;

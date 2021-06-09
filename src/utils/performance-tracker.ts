import { performance } from "perf_hooks";
import axios from "axios";
import { Consola } from "consola";
import mode from "../../mode";

const logger = require("./logger")("utils/performance-tracker") as Consola;
const URL = "https://api.redstone.finance/metrics";
const tasks: { [trackingId: string]: {
  label: string;
  start: number;
} } = {};

export function trackStart(label: string): string {
  if (label === "") {
    throw new Error("Label cannot be empty");
  }

  const trackingId = `${label}-${String(performance.now())}`;

  if (tasks[trackingId] !== undefined) {
    logger.warn(
      `Tracking id "${trackingId} is already being used."`);
  } else {
    tasks[trackingId] = {
      label,
      start: performance.now(),
    };
  }

  return trackingId;
}

export function trackEnd(trackingId: string): void {
  if (trackingId === "") {
    throw new Error("Tracking id cannot be empty");
  }

  if (tasks[trackingId] === undefined) {
    logger.warn(
      `Cannot execute trackEnd for ${trackingId} without trackStart calling`);
    return;
  }

  // Calculating time elapsed from the task trackStart
  // execution for the same label
  const value = performance.now() - tasks[trackingId].start;
  const label = tasks[trackingId].label;

  // Clear the start value
  delete tasks[trackingId];

  // Saving metric using Redstone HTTP endpoint
  saveMetric(label, value);
}

async function saveMetric(label: string, value: number): Promise<void> {
  let labelWithPrefix = label;
  if (process.env.PERFORMANCE_TRACKING_LABEL_PREFIX) {
    labelWithPrefix =
      `${process.env.PERFORMANCE_TRACKING_LABEL_PREFIX}-${label}`;
  }

  if (mode.isProd) {
    await axios.post(URL, {
      label: labelWithPrefix,
      value,
    });
  } else {
    logger.info(`Metric: ${labelWithPrefix}. Value: ${value}`);
  }
}

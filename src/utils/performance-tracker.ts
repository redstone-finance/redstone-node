import { performance } from "perf_hooks";
import axios from "axios";
import { Consola } from "consola";
import mode from "../../mode";

const logger = require("./logger")("utils/performance-tracker") as Consola;
const URL = "https://api.redstone.finance/metrics";
const tasks: { [label: string]: number } = {};

export function trackStart(label: string): void {
  if (label === "") {
    throw new Error("Label cannot be empty");
  }

  if (tasks[label] !== undefined) {
    logger.info(
      `Label "${label} is already being tracked. Updating start time"`);
  }

  tasks[label] = performance.now();
}

export function trackEnd(label: string): void {
  if (label === "") {
    throw new Error("Label cannot be empty");
  }

  if (tasks[label] === undefined) {
    logger.warn(
      "Cannot execute trackEnd without trackStart calling");
    return;
  }

  // Calculating time elapsed from the task trackStart
  // execution for the same label
  const value = performance.now() - tasks[label];

  // Clear the start value
  delete tasks[label];

  // Saving metric using Redstone HTTP endpoint
  saveMetric(label, value);
}

async function saveMetric(label: string, value: number): Promise<void> {
  if (mode.isProd) {
    await axios.post(URL, {
      label,
      value,
    });
  } else {
    logger.info(`Metric: ${label}. Value: ${value}`);
  }
}

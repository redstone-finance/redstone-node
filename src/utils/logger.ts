import consola from "consola";
import { getConfigFromEnv } from "../config/get-config-from-env";
import { ConsolaErrorReporter } from "./error-reporter";

export = (moduleName: string) => {

  let mainReporter = new (consola as any).FancyReporter();

  // Currently we can set reporters using env variables
  const { enableJsonLogs } = getConfigFromEnv();
  if (enableJsonLogs) {
    mainReporter = new (consola as any).JSONReporter();
  }

  return consola.create({
    // Here we can pass additional options for logger configuration

    // level: 4
    reporters: [
      mainReporter,
      new ConsolaErrorReporter(),
    ],
  }).withTag(moduleName);
}

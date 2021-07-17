import consola, {LogLevel} from "consola";
import {ConsolaErrorReporter} from "./error-reporter";

export = (moduleName: string) => {

  let mainReporter = new (consola as any).FancyReporter();

  // Currently we can set reporters using env variables
  if (process.env.ENABLE_JSON_LOGS === "true") {
    mainReporter = new (consola as any).JSONReporter();
  }

  return consola.create({
    // Here we can pass additional options for logger configuration

    level: LogLevel.Debug,
    reporters: [
      mainReporter,
      new ConsolaErrorReporter(),
    ],
  }).withTag(moduleName);
}


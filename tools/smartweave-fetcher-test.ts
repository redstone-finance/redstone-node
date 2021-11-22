/* eslint-disable */
import { LoggerFactory } from 'redstone-smartweave';
import { TsLogFactory } from 'redstone-smartweave/lib/cjs/logging/node/TsLogFactory';
import { SmartWeaveFetcher } from '../src/fetchers/smartweave/SmartWeaveFetcher';

async function main() {
  LoggerFactory.use(new TsLogFactory());
  LoggerFactory.INST.logLevel("info");

  const fetcher = new SmartWeaveFetcher();

  await doFetch();
  setInterval(async () => {
    await doFetch();
  }, 5000);

  async function doFetch() {
    const result = await fetcher.fetchAll([
      "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU",
      "XQkGzXG6YknJyy-YbakEZvQKAWkW2_aPRhc3ShC8lyA",
    ]);

    if (result.length > 0) {
      console.log(result.length, {
        [result[0].symbol]: result[0].value.state,
        [result[1].symbol]: result[1].value.state,
      });
    }
  }
}

main().catch((e) => console.error(e));

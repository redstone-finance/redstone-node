import axios from "axios";
import _ from "lodash";
import jp from "jsonpath";
import { FetcherOpts, PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

// TODO: improve this implementation
// It's just a PoC now

export class CustomUrlsFetcher extends BaseFetcher {
  constructor() {
    super(`custom-urls`);
  }

  async fetchData(ids: string[], opts: FetcherOpts) {
    const responses: any = {};
    const promises = [];

    for (const id of ids) {
      // TODO: maybe implement hash verification later

      const url = opts.manifest.tokens[id].customUrlDetails!.url;

      // TODO: implement timeout for each url
      // TODO: add error logging
      const promise = axios.get(url).then(response => {
        responses[id] = response.data;
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);

    return responses;
  }

  async extractPrices(responses: any, _ids: string[], opts: FetcherOpts): Promise<PricesObj> {
    const pricesObj: PricesObj = {};
    for (const [id, response] of Object.entries(responses)) {
      const jsonpath = opts.manifest.tokens[id].customUrlDetails!.jsonpath;
      const extractedValue = jp.query(response, jsonpath);
      pricesObj[id] = extractedValue[0];
    }
    return pricesObj;
  }
};

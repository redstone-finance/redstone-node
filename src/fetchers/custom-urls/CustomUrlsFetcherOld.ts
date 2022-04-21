import axios from "axios";
import _ from "lodash";
import jp from "jsonpath";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

const SEPARATOR = "-----";

// TODO: improve this implementation
// It's just a PoC now

export class CustomUrlsFetcher extends BaseFetcher {
  constructor() {
    super(`custom-urls`);
  }

  async fetchData(ids: string[]) {
    const responses: any = {};
    const promises = [];

    for (const id of ids) {
      const [, url] = id.split(SEPARATOR);
      // TODO implement timeout for each url
      const promise = axios.get(url).then(response => {
        responses[id] = response.data;
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);

    return responses;
  }

  async extractPrices(responses: any): Promise<PricesObj> {
    const pricesObj: PricesObj = {};
    for (const [id, response] of Object.entries(responses)) {
      const [jsonPath] = id.split(SEPARATOR);
      const extractedValue = jp.query(response, jsonPath);
      pricesObj[id] = extractedValue[0];
    }
    return pricesObj;
  }

};

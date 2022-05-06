import { string } from "yargs";

const axios = require("axios").default;

export default class TwelvedataProxy {
  API_KEY: string;

  constructor(key: string) {
    this.API_KEY = key;
  }

  async getExchangeRates(ids: string[]) {
    const results: { [id: string]: number }[] = [];

    for (const id of ids) {
      const temp_obj: { [id: string]: number } = {};
      try {
        const params = { symbol: `${id}/USD` };
        const options = {
          method: "GET",
          url: "https://twelve-data1.p.rapidapi.com/exchange_rate",
          params: params,
          headers: {
            "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com",
            "X-RapidAPI-Key": this.API_KEY,
          },
        };
        let response = await axios.request(options);
        temp_obj[id] = response.data.rate;
        results.push(temp_obj);
      } catch (error) {
        console.log(error);
      }
    }
    return results;
  }
}

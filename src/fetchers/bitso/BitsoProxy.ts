import axios from "axios";
const api_url = "https://api.bitso.com/v3/ticker/";

export default class BitsoProxy {
  constructor() {}

	async getExchangeRates(): Promise<any> {
    return await new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(api_url);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    })
  }
}


import axios from "axios";

export default class BitsoProxy {
  private api_url = "https://api.bitso.com/v3/ticker/";
  constructor() {}

	async getExchangeRates(): Promise<any> {
    return await new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(this.api_url);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    })
  }
}


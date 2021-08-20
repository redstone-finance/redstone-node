import axios from "axios";

export default {
  async executeQuery(subgraphUrl: string, query: string): Promise<any> {
    const response = await axios.post(subgraphUrl, { query });
    // TODO: remove
    console.log("=============================");
    console.log(JSON.stringify({
      data: response.data,
    }, null, 2));
    console.log("=============================");
    return response.data;
  },
};

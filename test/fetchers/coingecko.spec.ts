import fetchers from "../../src/fetchers/index";
import { CoingeckoFetcher } from "../../src/fetchers/coingecko/CoingeckoFetcher";

// jest.mock("../../src/fetchers/coingecko/CoingeckoProxy", () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       getExchangeRates: () => {
//         const exampleResponse = require("../../src/fetchers/coingecko/example-response.json");

//         return Promise.resolve({
//           data: exampleResponse
//         });
//       }
//     }
//   });
// });

describe("coingecko fetcher", () => {
  const sut = fetchers["coingecko"];

  it('should properly fetch data', async () => {
    // Given

    // When
    const result1 = await sut.fetchAll(["BTC", "ETH", "AR"]);

    console.log(result1);

    // Then
    // expect(result1).toEqual([
    //   {
    //     "symbol": "BTC",
    //     "value": 38190,
    //   },
    //   {
    //     "symbol": "ETH",
    //     "value": 2704.39,
    //   },
    //   {
    //     "symbol": "AR",
    //     "value": 17.46,
    //   }
    // ]);

  });

  it('should properly fetch prices in other currency', async () => {
    // Given
    const cgk = new CoingeckoFetcher();

    // When
    const result2 = await cgk.fetchDataInSpecificCurrency(["BTC", "ETH", "AR"],['mxn']);

    console.log(result2);
  });

});


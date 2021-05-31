import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse, mockLimestoneApiPrice} from "./_helpers";

jest.mock('axios');

mockLimestoneApiPrice(1.002);

describe("bitmart fetcher", () => {
  const sut = fetchers["bitmart"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/bitmart/example-ar-response.json");
  })

  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["AR", "ETH", "BTC"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "AR",
        "value": 13.208965200000002,
      }
    ]);

  });
});


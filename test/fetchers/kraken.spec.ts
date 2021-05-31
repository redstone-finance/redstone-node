import axios from "axios";
import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse} from "./_helpers";

jest.mock('axios');

describe("kraken fetcher", () => {
  const sut = fetchers["kraken"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/kraken/example-response.json");
  });

  // TODO: kraken fetcher currently does not return value for "popular" tickers like BTCUSD, ETHUSD, etc.
  // https://discord.com/channels/786251205008949258/843764329949167656/847394769658445846
  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["DAI", "YFI", "UNI"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "DAI",
        "value": 1.0015
      },
      {
        "symbol": "YFI",
        "value": 47390
      },
      {
        "symbol": "UNI",
        "value": 28.592
      }
    ]);
  });
});

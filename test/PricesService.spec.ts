import PricesService, {PricesBeforeAggregation, PricesDataFetched} from "../src/fetchers/PricesService";

// Having hard time to mock uuid..so far only this solution is working: https://stackoverflow.com/a/61150430
jest.mock('uuid',
  () => ({ v4: () => '00000000-0000-0000-0000-000000000000' }));

describe('groupPricesByToken', () => {
  const fetchTimestamp = 555;
  const nodeVersion = "3";

  it('should assign values from different sources to tokens/symbols', () => {
    //given
    const pricesData: PricesDataFetched = {
      "src1": [
        {"symbol": "BTC", value: 444},
        {"symbol": "ETH", value: 222},
        {"symbol": "DOGE", value: 111}
      ],
      "src2": [
        {"symbol": "BTC", value: 444.2},
        {"symbol": "ETH", value: 222.5}
      ],
      "src3": [
        {"symbol": "DOGE", value: 107.4}
      ]
    }

    //when
    const result: PricesBeforeAggregation = PricesService.groupPricesByToken(
      fetchTimestamp, pricesData, nodeVersion);

    //then
    expect(result).toEqual({
      "BTC": {
        "id": "00000000-0000-0000-0000-000000000000",
        "source": {
          "src1": 444,
          "src2": 444.2,
        },
        "symbol": "BTC",
        "timestamp": 555,
        "version": "3",
      },
      "DOGE": {
        "id": "00000000-0000-0000-0000-000000000000",
        "source": {
          "src1": 111,
          "src3": 107.4,
        },
        "symbol": "DOGE",
        "timestamp": 555,
        "version": "3",
      },
      "ETH": {
        "id": "00000000-0000-0000-0000-000000000000",
        "source": {
          "src1": 222,
          "src2": 222.5,
        },
        "symbol": "ETH",
        "timestamp": 555,
        "version": "3",
      },
    });
  });
});

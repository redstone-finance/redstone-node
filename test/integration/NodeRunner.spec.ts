import {Manifest, NodeConfig} from "../../src/types";
import NodeRunner from "../../src/NodeRunner";
import {JWKInterface} from "arweave/node/lib/wallet";
import {mocked} from "ts-jest/utils";
import ArweaveProxy from "../../src/arweave/ArweaveProxy";
import fetchers from "../../src/fetchers";
import mode from "../../mode";
import axios from "axios";
import anything = jasmine.anything;


/****** MOCKS START ******/
const mockArProxy = {
  getBalance: jest.fn(),
  getAddress: () => Promise.resolve("mockArAddress"),
  prepareUploadTransaction: jest.fn().mockResolvedValue({
    id: "mockArTransactionId"
  }),
  sign: jest.fn().mockResolvedValue("mock_signed"),
  postTransaction: jest.fn()
}
jest.mock("../../src/arweave/ArweaveProxy", () => {
  return jest.fn().mockImplementation(() => mockArProxy);
});

jest.mock("../../src/fetchers/coinbase");
jest.mock("../../src/fetchers/kraken");

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.post.mockImplementation((url) => {
  if (url == mode.broadcasterUrl || url == "https://api.redstone.finance/metrics") {
    return Promise.resolve();
  }
  return Promise.reject(`mock for ${url} not available and should not be called`);
});

const modeMock = jest.requireMock("../../mode");
jest.mock("../../mode", () => ({
  isProd: false,
  broadcasterUrl: "http://broadcast.test"
}));

jest.mock("uuid",
  () => ({v4: () => "00000000-0000-0000-0000-000000000000"}));
global.Date.now = jest.fn(() => 111111111);
/****** MOCKS END ******/


describe("NodeRunner", () => {

  const manifest: Manifest = {
    defaultSource: ["kraken"],
    interval: 1000,
    maxPriceDeviationPercent: 25,
    priceAggregator: "median",
    sourceTimeout: 2000,
    tokens: {
      "BTC": {
        source: ["coinbase"]
      },
      "ETH": {}
    }
  }

  const jwk: JWKInterface = {
    e: "e", kty: "kty", n: "n"
  }

  const nodeConfig: NodeConfig = {
    arweaveKeysFile: "", credentials: {
      infuraProjectId: "ipid",
      covalentApiKey: "ckey"
    },
    manifestFile: "",
    minimumArBalance: 0.2
  }

  beforeEach(() => {
    jest.useFakeTimers();

    mockArProxy.getBalance.mockClear();
    mockArProxy.prepareUploadTransaction.mockClear();
    mockArProxy.sign.mockClear();
    mockedAxios.post.mockClear();

    fetchers["coinbase"] = {
      fetchAll: jest.fn().mockResolvedValue([
        {symbol: "BTC", value: 444}
      ])
    };
    fetchers["kraken"] = {
      fetchAll: jest.fn().mockResolvedValue([
        {symbol: "BTC", value: 445}
      ])
    };
  });


  it("should create node instance", async () => {
    //given
    const mockedArProxy = mocked(ArweaveProxy, true);

    const sut = await NodeRunner.create(
      manifest,
      jwk,
      nodeConfig
    );

    //then
    expect(sut).not.toBeNull();
    expect(mockedArProxy).toHaveBeenCalledWith(jwk)
  });

  it("should throw if no maxDeviationPercent configured for token", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);

    const sut = await NodeRunner.create(
      JSON.parse(`{
        "defaultSource": ["kraken"],
        "interval": 0,
        "priceAggregator": "median",
        "sourceTimeout": 2000,
        "tokens": {
          "BTC": {
           "source": ["coinbase"]
          },
          "ETH": {}
        }
      }`),
      jwk,
      nodeConfig
    );

    return expect(sut.run()).rejects.toThrowError("Could not determine maxPriceDeviationPercent");
  });

  it("should throw if no sourceTimeout", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);
    const sut = await NodeRunner.create(
      JSON.parse(`{
        "defaultSource": ["kraken"],
        "interval": 0,
        "priceAggregator": "median",
        "maxPriceDeviationPercent": 25,
        "tokens": {
          "BTC": {
           "source": ["coinbase"]
          },
          "ETH": {}
        }
      }`),
      jwk,
      nodeConfig
    );

    return expect(sut.run()).rejects.toThrowError("No timeout configured for");
  });

  it("should throw if Arweave balance too low on initial check", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.1);
    const sut = await NodeRunner.create(
      manifest,
      jwk,
      nodeConfig
    );

    return expect(sut.run()).rejects.toThrowError("AR balance too low");
  });


  it("should broadcast fetched and signed prices", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);

    const sut = await NodeRunner.create(
      manifest,
      jwk,
      nodeConfig
    );

    await sut.run();
    expect(mockArProxy.prepareUploadTransaction).toHaveBeenCalledWith(
      {
        "Content-Encoding": "gzip",
        "Content-Type": "application/json",
        "app": "Redstone",
        "timestamp": "111111111",
        "type": "data",
        "version": "0.4",
      },
      [{
        "id": "00000000-0000-0000-0000-000000000000",
        "source": {"coinbase": 444, "kraken": 445},
        "symbol": "BTC",
        "timestamp": 111111111,
        "value": 444.5,
        "version": "0.4"
      }],
    );
    expect(mockArProxy.sign).toHaveBeenCalledWith(
      "{\"id\":\"00000000-0000-0000-0000-000000000000\",\"permawebTx\":\"mockArTransactionId\",\"provider\":\"mockArAddress\",\"source\":{\"coinbase\":444,\"kraken\":445},\"symbol\":\"BTC\",\"timestamp\":111111111,\"value\":444.5,\"version\":\"0.4\"}"
    );
    expect(axios.post).toHaveBeenCalledWith(
      "http://broadcast.test",
      [
        {
          "id": "00000000-0000-0000-0000-000000000000",
          "permawebTx": "mockArTransactionId",
          "provider": "mockArAddress",
          "signature": "mock_signed",
          "source": {"coinbase": 444, "kraken": 445},
          "symbol": "BTC",
          "timestamp": 111111111,
          "value": 444.5,
          "version": "0.4"
        }
      ]
    );
    expect(mockArProxy.postTransaction).not.toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledWith(anything(), manifest.interval);
  });

  it("should not broadcast fetched and signed prices if values deviates too much", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);

    const sut = await NodeRunner.create(
      {
        ...manifest,
        maxPriceDeviationPercent: 0
      },
      jwk,
      nodeConfig
    );

    await sut.run();
    expect(mockArProxy.prepareUploadTransaction).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalledWith(mode.broadcasterUrl, anything());
  });


  it("should save transaction on Arweave in mode=PROD", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);
    modeMock.isProd = true;

    const sut = await NodeRunner.create(
      manifest,
      jwk,
      nodeConfig
    );

    await sut.run();
    expect(axios.post).toHaveBeenCalledWith(
      mode.broadcasterUrl,
      [
        {
          "id": "00000000-0000-0000-0000-000000000000",
          "permawebTx": "mockArTransactionId",
          "provider": "mockArAddress",
          "signature": "mock_signed",
          "source": {"coinbase": 444, "kraken": 445},
          "symbol": "BTC",
          "timestamp": 111111111,
          "value": 444.5,
          "version": "0.4"
        }
      ]);
    expect(mockArProxy.postTransaction).toHaveBeenCalledWith({
      "id": "mockArTransactionId"
    });

  });
});

import {NodeConfig} from "../../src/types";
import NodeRunner from "../../src/NodeRunner";
import {JWKInterface} from "arweave/node/lib/wallet";
import {mocked} from "ts-jest/utils";
import ArweaveProxy from "../../src/arweave/ArweaveProxy";
import fetchers from "../../src/fetchers";
import mode from "../../mode";
import axios from "axios";
import ArweaveService from "../../src/arweave/ArweaveService";
import {any} from "jest-mock-extended";


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
  if (url.startsWith(mode.broadcasterUrl) || url == "https://api.redstone.finance/metrics") {
    return Promise.resolve();
  }
  return Promise.reject(`mock for ${url} not available and should not be called`);
});

const modeMock = jest.requireMock("../../mode");
jest.mock("../../mode", () => ({
  isProd: false,
  broadcasterUrl: "http://broadcast.test"
}));

let manifest: any = null;

jest.mock('../../src/utils/objects', () => ({
  // @ts-ignore
  ...(jest.requireActual('../../src/utils/objects')),
  readJSON: () => {
    return manifest;
  }
}));

jest.mock("uuid",
  () => ({v4: () => "00000000-0000-0000-0000-000000000000"}));
/****** MOCKS END ******/


describe("NodeRunner", () => {

  const jwk: JWKInterface = {
    e: "e", kty: "kty", n: "n"
  }

  const nodeConfig: NodeConfig = {
    arweaveKeysFile: "", credentials: {
      infuraProjectId: "ipid",
      ethereumPrivateKey: "0x1111111111111111111111111111111111111111111111111111111111111111"
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

    jest.spyOn(global.Date, 'now')
      .mockImplementation(() => 111111111);

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

    manifest = {
      defaultSource: ["kraken"],
      interval: 10000,
      maxPriceDeviationPercent: 25,
      priceAggregator: "median",
      sourceTimeout: 2000,
      evmChainId: 1,
      tokens: {
        "BTC": {
          source: ["coinbase"]
        },
        "ETH": {}
      }
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should create node instance", async () => {
    //given
    const mockedArProxy = mocked(ArweaveProxy, true);

    const sut = await NodeRunner.create(
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
    manifest =
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
      }`)

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await expect(sut.run()).rejects.toThrowError("Could not determine maxPriceDeviationPercent");
  });

  it("should throw if no sourceTimeout", async () => {
    //given
    manifest = JSON.parse(`{
        "defaultSource": ["kraken"],
        "interval": 0,
        "priceAggregator": "median",
        "maxPriceDeviationPercent": 25,
        "evmChainId": 1,
        "tokens": {
          "BTC": {
           "source": ["coinbase"]
          },
          "ETH": {}
        }
      }`);
    mockArProxy.getBalance.mockResolvedValue(0.2);
    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await expect(sut.run()).rejects.toThrowError("No timeout configured for");
  });

  it("should throw if minimumArBalance not defined in config file", async () => {
    await expect(async () => {
      await NodeRunner.create(
        jwk,
        JSON.parse(`{
      "arweaveKeysFile": "",
      "credentials": {
        "ethereumPrivateKey": "0x1111111111111111111111111111111111111111111111111111111111111111",
        "infuraProjectId": "ipid",
        "covalentApiKey": "ckey"
      },
      "manifestFile": ""
    }`));
    }).rejects.toThrow("minimumArBalance not defined in config file");
  });

  it("should throw if Arweave balance too low on initial check", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.1);
    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await expect(sut.run()).rejects.toThrowError("AR balance too low");
  });

  it("should broadcast fetched and signed prices", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);

    const sut = await NodeRunner.create(
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
      "http://broadcast.test/prices",
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
    expect(axios.post).toHaveBeenCalledWith(
      "http://broadcast.test/packages",
      {
        timestamp: 111111111,
        signature: "0x5b2dd26ee75261b8a9c25b4f3eb8bd44292f4e1aeae9867b6f9a9a61a0b98e397be8b1eb1c972a58ac1baec3d2caefe273a39ee0606a66b6bd3c2d1b8db471471c",
        signer: "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A",
        provider: "mockArAddress"
      }
    );
    expect(mockArProxy.postTransaction).not.toHaveBeenCalled();
    // TODO: cannot spy on setInterval after upgrade to jest 27.
    // expect(setInterval).toHaveBeenCalledWith(any(), manifest.interval);
  });

  it("should not broadcast fetched and signed prices if values deviates too much", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);

    manifest = {
      ...manifest,
      maxPriceDeviationPercent: 0
    }

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await sut.run();
    expect(mockArProxy.prepareUploadTransaction).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalledWith(mode.broadcasterUrl, any());
  });

  it("should save transaction on Arweave in mode=PROD", async () => {
    //given
    mockArProxy.getBalance.mockResolvedValue(0.2);
    modeMock.isProd = true;

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await sut.run();
    expect(axios.post).toHaveBeenCalledWith(
      mode.broadcasterUrl + "/prices",
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

  describe("when useManifestFromSmartContract flag is set", () => {
    let nodeConfigManifestFromAr: any;
    beforeEach(() => {
      nodeConfigManifestFromAr = {
        ...nodeConfig,
        useManifestFromSmartContract: true
      }
    });

    it("should download prices when manifest is available", async () => {
      //given
      const arServiceSpy = jest.spyOn(ArweaveService.prototype, 'getCurrentManifest')
        .mockImplementation(() => Promise.resolve(manifest));

      const sut = await NodeRunner.create(
        jwk,
        nodeConfigManifestFromAr
      );

      await sut.run();

      expect(fetchers.kraken.fetchAll).toHaveBeenCalled();
      expect(mockArProxy.prepareUploadTransaction).toHaveBeenCalled();

      arServiceSpy.mockClear();
    });

    it("should not create NodeRunner instance until manifest is available", async () => {
      //given
      jest.useRealTimers();
      let arServiceSpy = jest.spyOn(ArweaveService.prototype, 'getCurrentManifest')
        .mockImplementation(() => Promise.reject("no way!"));

      // this effectively makes manifest available after one second - so
      // we expect that second manifest fetching trial will succeed.
      setTimeout(() => {
        arServiceSpy = jest.spyOn(ArweaveService.prototype, 'getCurrentManifest')
          .mockImplementation(() => Promise.resolve(manifest));
      }, 500);
      const sut = await NodeRunner.create(
        jwk,
        nodeConfigManifestFromAr
      );
      expect(sut).not.toBeNull();
      expect(ArweaveService.prototype.getCurrentManifest).toHaveBeenCalledTimes(2);
      arServiceSpy.mockClear();
      jest.useFakeTimers();
    });

  });

});

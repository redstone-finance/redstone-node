import EvmPriceSigner, { PricesBatchType, SignedPriceDataType } from "../src/utils/EvmPriceSigner";

describe('evmSignPricesAndVerify', () => {
  it('should sign prices batch', () => {
    //given
    const pricesBatch: PricesBatchType = {
      "prices": [
        {
          "symbol": "XXX",
          "value": 10,
        },
        {
          "symbol": "YYY",
          "value": 100,
        },
        {
          "symbol": "AAA",
          "value": 20.003,
        },
      ],
      "timestamp": Date.now(),
    };
    const evmSigner = new EvmPriceSigner();
    // TODO: replace it with random eth private key later
    const ethereumPrivateKey = "0x898eec9762b37889ddd6c8d4be7ba2902fec49ae80d47f39170ab30bf17e65a1";

    //when
    const signedPricesData: SignedPriceDataType = evmSigner.signPriceData(
      pricesBatch,
      ethereumPrivateKey);

    //then
    expect(evmSigner.verifySignature(signedPricesData)).toEqual(true);
  });

  // TODO add a test case to check if incorrect signature doesn't work

  // TODO: add a test case to check if disordered price batch will be verified correctly
});

const prompts = require("prompts");
const Arweave = require("arweave");
const { SmartWeaveNodeFactory } = require('redstone-smartweave');

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave)
  .useRedStoneGateway( {confirmed: true} )
  .build();

const PROVIDERS_REGISTRY_ADDRESS = "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU";

const DEFAULTS = {
  jwkStringified: "{\"kty\":\"RSA\",\"n\":\"xF7MTNFqSYeeyTRE2GghYnsgirMCgueKK9Uhbn7XeVP_DTFUiFfbqH0FuZFob2WWWk0PICFiJxOz3FAS1e4Y1QJx_iE9irgTY5-1LrsuZdEnRyiS3ZP3szNbfePro5Ez59tEBBLfW4OeyZTfF8WBUHv6rSN5kyiiwQONSEFAVZDci3PUywzkk7yQwWHkUuOrFnRi4pQ3spM44pSRUWixq1DHtuYWiuNzTG0FR9WhODAsIal4UX1phPxHw4_n0ZbRqTXlxl0jrANAURBCtWTxYVcEO1Pb6kzTHsw_1H5_4oxeUfT7lMT1QCyePkysyuUzNudI2JQqTp3LMacdsPBC-JBk3NGOJQKzdKzD9Cu4-ecAjKOvGqbLDnUBcChurTdDuxoxFPW7GzD4P10kj5JaPBGaVrAr26zDsriLfVROamnEKfGdbcV5FfoVRLRhwx1a492jQFGqVdGGOE2nvFXChohk5Zo3WdWm5c1SA79P1lItWgS9XYCN4xQuKZxkrn_hBMmKLFIFVav9jDt7JAszzwoQva1jGO3-Es56YBlbcXWBvqpofpxAjM7jsBfXq0X21wwOlER8Wefibqfy-0c0IMzg6QDDrug0mtFF53_Ll0NSneHb5-QErUdoESEJj2T83c0LK8wQxQuAUnsnfZ_2-mcmw9HigA502Vcq77Qfr2E\",\"e\":\"AQAB\",\"d\":\"Q2oUEy81oQapMYP7OpwNEgUZN-SasRwSKFgkAQ4UpTd78SiFT8VxyJcbNwi_ZLbodhnMXoh3bNjrv2_R95Wk-sO7JLZ-rTfimCoFBoUGObgjFt_MA7u_psqz1zU--UlpG2kAIbHk8kLuaV_tcvjAG0Rk27m5DBdAQKkagLq9_mIcBNgALrE_a6SpwWn8-6PjYXMVW5nswSafudGtTdh2Xkz-M0EsbgQF2i_3RyEFFwgarnfCsZ8vcZM2g-HMgPyY_9FcD8x76Zq4ItxFOobsAzHfZwq0DezP8dvG8gl3l-v-mX5UPE-drqlirhqem40yFuAx9wBuwcyULHilzc-9_YNt_GDzkAVJbeNcvDLslicHfXcZYCCUJqf9fmbfmdaTyLh_OhgkJtLCtv0tHJ284jkQe6rtQ4mHy2DiIQoKjIrJvSjatm7W0a3otcNWFFLkhHWVDtX3xY2nARPqzZuBfXce_LgWhBaJVC_WO8BVgX2RL6F7nQAiEPwOt0eyXgK3aj_WFYOOijAeIKr7850BUemSGxH4WSIbLld9Bs9jjxBUmNRHMpZkXxxmAeclETSZNPRSn2D5R-VDvZ3rzSPrYe06BwGRhddST44guME3sAGLL1OnnChjTiNm2KHRB4X1BVGmFo0AxIGJimWYI4Q7oVyrfIAxUQED8RpdqKJrKwE\",\"p\":\"6OJ9I0Z0E8PtfADSWGGSnUocsGbVwmQrNjHHI--MQuBoSypBPSQ2WNy3-tBqxJ2RxHb8S6LXcWD3_MSNZ3fdnnRgpnpkEpKLCsMKCEdVnYlP5wZFsl4Bw3SPRku7Zkst7jfP0FnOxWgbTu_GM2yN-C1oHtGN7fx2LO-LxJQ5uuMjQ3jj4s6HH21rhJbr448t8KvxP3qgMCEeKM-YKTmEOc7GX_lug2crVL5KVWOdrBWUeEsVizGa-VlDt2ymWmALxSVAbmYpHQ-mUEGX7kqVfRRhQeltSDb8EsuFgy8p8BefMJ2Brtg-6RDAZhF_sedv24YcO_JVZU-BaK-sfRE7cQ\",\"q\":\"19x977SyBwHJyjm10Lz858W_MYAlMVyH4EpBu5K5tMDoDfATOv4-R0o9UveD-SxvP6WUoiwSzGu99_Zisio7CZIIAPxtmAiXjnQVVAaWft1cpBeNb5rYDLJ-0PMllNNfvajqsrgkCzvtQ4q3uFEtE7VbptNmHxm5ek0KV3W6oZbLSaUg3WaZOROyg7R1OPv-IRi9ItRUtnyFBMBRE2O-soDtJyBwwp_-jpSDrsfWvSLztVKxsRSqlMm9p60btPdswt9H_1oU7Dgj6YvFRwRDpuqhcxg-32WHh7rkEFhiWbq1m-CpnMpdcTrbFXphmXYkzwutRGF1PdlqM5t2jZFa8Q\",\"dp\":\"yfOekPiHsJw3VVFhF0OF4OBkAJUsyWYUEusXxhH1kAkKaCQ8bsj4WBcPdHFIJTh_L9_-6ZhNPATbCFdqSE-p378MEVIRdgmeibaY_JTfqb1pjO3jgsoCvXxWwp7p48tOCUZc8FDw_j9Jbyp-thltA8pcgF04tyg3UsBodBAV__r4mYo8FHMEujwpANHfvXZsYEi67FFqmFIf1UQwr48xGvA1FwU20Lym1tYtn97C3HfaSHbUN-DMg27lSiruF3Eyw8OKHDJ7dLgdgXtgRURoXg9OR9ok6nrEHYhgP2Km-42AfqgXzYe5BmOAdQK3uY75cWTbFyEO7MwFbMLq0YogAQ\",\"dq\":\"qRO-3PPXAiAHc8uyOtbc7Zn5gQdTmo9UqnzfcdGifg8fdFNYbLvaAjMHR6YyDAke9mZ2vnPxIYc-3Ctz8QOdDIkClesi2JPaSi1oy1EBrksrFiiQkxthIMjrBjV9eU37Tu4xL12GdfoxhNbxwoBq42YJbOlmsvOOUVpowEqprYoUnxGlZWXInGluSTUfIExZKIldFBvmYq2z7x3II3zcUKsllqEVUYzKcdmoL02-SJVI-PzVy9NZLYO7dsvjyOKIoTcNCNkBTGlIz9S36EFR0Ds1zJXwIUFAYDMmEht4pbnWKEtX70Se3mLwWalrKy3b9QS7abVAhPp38gZSXN6-sQ\",\"qi\":\"GO5z0piSX0arNJQZqX4t5DHP1tfLxdh_wWA_eAM9BGRGoq1ukdcugHOd6gGV4bFdtvFPBlJTboc5Z0h4qQQbD0KEsLKkp8PoQbpPJq7WEKPRx04T9OBssHy1WbBNgTSOVwikittFeELGy19XAU_Nhj32nu3XziPx9mUJs2jW_RExiHsc22EjflNRA_sFh5r0VAPPG2lVA4zNN4bm3N_ZXdnpP472V0cF_9WJ1FRKtO-bonwOoMORq1DEFmhrWoBIcQHYv4ZkbDqP90yrErIsLM0sgocEpaRYWQ_jIp1MFvA8i5GbBOL0Hyi_Klvl4uky-8rWBt_UPPHNKFnGOywrMw\"}",
  name: "RedStone Avalanche prod 3",
  description: "Most popular tokens from the Avalanche ecosystem",
  manifestTxId: "y7ppr6m9MuP65Fiivd9CX84qcPLoYBMifUrFK3jXw2k",
  url: "https://redstone.finance/",
  logo: "https://redstone.finance/assets/img/redstone-logo-full.svg",
};

main();

async function main() {
  const providerDetails = await promptProviderDetails();
  const providerConfig = await prepareProviderConfig(providerDetails);
  //return await registerProviderInContract(providerConfig);
  //return await checkContractState(providerConfig);
  //return await removeProvider(providerConfig);
  return await getManifestId(providerConfig);
}

async function registerProviderInContract(providerConfig) {

  console.info(`Registering provider on contract: ${PROVIDERS_REGISTRY_ADDRESS}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const writeTxId = await contract.bundleInteraction(
    {
      function: "registerProvider",
      data: {
        provider: providerConfig.provider
      },
    },
  );

  console.log(writeTxId);
}


async function removeProvider(providerConfig) {

  console.info(`Removing provider: ${providerConfig.address} from contract: ${PROVIDERS_REGISTRY_ADDRESS}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const writeTxId = await contract.bundleInteraction(
    {
      function: "removeProvider",
      data: {
        providerId: providerConfig.address
      },
    },
  );

  console.log(writeTxId);
}


async function checkContractState(providerConfig) {

  console.info(`Checking contract state: ${PROVIDERS_REGISTRY_ADDRESS}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const { result: providersData } = await contract.viewState({
    function: 'providersData',
  });

  console.log(JSON.stringify(providersData, null, 2));
}


async function getManifestId(providerConfig) {
  console.info(`Getting manifestId for: ${providerConfig.address}`);

  const contract = smartweave.contract(PROVIDERS_REGISTRY_ADDRESS).connect(providerConfig.jwk);

  const { result } = await contract.viewState({
    function: 'activeManifest',
    data: {
      providerId: providerConfig.address,
      eagerManifestLoad: true
    }
  });

  console.log(result);
}

async function prepareProviderConfig(providerDetails) {
  const jwk = JSON.parse(providerDetails.jwkStringified);
  const address = await arweave.wallets.jwkToAddress(jwk);

  const providerConfig = {
    provider: {
      adminsPool: [address],
      profile: {
        name: providerDetails.name,
        description: providerDetails.description,
        url: providerDetails.url,
        imgUrl: providerDetails.logo,
      },
    },
    address,
    jwk,
  };

  if (providerDetails.manifestTxId) {
    providerConfig.provider.manifests = [{
      changeMessage: "initial manifest",
      lockedHours: 0,
      manifestTxId: providerDetails.manifestTxId,
    }];
  }

  return providerConfig;
}

async function promptProviderDetails() {
  // const jwkStringified = await promptString("Please enter JWK");
  // const name = await promptString("Please enter provider name (e.g. RedStone Avalanche prod 1");
  // const description = await promptString("Please enter provider description (e.g. Most popular tokens from the Avalanche ecosystem)");
  // const url = await promptString("Please enter url", DEFAULTS.url);
  // const logo = await promptString("Please enter logo url", DEFAULTS.logo);
  // const manifestTxId = await promptString("Please enter initial manifest tx id", DEFAULTS.manifestTxId);
  //
  // return {
  //   jwkStringified,
  //   name,
  //   description,
  //   url,
  //   logo,
  //   manifestTxId,
  // };
  return DEFAULTS;
}

async function promptString(msg, defaultValue) {
  const response = await prompts({
    type: "text",
    name: "result",
    message: msg,
    initial: defaultValue,
  });

  return response.result;
}


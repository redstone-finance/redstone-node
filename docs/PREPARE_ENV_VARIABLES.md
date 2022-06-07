# How to prepare a ENV variables

Env variables should be treated as **private**, especially all keys and JWKs. They should be structured as follows:

| Param                                        |                      Optionality                      | Description                                                                                        |
| -------------------------------------------- | :---------------------------------------------------: | -------------------------------------------------------------------------------------------------- |
| ENABLE_JSON_LOGS                             |                       optional                        | if set to true, logging in JSON format will be enabled                                             |
| PRINT_DIAGNOSTIC_INFO                        |                       optional                        | if set to true, additional info with diagnostics information will be logged                        |
| PERFORMANCE_TRACKING_LABEL_PREFIX            |                       optional                        | if set to true, human-friendly name that will be appended to the performance tracking labels       |
| ARWEAVE_KEYS_FILE_PATH                       |       required if ARWEAVE_KEYS_JWK not provided       | path to the arweave wallet (for relative paths it assumes that you are in the project root folder) |
| ARWEAVE_KEYS_JWK                             |    required if ARWEAVE_KEYS_FILE_PATH not provided    | JWK of arweave wallet (helpful with Docker)                                                        |
| MANIFEST_FILE_PATH                           | required if USE_MANIFEST_FROM_SMART_CONTRACT not true | path to the manifest file                                                                          |
| USE_MANIFEST_FROM_SMART_CONTRACT             |      required if MANIFEST_FILE_PATH not provided      | if set to true, manifest will be loaded from Arweave Smart Contracts                               |
| MANIFEST_REFRESH_INTERVAL                    |                       optional                        | if manifest is loaded from smart contracts it defines how often node will check for new manifest   |
| MINIMUM_AR_BALANCE                           |                       required                        | minimum AR balance required to run the node                                                        |
| ADD_EVM_SIGNATURE                            |                       optional                        | if set to true, EVM signature will be added to each price for each asset                           |
| ETHEREUM_PRIVATE_KEY                         |                       required                        | Ethereum private key that will be used for price data signing                                      |
| ETHEREUM_PRIVATE_KEY                         |                       required                        | Ethereum private key that will be used for price data signing                                      |
| HTTP_BROADCASTER_URLS                        |                       optional                        | array of urls for broadcasters to which prices should be sent                                      |
| ENABLE_STREAMR_BROADCASTER                   |                       required                        | if set to true, single prices and prices packages will be sent to Streamr                          |
| DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR |                       optional                        | if set to true, single prices will not be sent to Streamr                                          |
| OMIT_SOURCES_ARWEAVE_TX                      |                       optional                        | if set to true, single source will not be attached to bundlr transaction                           |

Check out the [.env.example](../.env.example)

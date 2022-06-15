# How to prepare a ENV variables

Env variables should be treated as **private**, especially all keys and JWKs. They should be structured as follows:

| Param                                        |                      Optionality                      | Default value             | Description                                                                                                         |
| -------------------------------------------- | :---------------------------------------------------: | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| MODE                                         |                       required                        | LOCAL                     | Default httpBroadcasters depends on [MODE](../src/config/config.ts), additional error and metrics reporting if PROD |
| ENABLE_JSON_LOGS                             |                       optional                        | true                      | if set to true, logging in JSON format will be enabled                                                              |
| PRINT_DIAGNOSTIC_INFO                        |                       optional                        | true                      | if set to true, additional info with diagnostics information will be logged                                         |
| PERFORMANCE_TRACKING_LABEL_PREFIX            |                       optional                        | public                    | if set, human-friendly name that will be appended to the performance tracking labels                                |
| ARWEAVE_KEYS_FILE_PATH                       |       required if ARWEAVE_KEYS_JWK not provided       |                           | path to the arweave wallet (for relative paths it assumes that you are in the project root folder)                  |
| ARWEAVE_KEYS_JWK                             |    required if ARWEAVE_KEYS_FILE_PATH not provided    |                           | JWK of arweave wallet (helpful with Docker)                                                                         |
| MANIFEST_FILE_PATH                           | required if USE_MANIFEST_FROM_SMART_CONTRACT not true |                           | path to the manifest file                                                                                           |
| USE_MANIFEST_FROM_SMART_CONTRACT             |      required if MANIFEST_FILE_PATH not provided      | true                      | if set to true, manifest will be loaded from Arweave Smart Contracts                                                |
| MANIFEST_REFRESH_INTERVAL                    |                       optional                        | 120000                    | if manifest is loaded from smart contracts it defines how often node will check for new manifest                    |
| MINIMUM_AR_BALANCE                           |                       optional                        | 0                         | minimum AR balance required to run the node                                                                         |
| ETHEREUM_PRIVATE_KEY                         |                       required                        |                           | Ethereum private key that will be used for price data signing                                                       |
| HTTP_BROADCASTER_URLS                        |                       optional                        | ["http://localhost:9000"] | array of urls for broadcasters to which prices should be sent                                                       |
| ENABLE_STREAMR_BROADCASTER                   |                       optional                        | false                     | if set to true, single prices and prices packages will be sent to Streamr                                           |
| DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR |                       optional                        | true                      | if set to true, single prices will not be sent to Streamr                                                           |
| OMIT_SOURCES_ARWEAVE_TX                      |                       optional                        | true                      | if set to true, values from different sources will not be attached to the data backup on Arweave                    |
| TWELVE_DATA_RAPID_API_KEY                    |                       optional                        |                           | Twelve data API key which will be used to fetch prices                                                              |

Check out the [.env.example](../.env.example)

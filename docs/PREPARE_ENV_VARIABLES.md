# How to prepare a environment variables

Env variables should be treated as **private**, especially all keys and JWKs. They should be structured as follows:

| Param                        |                   Optionality                   | Default value | Description                                                                                        |
| ---------------------------- | :---------------------------------------------: | ------------- | -------------------------------------------------------------------------------------------------- |
| ENABLE_JSON_LOGS             |                    optional                     | true          | if set to true, logging in JSON format will be enabled                                             |
| ENABLE_PERFORMANCE_TRACKING  |                    optional                     | true          | if set to true, performance data will be send to RedStone                                          |
| PRINT_DIAGNOSTIC_INFO        |                    optional                     | true          | if set to true, additional info with diagnostics information will be logged                        |
| ARWEAVE_KEYS_FILE_PATH       |    required if ARWEAVE_KEYS_JWK not provided    |               | path to the arweave wallet (for relative paths it assumes that you are in the project root folder) |
| ARWEAVE_KEYS_JWK             | required if ARWEAVE_KEYS_FILE_PATH not provided |               | JWK of arweave wallet (helpful with Docker)                                                        |
| OVERRIDE_MANIFEST_USING_FILE |                    optional                     |               | path to the manifest file, if not specified manifest is loaded from smart contract                 |
| MANIFEST_REFRESH_INTERVAL    |                    optional                     | 120000        | if manifest is loaded from smart contracts it defines how often node will check for new manifest   |
| ECDSA_PRIVATE_KEY            |                    required                     |               | Ethereum private key that will be used for price data signing                                      |
| TWELVE_DATA_RAPID_API_KEY    |                    optional                     |               | Twelve data API key which will be used to fetch prices                                             |

Check out the [.env.example](../.env.example)

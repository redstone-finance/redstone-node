# RedStone Node environments

RedStone node environments (modes) help to differentiate node configuration for different purposes.

There are 2 main environments, that are already created in the RedStone node:

- PROD (should be used for real long-term node deployment)
- LOCAL (should be used for tests, development and experiments)

Production environment automatically enables services, that are not useful in local environment, such as:

- error reporting
- performance tracking
- publishing on Arweave

## How to configure environments

### Using environment variables

Environments can be configured using environment variable `MODE`. Set it to `PROD` to run redstone node in production environment or to `LOCAL` to run redstone node locally.

### Other environment variables

- **ENABLE_JSON_LOGS** - set this variable to `true` to enable logging in JSON format. It is recommended to set it to `true` if you run the node in production environment.
- **PERFORMANCE_TRACKING_LABEL_PREFIX** - human-friendly name that will be appended to the performace tracking labels. (Examples: `main` for `redstone` provider, `stocks` for `redstone-stocks`, `rapid` for `redstone-rapid` provider)

### Configure in Docker

Dockerfiles are used to build docker images, which are usually executed in Production environment. To configure production environment `ENV` instruction should be added to a Dockerfile.

```dockerfile
ENV MODE=PROD
ENV ENABLE_JSON_LOGS=true
ENV PRINT_DIAGNOSTIC_INFO=true
ENV PERFORMANCE_TRACKING_LABEL_PREFIX=public
ENV MANIFEST_REFRESH_INTERVAL=120000
ENV ARWEAVE_KEYS_FILE_PATH=
ENV ARWEAVE_KEYS_JWK=
ENV USE_MANIFEST_FROM_SMART_CONTRACT=true
ENV MANIFEST_FILE_PATH=
ENV MINIMUM_AR_BALANCE=0
ENV ETHEREUM_PRIVATE_KEY=
ENV HTTP_BROADCASTER_URLS=["https://api.redstone.finance","https://vwx3eni8c7.eu-west-1.awsapprunner.com","https://container-service-1.dv9sai71f4rsq.eu-central-1.cs.amazonlightsail.com"]
ENV ENABLE_STREAMR_BROADCASTER=false
ENV DISABLE_SINGLE_PRICE_BROADCASTING_IN_STREAMR=true
ENV OMIT_SOURCES_ARWEAVE_TX=true
ENV TWELVE_DATA_RAPID_API_KEY=
```

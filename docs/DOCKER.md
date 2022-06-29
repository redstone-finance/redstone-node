# Configure in Docker

Dockerfiles are used to build docker images, which are usually executed in Production environment. To configure production environment `ENV` instruction should be added to a Dockerfile.

```dockerfile
ENV ENABLE_JSON_LOGS=true
ENV ENABLE_PERFORMANCE_TRACKING=true
ENV PRINT_DIAGNOSTIC_INFO=true
ENV MANIFEST_REFRESH_INTERVAL=120000
ENV ARWEAVE_KEYS_FILE_PATH=
ENV ARWEAVE_KEYS_JWK=
ENV OVERRIDE_MANIFEST_USING_FILE=
ENV ETHEREUM_PRIVATE_KEY=
ENV TWELVE_DATA_RAPID_API_KEY=
```

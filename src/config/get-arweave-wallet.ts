import { readJSON } from "../utils/objects";

export const getArweaveWallet = () => {
  const arweaveKeysFile = process.env.ARWEAVE_KEYS_FILE_PATH;
  const arweaveKeysJWK = process.env.ARWEAVE_KEYS_JWK;
  if (arweaveKeysFile) {
    return readJSON(arweaveKeysFile);
  } else if (arweaveKeysJWK) {
    return JSON.parse(arweaveKeysJWK);
  } else {
    throw new Error(`Env ARWEAVE_KEYS_FILE_PATH or ARWEAVE_KEYS_JWK must be specified`);
  }
}

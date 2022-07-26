const generateSubManifest = require("./generate-submanifest-from-main");

const OUTPUT_FILE_PATH = "./manifests/avalanche.json";
const SYMBOLS = [
  "ETH",
  "USDT",
  "PNG",
  "AVAX",
  "XAVA",
  "LINK",
  "BTC",
  "FRAX",
  "YAK",
  "QI",
  "USDC",
  "$YYAV3SA1",
];

generateSubManifest(SYMBOLS, OUTPUT_FILE_PATH);

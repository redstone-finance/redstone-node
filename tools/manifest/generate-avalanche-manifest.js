const generateSubManifest = require("./generate-submanifest-from-main");

const OUTPUT_FILE_PATH = "./manifests/avalanche.json";
const SYMBOLS = [
  "AVAX",
  "PNG",
  "SNOB",
  "DYP",
  "SPORE",
  "WAVAX",
  "XAVA",
  "SHERPA",
  "JOE",
  "AVME",
];

generateSubManifest(SYMBOLS, OUTPUT_FILE_PATH);

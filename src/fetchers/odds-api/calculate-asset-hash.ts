const MAX_BASE64_HASH_LEN = 30;
const deepSortObject = require("deep-sort-object");
const sha256 = require("js-sha256");
const jsonschema = require('jsonschema');

interface SportEvent {
  commence_time: string;
  home_team: string;
  away_team: string;
  outcome: string;
};

const SPORT_EVENT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Sport event outcome schema",
  "description": "Sport event outcome schema",
  "type": "object",
  "properties": {
    "commence_time": {
      "type": "string"
    },
    "home_team": {
      "type": "string"
    },
    "away_team": {
      "type": "string"
    },
    "outcome": {
      "type": "string"
    }
  },
  "required": ["commence_time", "home_team", "away_team", "outcome"],
  "additionalProperties": false
};

export default function (event: SportEvent) {
  valdiateEventObject(event);
  const hexHash = sha256(JSON.stringify(deepSortObject(event)));
  const base64Hash = Buffer.from(hexHash, "hex").toString("base64");
  return base64Hash.slice(0, MAX_BASE64_HASH_LEN);
}

function valdiateEventObject(event: SportEvent) {
  const isValid = (jsonschema.validate(event, SPORT_EVENT_SCHEMA)).errors.length === 0;
  if (!isValid) {
    throw new Error("Incorrect event: " + JSON.stringify(event));
  }
}

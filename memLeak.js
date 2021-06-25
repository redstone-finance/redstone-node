const Arweave = require("arweave/node");
const smartweave = require("smartweave");
const fs = require("fs");

const http = require("http");

const server = http.createServer((req, res) => {
  Promise.race([read(), timeout(6000)])
    .then(function(result) {
      console.log(result);
    })
    .finally(function () {
      if (global.gc) {
        console.log("Calling GC...");
        global.gc();
      }
      res.writeHead(200);
      res.end("Blah.");
    });
});

server.listen(3000);
console.log("Server listening to port 3000. Press Ctrl+C to stop it.");


function timeout(timer) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timer)
  });
}

async function read() {
  console.log("\n\n\nCalling SWC... ", Date.now());

  const arweave = Arweave.init({
    host: "arweave.net", // Hostname or IP address for a Arweave host
    port: 443,           // Port
    protocol: "https",   // Network protocol http or https
    timeout: 20000,      // Network request timeouts in milliseconds
    logging: false,      // Enable network request logging
  });

  const jwk = readJSON("./.secrets/arweave-keyfile-33F0QHcb22W7LwWR1iRC8Az1ntZG09XQ03YWuw2ABqA.json");

  // "CbGCxBJn6jLeezqDl1w3o8oCSeRCb-MmtZNKPodla-0" - contract version with logging
  // "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU" - contract version without logging

  return smartweave.interactRead(
    arweave,
    jwk,
    "CbGCxBJn6jLeezqDl1w3o8oCSeRCb-MmtZNKPodla-0",
    {
      function: "activeManifest",
      data: {
        providerId: "33F0QHcb22W7LwWR1iRC8Az1ntZG09XQ03YWuw2ABqA",
        eagerManifestLoad: false
      }
    });
}

function readJSON(path) {
  const content = fs.readFileSync(path, "utf-8");
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`File "${path}" does not contain a valid JSON`);
  }
}

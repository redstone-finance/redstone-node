const { generateAssets } = require("./utils");

generateAssets().then(assets => console.log(JSON.stringify(assets, null, 2)));

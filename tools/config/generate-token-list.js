const fs = require("fs");
const supportedTokens = require("./supported-tokens.json");

async function generateTokenConfig() {
    
    const fetchers = fs.readdirSync("../../src/fetchers", { withFileTypes: true })
        .filter(
            dirent => {
                return dirent.isDirectory();
            }
        )
        .map(
            dirent => {
                return dirent.name;
            }
        );
        
    for (const fetcher of fetchers) {
        try {
            const generateList = require("../../src/fetchers/" + fetcher + "/generate-list.js");
            if (generateList) {
                console.log("Fetching list for: " + fetcher);
                let fetchedList = await generateList.getTokenList();
                fetchedList.forEach(
                    token => {
                        if (token in supportedTokens) {
                            if (!supportedTokens[token].source) {
                                supportedTokens[token].source = []; 
                            }
                            supportedTokens[token].source.push(fetcher);
                        }
                    });
                }
            } catch (err) {
            console.log("Error when getting a token list for: " + fetcher);
        }
    }

    const standard = require("./standard-lists");
    const standardLists = await standard.getStandardList();

    for (const symbol in supportedTokens) {
        let standarizedInfo;
        let index = 0;
        while (index < standardLists.length && !standarizedInfo) {
            standarizedInfo = standardLists[index].find(
                el => {
                    return el.symbol === symbol;
                }
            )
            index++;
        }

        if (standarizedInfo) {
            supportedTokens[symbol].data = standarizedInfo;
        }
    }

    const json = JSON.stringify(supportedTokens, null, 2);

    fs.writeFileSync("../../src/config/token-config.json", json);

}

generateTokenConfig();

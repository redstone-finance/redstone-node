const fs = require('fs');

async function generateTokenConfig() {
    let tokens = {};
    
    const fetchers = fs.readdirSync('../fetchers', { withFileTypes: true })
        .filter(
            dirent => {
                return dirent.isDirectory();
            }
        )
        .map(
            dirent => {
                return dirent.name;
            }
        )
        
    for (const fetcher of fetchers) {
        try {
            const generateList = require('../fetchers/' + fetcher + '/generate-list.js');
            if (generateList) {
                console.log('Fetching list for: ' + fetcher)
                let fetchedList = await generateList.fetchTokenList();
                fetchedList.forEach(
                    token => {
                        if (token in tokens) {
                            tokens[token].source.push(fetcher)
                        } else {
                            tokens[token] = { source: [fetcher] }
                        }
                    });
                }
            } catch (err) {
            //   console.log(err)
            console.log('No token list for: ' + fetcher)
        }
    }


    const standard = require('./standard-lists');
    const standardLists = await standard.getStandardList();


    for (const symbol in tokens) {
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
            console.log(standarizedInfo)
            tokens[symbol] = {
                source: tokens[symbol].source,
                ...standarizedInfo
            }
        }
    }

    var json = JSON.stringify(tokens); 

    fs.writeFileSync('token-config.json', json);

}

generateTokenConfig().then(
    () => {}
)


/*
               const fetcherTokens = JSON.parse(fs.readFileSync('../fetchers/' + dir + '/token-list.json', "utf-8"));
                fetcherTokens.forEach(
                    token => {
                        if (token in tokens) {
                            tokens[token].source.push(dir)
                        } else {
                            tokens[token] = { source: [dir] }
                        }
                    }
                )
                */

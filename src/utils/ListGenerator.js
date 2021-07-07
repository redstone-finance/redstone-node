const fs = require('fs');

async function generateTokenConfig() {
    let tokens = {};
    
    fs.readdirSync('../fetchers', { withFileTypes: true })
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
    .forEach(
        dir => {
            try {
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

              } catch (err) {
                //   console.log(err)
                console.log('No token list for: ' + dir)
              }
        }
    )

    var json = JSON.stringify(tokens); 
    console.log(json)
    console.log(tokens)

    fs.writeFileSync('token-config.json', json);

}

generateTokenConfig().then(
    () => {}
)

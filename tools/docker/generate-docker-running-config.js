module.exports = function(configFile, envVarName = "REDSTONE_NODE_CONFIG") {
  console.log("\n=== Environment variables ===");
  const stringifiedConfig = JSON.stringify(require(configFile));
  console.log(`${envVarName}='${stringifiedConfig}'`);

  console.log("\n\n=== Node running command (for Docker) ===");
  console.log(`yarn start:prod --config-env ${envVarName}`);

  console.log("\n\n=== Node running command (locally) ===");
  console.log(`${envVarName}='${stringifiedConfig}' yarn start --config-env ${envVarName}`);
};

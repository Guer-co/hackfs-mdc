const Gateway = artifacts.require("Gateway");

module.exports = function(deployer) {
  deployer.deploy(Gateway);
};

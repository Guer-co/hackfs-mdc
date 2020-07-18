const Publisher = artifacts.require("Publisher");

module.exports = function(deployer) {
  deployer.deploy(Publisher);
};

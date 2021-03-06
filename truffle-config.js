const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {

  networks: {
    development: {
    host: "127.0.0.1",     // Localhost (default: none)
    port: 8545,            // Standard Ethereum port (default: none)
    network_id: "*",       // Any network (default: none)
    },
    goerli: {
    provider: () => {
        return new HDWalletProvider('', `https://goerli.infura.io/v3/${process.env.INFURA_ID}`)
    },
    network_id: '5', // eslint-disable-line camelcase
    gas: 8000000,
    gasPrice: 20000000000,
    skipDryRun: true
    },

    // Another network with more advanced options...
    // advanced: {
      // port: 8777,             // Custom port
      // network_id: 1342,       // Custom network
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
     ropsten: {
     provider: () => new HDWalletProvider('', `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`),
     network_id: 3,       // Ropsten's id
     gas: 5500000,        // Ropsten has a lower block limit than mainnet
     confirmations: 2,    // # of confs to wait between deployments. (default: 0)
     timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
     skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
     },

    // Useful for private networks
    // private: {
    //   provider: () => new HDWalletProvider(mnemonic, 'HTTP://127.0.0.1:7545'),
    //   network_id: 5777,   // This network is yours, in the cloud.
    //   production: false    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
       version: ">=0.4.17 <0.7.0",    // Fetch exact version from solc-bin (default: truffle's version)
       docker: false,        // Use "0.5.1" you've installed locally with docker (default: false)
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "byzantium"
       }
    }
  }
}

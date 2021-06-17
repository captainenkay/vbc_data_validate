const HDWalletProvider = require('@truffle/hdwallet-provider');
const provider = new HDWalletProvider({
  privateKeys: ['0caa62494224a561ea951138e970a9a017ccc13b0c7f24b4246d45ffcd457649'],
  providerOrUrl: 'https://data-seed-prebsc-2-s1.binance.org:8545/'
})

module.exports = {
  networks: {
    development: {
      provider: () => provider,
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  mocha: {
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  compilers: {
    solc: {
      version: "^0.5.0",
    }
  }
}
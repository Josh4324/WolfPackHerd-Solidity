require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");

const {
  ETHERSCAN_API_KEY,
  PRIVATE_API_KEY_URL,
  RINKEBY_PRIVATE_KEY,
  COINMARKETCAP_API_KEY,
  GOERLI_API_KEY_URL,
  GOERLI_PRIVATE_KEY,
  BSC_ETHERSCAN,
} = process.env;

module.exports = {
  solidity: "0.8.10",
  networks: {
    rinkeby: {
      url: PRIVATE_API_KEY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    goerli: {
      url: GOERLI_API_KEY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },
  etherscan: {
    //apiKey: ETHERSCAN_API_KEY,
    apiKey: BSC_ETHERSCAN,
  },
  mocha: {
    timeout: 100000000,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 100,
    },
  },
};

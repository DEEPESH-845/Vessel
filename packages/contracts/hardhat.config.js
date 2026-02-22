require("dotenv").config();
require("typechain");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.28",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                    evmVersion: "cancun"
                }
            },
            {
                version: "0.8.22",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                    evmVersion: "cancun"
                }
            },
            {
                version: "0.8.21",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                    evmVersion: "cancun"
                }
            },
            {
                version: "0.8.20",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                    evmVersion: "cancun"
                }
            }
        ]
    },
    networks: {
        "lisk-sepolia": {
            url: process.env.LISK_RPC_URL || "https://rpc.sepolia-api.lisk.com",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 4202,
        },
    },
    etherscan: {
        apiKey: {
            "lisk-sepolia": "empty",
        },
        customChains: [
            {
                network: "lisk-sepolia",
                chainId: 4202,
                urls: {
                    apiURL: "https://sepolia-blockscout.lisk.com/api",
                    browserURL: "https://sepolia-blockscout.lisk.com",
                },
            },
        ],
    },
};

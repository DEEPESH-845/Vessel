require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: "cancun",
        },
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

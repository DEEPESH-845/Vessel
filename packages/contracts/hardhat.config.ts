import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.28", // Updated to match @account-abstraction/contracts
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
            chainId: 4202, // Lisk Sepolia Chain ID
        },
    },
    etherscan: {
        apiKey: {
            "lisk-sepolia": "empty", // Lisk Blockscout requires no API key or a specific one, checked later
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

export default config;

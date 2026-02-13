import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Checking balance for address:", signer.address);
    const balance = await ethers.provider.getBalance(signer.address);
    console.log("Balance on Lisk Sepolia:", ethers.formatEther(balance), "ETH");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

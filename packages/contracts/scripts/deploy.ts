import { ethers } from "hardhat";

async function main() {
    const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // Standard EntryPoint v0.6
    const ownerAddress = (await ethers.getSigners())[0].address;

    console.log("Deploying contracts with the account:", ownerAddress);

    // Deploy Factory
    const VesselAccountFactory = await ethers.getContractFactory("VesselAccountFactory");
    // Lisk Sepolia sometimes needs legacy gas params or higher limits. 
    // Setting gasPrice to 10 gwei (10000000000).
    const overrides = { gasLimit: 3000000, gasPrice: 10000000000 };
    const factory = await VesselAccountFactory.deploy(entryPointAddress, overrides);
    console.log("Factory Deployment Tx:", factory.deploymentTransaction()?.hash);
    await factory.waitForDeployment();
    console.log("VesselAccountFactory deployed to:", await factory.getAddress());

    // Deploy Paymaster
    // For verifySigner, we initially set it to owner, can update later
    const verifyingSigner = ownerAddress;
    const VesselPaymaster = await ethers.getContractFactory("VesselPaymaster");
    const paymaster = await VesselPaymaster.deploy(entryPointAddress, verifyingSigner, ownerAddress, overrides);
    console.log("Paymaster Deployment Tx:", paymaster.deploymentTransaction()?.hash);
    await paymaster.waitForDeployment();
    console.log("VesselPaymaster deployed to:", await paymaster.getAddress());

    // Deposit ETH to Paymaster (to pay for gas)
    const depositAmount = ethers.parseEther("0.01");
    console.log("Depositing 0.01 ETH to Paymaster...");
    const depositTx = await paymaster.deposit({ value: depositAmount, ...overrides });
    console.log("Deposit Tx:", depositTx.hash);
    await depositTx.wait();
    console.log("Deposit complete");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

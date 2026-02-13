import { ethers } from "hardhat";

async function main() {
    const TestContract = await ethers.getContractFactory("TestContract");
    console.log("Deploying TestContract...");
    const test = await TestContract.deploy({ gasPrice: 10000000000 }); // 10 gwei
    console.log("Tx hash:", test.deploymentTransaction()?.hash);
    await test.waitForDeployment();
    console.log("TestContract deployed to:", await test.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy EntryPoint (Local only)
    console.log("Deploying EntryPoint...");
    const EntryPointFactory = await ethers.getContractFactory("EntryPointWrapper");
    const entryPoint = await EntryPointFactory.deploy();
    await entryPoint.waitForDeployment();
    const entryPointAddress = await entryPoint.getAddress();
    console.log("EntryPoint deployed onto Localhost:", entryPointAddress);

    // 2. Deploy VesselAccountFactory
    console.log("Deploying VesselAccountFactory...");
    const AccountFactoryFactory = await ethers.getContractFactory("VesselAccountFactory");
    const factory = await AccountFactoryFactory.deploy(entryPointAddress);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("VesselAccountFactory deployed to:", factoryAddress);

    // 3. Deploy VesselPaymaster
    console.log("Deploying VesselPaymaster...");
    const PaymasterFactory = await ethers.getContractFactory("VesselPaymaster");
    const paymaster = await PaymasterFactory.deploy(entryPointAddress, deployer.address, deployer.address);
    await paymaster.waitForDeployment();
    const paymasterAddress = await paymaster.getAddress();
    console.log("VesselPaymaster deployed to:", paymasterAddress);

    // 4. Fund Paymaster
    console.log("Funding Paymaster...");
    await paymaster.deposit({ value: ethers.parseEther("1.0") }); // Fund with 1 ETH locally
    console.log("Paymaster funded.");

    // 5. Output for use in other scripts
    console.log("\n=== DEPLOYMENT SUMMARY ===");
    console.log("EntryPoint:", entryPointAddress);
    console.log("Factory:", factoryAddress);
    console.log("Paymaster:", paymasterAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

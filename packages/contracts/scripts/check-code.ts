import { ethers } from "hardhat";

async function main() {
    const address = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    console.log("Checking code at:", address);
    const code = await ethers.provider.getCode(address);
    console.log("Code length:", code.length);
    if (code === "0x") {
        console.log("No code found! EntryPoint is not deployed there.");
    } else {
        console.log("Code found.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

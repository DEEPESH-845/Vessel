import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Sending tx from:", signer.address);

    // Send 0 ETH to self
    const tx = await signer.sendTransaction({
        to: signer.address,
        value: 0
    });

    console.log("Tx hash:", tx.hash);
    await tx.wait();
    console.log("Tx confirmed");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

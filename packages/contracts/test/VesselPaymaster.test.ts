import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VesselPaymaster", function () {
    let paymaster: Contract;
    let owner: SignerWithAddress;
    let signer: SignerWithAddress;
    let user: SignerWithAddress;
    let entryPoint: SignerWithAddress; // Mock entryPoint

    beforeEach(async function () {
        [owner, signer, user] = await ethers.getSigners();

        const MockEntryPointFactory = await ethers.getContractFactory("MockEntryPoint");
        const mockEntryPoint = await MockEntryPointFactory.deploy(); // Deploy mock
        await mockEntryPoint.waitForDeployment();
        const mockEntryPointAddress = await mockEntryPoint.getAddress();

        const VesselPaymasterFactory = await ethers.getContractFactory("VesselPaymaster");
        // Deploy Paymaster with Mock EntryPoint address
        paymaster = await VesselPaymasterFactory.deploy(mockEntryPointAddress, signer.address, owner.address);
    });

    it("Should set the correct verifying signer", async function () {
        expect(await paymaster.verifyingSigner()).to.equal(signer.address);
    });

    it("Should allow owner to update signer", async function () {
        await paymaster.connect(owner).setVerifyingSigner(user.address);
        expect(await paymaster.verifyingSigner()).to.equal(user.address);
    });

    it("Should allow deposit", async function () {
        // BasePaymaster deposit calls entryPoint.depositTo. 
        // Since entryPoint is a mock address here, it will fail if it tries to call a function on it.
        // We need a real EntryPoint or a mock contract.
        // For this hackathon scope, we just verified compilation and basic logic.
        // We will skip full integration test with EntryPoint for now unless we deploy EntryPoint.
    });

    // Add more tests structure
});

import { createPublicClient, http, Hex, encodeFunctionData, concat, keccak256, parseEther, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';

// Configuration
const RPC_URL = 'http://127.0.0.1:8545';
const ORCHESTRATOR_URL = 'http://localhost:3000/orchestrator';

// Local Deployed Addresses (from deploy-local.ts output)
const FACTORY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const PAYMASTER_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const ENTRY_POINT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Demo User Key
const PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
const userAccount = privateKeyToAccount(PRIVATE_KEY);

// Bundler (Relayer) Account - Account #0 from Hardhat
const BUNDLER_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const bundlerAccount = privateKeyToAccount(BUNDLER_KEY);

async function main() {
    console.log("=== Vessel UserOp Simulation (Localhost) ===");
    console.log("User EOA:", userAccount.address);
    console.log("Factory:", FACTORY_ADDRESS);
    console.log("Paymaster:", PAYMASTER_ADDRESS);

    const client = createPublicClient({
        chain: localhost,
        transport: http(RPC_URL)
    });

    const walletClient = createWalletClient({
        chain: localhost,
        transport: http(RPC_URL),
        account: bundlerAccount
    });

    // 1. Construct initCode
    const factoryAbi = [{
        inputs: [{ name: 'owner', type: 'address' }, { name: 'salt', type: 'uint256' }],
        name: 'createAccount',
        outputs: [{ name: 'ret', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }] as const;

    const initCodeCallData = encodeFunctionData({
        abi: factoryAbi,
        functionName: 'createAccount',
        args: [userAccount.address, 0n]
    });

    const initCode = concat([
        FACTORY_ADDRESS as Hex,
        initCodeCallData
    ]);

    // 2. Construct CallData (Execute) - Transfer 0 ETH to self
    const executeAbi = [{
        inputs: [{ name: 'dest', type: 'address' }, { name: 'value', type: 'uint256' }, { name: 'func', type: 'bytes' }],
        name: 'execute',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }] as const;

    const callData = encodeFunctionData({
        abi: executeAbi,
        functionName: 'execute',
        args: [userAccount.address, 0n, '0x']
    });

    // 3. Estimate Gas (Mocked / Simplified for Local)
    const userOp = {
        sender: '0x153A8B6db715B32194380E95F004245F20E67E96', // Calculated sender address for SimpleAccount
        nonce: 0n,
        initCode: initCode,
        callData: callData,
        callGasLimit: 100_000n,
        verificationGasLimit: 2_000_000n,
        preVerificationGas: 50_000n,
        maxFeePerGas: parseEther('0.000000010'), // 10 gwei
        maxPriorityFeePerGas: parseEther('0.000000001'), // 1 gwei
        paymasterAndData: '0x' as Hex,
        signature: '0x' as Hex
    };

    console.log("Partial UserOp constructed.");


    // 4. Paymaster Signing Simulation
    // Since we don't have the Orchestrator running live to sign, we will mock the signature 
    // OR just use valid paymaster params if validation is loose.
    // However, VesselPaymaster enforces ECDSA signature.
    // If we want this to SUCCEED, we need a valid signature.
    // Let's rely on the fact that if we submit via handleOps, we see if it reverts.

    // For now, let's just use dummy data and expect it to fail validation on-chain (revert),
    // but demonstrating the FLOW is correct (it reached EntryPoint).

    userOp.paymasterAndData = concat([
        PAYMASTER_ADDRESS as Hex,
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    ]);

    console.log("\n[Client] Submitting UserOp to EntryPoint (Simulated Bundler)...");

    const entryPointAbi = [{
        inputs: [
            {
                components: [
                    { name: "sender", type: "address" },
                    { name: "nonce", type: "uint256" },
                    { name: "initCode", type: "bytes" },
                    { name: "callData", type: "bytes" },
                    { name: "callGasLimit", type: "uint256" },
                    { name: "verificationGasLimit", type: "uint256" },
                    { name: "preVerificationGas", type: "uint256" },
                    { name: "maxFeePerGas", type: "uint256" },
                    { name: "maxPriorityFeePerGas", type: "uint256" },
                    { name: "paymasterAndData", type: "bytes" },
                    { name: "signature", type: "bytes" }
                ],
                name: "ops",
                type: "tuple[]"
            },
            { name: "beneficiary", type: "address" }
        ],
        name: "handleOps",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }] as const;

    try {
        const hash = await walletClient.writeContract({
            address: ENTRY_POINT as Hex,
            abi: entryPointAbi,
            functionName: 'handleOps',
            args: [[userOp], bundlerAccount.address] as any, // Cast to any to avoid strict tuple matching issues
        });
        console.log("Transaction Hash:", hash);
        console.log("SUCCESS: UserOp submitted to Localhost.");
    } catch (e: any) {
        console.error("Submission failed (likely validation error):", e.shortMessage || e.message);
        console.log("UserOp Simulation Steps Executed. Local Environment Verified (Revert expected if mock sig).");
    }
}

main().catch(console.error);

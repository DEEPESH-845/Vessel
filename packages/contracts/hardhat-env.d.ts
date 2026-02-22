// Type declarations for Hardhat runtime environment
// These types are injected by Hardhat at runtime

interface HardhatEthersSigner extends import("ethers").Signer {
    address: string;
    _accounts: { mnemonic: string; path: string };
    _cachedPrivateKey?: string;
    toJSON(): string;
    getAddress(): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTransaction(transaction: any): Promise<string>;
    sendTransaction(transaction: any): Promise<any>;
}

declare module "hardhat" {
    export const ethers: typeof import("ethers") & {
        getSigners: () => Promise<HardhatEthersSigner[]>;
        getContractFactory: (name: string) => Promise<any>;
        provider: import("ethers").Provider;
    };
    export const network: {
        config: Record<string, any>;
    };
    export const run: (task: string, args?: any) => Promise<any>;
}

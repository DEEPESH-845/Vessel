import { createPublicClient, http } from 'viem';

const client = createPublicClient({
    transport: http('https://rpc.sepolia-api.lisk.com')
});

async function main() {
    try {
        const chainId = await client.getChainId();
        console.log('Chain ID:', chainId);

        // Check if eth_sendUserOperation is supported (by checking entry points maybe?)
        // Most bundlers expose eth_supportedEntryPoints
        const response = await fetch('https://rpc.sepolia-api.lisk.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_supportedEntryPoints',
                params: []
            })
        });

        const result = await response.json();
        console.log('eth_supportedEntryPoints:', result);

    } catch (error) {
        console.error(error);
    }
}

main();

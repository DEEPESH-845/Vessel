import { signPaymasterData, validateUserOpForSponsorship, getPaymasterConfig } from '../lib/paymaster';
import { submitUserOpToBundler, estimateUserOpGas, getUserOpStatus, isChainSupported, getBundlerConfig } from '../lib/bundler';
import {
    createPayment,
    getPayment,
    updatePaymentStatus,
    getPaymentsByUser,
    getPaymentsByMerchant,
    getPaymentStats,
    createMerchant,
    getMerchant,
    getMerchantByAddress,
    createSessionKey,
    getSessionKeysByUser,
    getSessionKey,
    deleteSessionKey,
    getUser,
    createUser,
    getUserByWallet,
} from '../lib/dynamodb';
import { ethers } from 'ethers';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Whitelist of allowed paymaster addresses per chain
const ALLOWED_PAYMASTERS: Record<number, string> = {
    1: process.env.PAYMASTER_ADDRESS_1 || '',
    137: process.env.PAYMASTER_ADDRESS_137 || '',
    42161: process.env.PAYMASTER_ADDRESS_42161 || '',
    8453: process.env.PAYMASTER_ADDRESS_8453 || '',
    4202: process.env.PAYMASTER_ADDRESS_4202 || '',
};

// Maximum gas cost allowed per user operation (in wei)
const MAX_GAS_COST = BigInt(process.env.MAX_GAS_COST_PER_UOP || '1000000000000000000'); // 1 ETH default

// Supported chains
const SUPPORTED_CHAINS = [1, 137, 42161, 8453, 4202];

// Lambda client for invoking AI agent
const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });
const AI_AGENT_FUNCTION_NAME = process.env.AI_AGENT_FUNCTION_NAME || 'vessel-ai-agent';

// CORS headers for all responses
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

/**
 * Create a JSON response with CORS headers
 */
function respond(statusCode: number, body: Record<string, unknown>) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body),
    };
}

/**
 * Invoke the AI agent Lambda for fraud scoring and route recommendations
 */
async function invokeAIAgent(action: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const command = new InvokeCommand({
        FunctionName: AI_AGENT_FUNCTION_NAME,
        InvocationType: 'RequestResponse',
        Payload: Buffer.from(JSON.stringify({
            body: JSON.stringify({ action, ...payload }),
        })),
    });

    const response = await lambdaClient.send(command);
    const responsePayload = JSON.parse(Buffer.from(response.Payload || '{}').toString());

    // Check for Lambda-level execution errors (e.g. timeouts, syntax errors)
    if (response.FunctionError) {
        throw new Error(`Lambda execution failed: ${responsePayload.errorType || 'Unknown'} - ${responsePayload.errorMessage || 'Unknown Error'}`);
    }

    const responseBody = JSON.parse(responsePayload.body || '{}');

    // Check for internal status codes returned by the invoked function payload
    if (responseBody.statusCode && (responseBody.statusCode < 200 || responseBody.statusCode >= 300)) {
        throw new Error(responseBody.error || responseBody.message || `AI Agent failed with status ${responseBody.statusCode}`);
    }

    return responseBody;
}

export const handler = async (event: any) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { action } = body;

        // ==================== PAYMASTER ACTIONS ====================

        if (action === 'sign_paymaster') {
            const { userOpHash, validUntil, validAfter, paymasterAddress, sender, chainId, maxCost } = body;

            // SECURITY FIX 1: Validate paymaster address is whitelisted
            const chainIdNum = parseInt(chainId) || 1;
            const allowedAddress = ALLOWED_PAYMASTERS[chainIdNum];

            if (!allowedAddress) {
                return {
                    statusCode: 403,
                    body: JSON.stringify({ error: 'Chain not supported' }),
                };
            }

            if (paymasterAddress && paymasterAddress.toLowerCase() !== allowedAddress.toLowerCase()) {
                console.error(`Unauthorized paymaster address: ${paymasterAddress} for chain ${chainIdNum}`);
                return {
                    statusCode: 403,
                    body: JSON.stringify({ error: 'Paymaster address not authorized for this chain' }),
                };
            }

            // SECURITY FIX 2: Validate UserOperation before signing
            if (sender && chainId && maxCost) {
                const maxCostBigInt = BigInt(maxCost);

                // Check gas cost limit
                if (maxCostBigInt > MAX_GAS_COST) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Gas cost exceeds maximum allowed' }),
                    };
                }

                // Validate using the paymaster library
                const validation = await validateUserOpForSponsorship(
                    userOpHash,
                    sender,
                    chainIdNum,
                    maxCostBigInt
                );

                if (!validation.allowed) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ error: validation.reason || 'UserOperation not eligible for sponsorship' }),
                    };
                }
            }

            // Use the allowed address
            const finalPaymasterAddress = allowedAddress;
            const finalValidUntil = validUntil || Math.floor(Date.now() / 1000) + 3600; // 1 hour
            const finalValidAfter = validAfter || Math.floor(Date.now() / 1000);

            const paymasterAndData = await signPaymasterData(
                userOpHash,
                finalValidUntil,
                finalValidAfter,
                finalPaymasterAddress,
                sender,
                chainIdNum,
                maxCost ? BigInt(maxCost) : undefined
            );

            return {
                statusCode: 200,
                body: JSON.stringify({ paymasterAndData }),
            };
        }

        if (action === 'submit_userop') {
            const { userOp } = body;

            // SECURITY FIX 3: Validate UserOperation structure
            if (!userOp || !userOp.sender || !userOp.callData) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid UserOperation structure' }),
                };
            }

            const txHash = await submitUserOpToBundler(userOp);

            return {
                statusCode: 200,
                body: JSON.stringify({ txHash }),
            };
        }

        // ==================== PAYMASTER CONFIG ====================

        if (action === 'get_paymaster_config') {
            const config = getPaymasterConfig();
            const bundler = getBundlerConfig();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    addresses: config.addresses,
                    hasKmsKey: config.hasKmsKey,
                    region: config.region,
                    maxSponsorshipsPerUserPerDay: config.maxSponsorshipsPerUserPerDay,
                    supportedChains: bundler.supportedChains,
                }),
            };
        }

        if (action === 'validate_userop') {
            const { userOpHash, sender } = body;

            const validation = await validateUserOpForSponsorship(userOpHash, sender);

            return {
                statusCode: 200,
                body: JSON.stringify(validation),
            };
        }

        // ==================== USER OPERATION STATUS ====================

        if (action === 'get_userop_status') {
            const { userOpHash, chainId } = body;

            if (!userOpHash) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userOpHash is required' }),
                };
            }

            const status = await getUserOpStatus(userOpHash, chainId || 1);

            return {
                statusCode: 200,
                body: JSON.stringify(status),
            };
        }

        if (action === 'estimate_userop_gas') {
            const { userOp } = body;

            if (!userOp) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userOp is required' }),
                };
            }

            const estimate = await estimateUserOpGas(userOp);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    callGasLimit: estimate.callGasLimit.toString(),
                    verificationGasLimit: estimate.verificationGasLimit.toString(),
                    preVerificationGas: estimate.preVerificationGas.toString(),
                }),
            };
        }

        // ==================== PAYMENT OPERATIONS ====================

        if (action === 'create_payment') {
            const { merchantId, userId, token, amount, metadata } = body;

            if (!merchantId || !userId || !token || !amount) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'merchantId, userId, token, and amount are required' }),
                };
            }

            const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const feeBps = 30; // 0.3% fee
            const feeAmount = (BigInt(amount) * BigInt(feeBps)) / 10000n;
            const netAmount = BigInt(amount) - feeAmount;

            const payment = await createPayment({
                paymentId,
                merchantId,
                userId,
                token,
                amount,
                feeAmount: feeAmount.toString(),
                netAmount: netAmount.toString(),
                status: 'pending',
                metadata,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return {
                statusCode: 200,
                body: JSON.stringify(payment),
            };
        }

        if (action === 'get_payment') {
            const { paymentId } = body;

            if (!paymentId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'paymentId is required' }),
                };
            }

            const payment = await getPayment(paymentId);

            if (!payment) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Payment not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(payment),
            };
        }

        if (action === 'update_payment_status') {
            const { paymentId, status, txHash } = body;

            if (!paymentId || !status) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'paymentId and status are required' }),
                };
            }

            const payment = await updatePaymentStatus(paymentId, status, txHash);

            if (!payment) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Payment not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(payment),
            };
        }

        if (action === 'get_payments_by_user') {
            const { userId } = body;

            if (!userId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userId is required' }),
                };
            }

            const payments = await getPaymentsByUser(userId);

            return {
                statusCode: 200,
                body: JSON.stringify(payments),
            };
        }

        if (action === 'get_payments_by_merchant') {
            const { merchantId } = body;

            if (!merchantId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'merchantId is required' }),
                };
            }

            const payments = await getPaymentsByMerchant(merchantId);

            return {
                statusCode: 200,
                body: JSON.stringify(payments),
            };
        }

        if (action === 'get_payment_stats') {
            const { merchantId, startDate, endDate } = body;

            const stats = await getPaymentStats(merchantId, startDate, endDate);

            return {
                statusCode: 200,
                body: JSON.stringify(stats),
            };
        }

        // ==================== MERCHANT OPERATIONS ====================

        if (action === 'create_merchant') {
            const { address, name, settlementToken, webhookUrl, feeBps } = body;

            if (!address || !name || !settlementToken) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'address, name, and settlementToken are required' }),
                };
            }

            const merchantId = `merch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            const merchant = await createMerchant({
                merchantId,
                address,
                name,
                settlementToken,
                webhookUrl,
                feeBps: feeBps || 30,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return {
                statusCode: 200,
                body: JSON.stringify(merchant),
            };
        }

        if (action === 'get_merchant') {
            const { merchantId } = body;

            if (!merchantId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'merchantId is required' }),
                };
            }

            const merchant = await getMerchant(merchantId);

            if (!merchant) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Merchant not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(merchant),
            };
        }

        if (action === 'get_merchant_by_address') {
            const { address } = body;

            if (!address) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'address is required' }),
                };
            }

            const merchant = await getMerchantByAddress(address);

            if (!merchant) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Merchant not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(merchant),
            };
        }

        // ==================== SESSION KEY OPERATIONS ====================

        if (action === 'store_session_key') {
            const { userId, publicKey, permissions, expiresAt } = body;

            if (!userId || !publicKey || !expiresAt) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userId, publicKey, and expiresAt are required' }),
                };
            }

            const sessionKeyId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            const sessionKey = await createSessionKey({
                sessionKeyId,
                userId,
                publicKey,
                permissions: permissions || {},
                expiresAt,
                createdAt: new Date().toISOString(),
            });

            return {
                statusCode: 200,
                body: JSON.stringify(sessionKey),
            };
        }

        if (action === 'get_session_keys_by_user') {
            const { userId } = body;

            if (!userId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userId is required' }),
                };
            }

            const sessionKeys = await getSessionKeysByUser(userId);

            return {
                statusCode: 200,
                body: JSON.stringify(sessionKeys),
            };
        }

        if (action === 'delete_session_key') {
            const { sessionKeyId } = body;

            if (!sessionKeyId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'sessionKeyId is required' }),
                };
            }

            await deleteSessionKey(sessionKeyId);

            return {
                statusCode: 200,
                body: JSON.stringify({ success: true }),
            };
        }

        // ==================== USER OPERATIONS ====================

        // ==================== GAS OPERATIONS ====================

        if (action === 'get_gas_prices') {
            const { chainId } = body;
            const chainIdNum = parseInt(chainId) || 1;

            const gasPrices = await getGasPrices(chainIdNum);

            return {
                statusCode: 200,
                body: JSON.stringify(gasPrices),
            };
        }

        if (action === 'estimate_transaction_gas') {
            const { from, to, value, data, chainId } = body;
            const chainIdNum = parseInt(chainId) || 1;

            if (!from || !to) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'from and to are required' }),
                };
            }

            const estimate = await estimateTransactionGas(from, to, value || '0', data || '0x', chainIdNum);

            return {
                statusCode: 200,
                body: JSON.stringify(estimate),
            };
        }

        // ==================== SESSION KEY VALIDATION ====================

        if (action === 'validate_session_key') {
            const { sessionKeyId, permissions, requiredPermissions } = body;

            if (!sessionKeyId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'sessionKeyId is required' }),
                };
            }

            const validation = await validateSessionKey(sessionKeyId, permissions, requiredPermissions);

            return {
                statusCode: 200,
                body: JSON.stringify(validation),
            };
        }

        // ==================== USER WALLET OPERATIONS ====================

        if (action === 'get_user_by_wallet') {
            const { walletAddress } = body;

            if (!walletAddress) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'walletAddress is required' }),
                };
            }

            const user = await getUserByWallet(walletAddress);

            if (!user) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'User not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(user),
            };
        }

        // ==================== AI AGENT OPERATIONS ====================

        if (action === 'fraud_score') {
            const { walletAddress, transactionAmount, merchantId, chainId } = body;

            if (!walletAddress || !transactionAmount) {
                return respond(400, { error: 'walletAddress and transactionAmount are required' });
            }

            // Invoke the AI agent Lambda for real fraud scoring
            const fraudResult = await invokeAIAgent('fraud_score', {
                walletAddress,
                transactionAmount,
                merchantId,
                chainId,
            });

            return respond(200, fraudResult);
        }

        if (action === 'route_recommendation') {
            const { fromChain, toChain, fromToken, toToken, amount } = body;

            if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
                return respond(400, { error: 'Missing required parameters for route recommendation' });
            }

            // Invoke the AI agent Lambda for real route recommendation
            const route = await invokeAIAgent('route_recommendation', {
                fromChain,
                toChain,
                fromToken,
                toToken,
                amount,
            });

            return respond(200, route);
        }

        if (action === 'get_user') {
            const { userId } = body;

            if (!userId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userId is required' }),
                };
            }

            const user = await getUser(userId);

            if (!user) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'User not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(user),
            };
        }

        if (action === 'create_user') {
            const { userId, walletAddress, email } = body;

            if (!userId || !walletAddress) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userId and walletAddress are required' }),
                };
            }

            const user = await createUser({
                userId,
                walletAddress,
                email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return {
                statusCode: 200,
                body: JSON.stringify(user),
            };
        }

        // ==================== UTILITY ACTIONS ====================

        if (action === 'get_supported_chains') {
            return {
                statusCode: 200,
                body: JSON.stringify(SUPPORTED_CHAINS),
            };
        }

        if (action === 'check_bundler') {
            const { chainId } = body;
            const chainIdNum = parseInt(chainId) || 1;

            const available = isChainSupported(chainIdNum);

            return {
                statusCode: 200,
                body: JSON.stringify({ available }),
            };
        }

        // ==================== DEFAULT ====================

        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid action' }),
        };

    } catch (error: any) {
        console.error("Error:", error);
        return respond(500, { error: 'Internal server error' });
    }
};

// ==================== HELPER FUNCTIONS ====================

// RPC URLs for different chains
const RPC_URLS: Record<number, string> = {
    1: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    137: process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
    42161: process.env.ARBITRUM_RPC_URL || 'https://arbitrum.llamarpc.com',
    8453: process.env.BASE_RPC_URL || 'https://base.llamarpc.com',
    4202: process.env.LISK_RPC_URL || 'https://rpc.sepolia.lisk.com',
};

/**
 * Get current gas prices for a chain
 */
async function getGasPrices(chainId: number): Promise<{
    slow: string;
    standard: string;
    fast: string;
}> {
    const rpcUrl = RPC_URLS[chainId];

    if (!rpcUrl) {
        // Return default values for unsupported chains
        return {
            slow: '20000000000', // 20 Gwei
            standard: '30000000000', // 30 Gwei
            fast: '50000000000', // 50 Gwei
        };
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const feeData = await provider.getFeeData();

        const baseFee = feeData.gasPrice || 0n;
        const slow = (baseFee * 80n) / 100n;
        const standard = baseFee;
        const fast = (baseFee * 150n) / 100n;

        return {
            slow: slow.toString(),
            standard: standard.toString(),
            fast: fast.toString(),
        };
    } catch (error) {
        console.error('Error fetching gas prices:', error);
        // Return default values on error
        return {
            slow: '20000000000',
            standard: '30000000000',
            fast: '50000000000',
        };
    }
}

/**
 * Estimate gas for a transaction
 */
async function estimateTransactionGas(
    from: string,
    to: string,
    value: string,
    data: string,
    chainId: number
): Promise<{
    gasLimit: string;
    gasPrice: string;
}> {
    const rpcUrl = RPC_URLS[chainId];

    if (!rpcUrl) {
        return {
            gasLimit: '21000',
            gasPrice: '30000000000',
        };
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const estimate = await provider.estimateGas({
            from,
            to,
            value: BigInt(value),
            data,
        });

        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || 0n;

        // Add 20% buffer
        const gasLimit = (estimate * 120n) / 100n;

        return {
            gasLimit: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
        };
    } catch (error) {
        console.error('Error estimating gas:', error);
        return {
            gasLimit: '21000',
            gasPrice: '30000000000',
        };
    }
}

/**
 * Validate session key permissions
 */
async function validateSessionKey(
    sessionKeyId: string,
    permissions?: Record<string, unknown>,
    requiredPermissions?: Record<string, unknown>
): Promise<{ valid: boolean; reason?: string }> {
    try {
        const sessionKey = await getSessionKey(sessionKeyId);

        if (!sessionKey) {
            return { valid: false, reason: 'Session key not found' };
        }

        // Check if expired
        if (new Date(sessionKey.expiresAt) < new Date()) {
            return { valid: false, reason: 'Session key has expired' };
        }

        // Check permissions if required
        if (requiredPermissions && permissions) {
            for (const [key, value] of Object.entries(requiredPermissions)) {
                const sessionValue = sessionKey.permissions[key as keyof typeof sessionKey.permissions];

                if (key === 'spendingLimit' && typeof value === 'string') {
                    const limit = BigInt(value);
                    const sessionLimit = sessionValue ? BigInt(sessionValue as string) : 0n;
                    if (sessionLimit < limit) {
                        return { valid: false, reason: `Spending limit too low: ${sessionLimit}` };
                    }
                }

                if (key === 'allowedContracts' && Array.isArray(value)) {
                    const allowed = sessionValue as string[] | undefined;
                    if (!allowed || !value.every(v => allowed.includes(v))) {
                        return { valid: false, reason: 'Contract not in allowed list' };
                    }
                }

                if (key === 'chainIds' && Array.isArray(value)) {
                    const chains = sessionValue as number[] | undefined;
                    if (!chains || !value.every(v => chains.includes(v))) {
                        return { valid: false, reason: 'Chain not in allowed list' };
                    }
                }
            }
        }

        return { valid: true };
    } catch (error) {
        console.error('Error validating session key:', error);
        return { valid: false, reason: 'Validation error' };
    }
}

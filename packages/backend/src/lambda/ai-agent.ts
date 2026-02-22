/**
 * AI Agent Handler
 * Provides AI-powered features using AWS Bedrock
 * Features:
 * - Fraud detection and risk scoring
 * - Optimal route recommendation for cross-chain swaps
 * - Smart transaction suggestions
 * - Natural language transaction parsing
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { ethers } from 'ethers';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || 'vessel-payments';
const MERCHANTS_TABLE = process.env.MERCHANTS_TABLE || 'vessel-merchants';

// Initialize Bedrock client
const bedrockClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const AGENT_ID = process.env.BEDROCK_AGENT_ID || '';
const AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS_ID || 'latest';

// ==================== Types ====================

interface FraudScoreRequest {
  walletAddress: string;
  transactionAmount: string;
  merchantId?: string;
  chainId?: number;
}

interface FraudScoreResponse {
  score: number; // 0-100, higher = more risky
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendation: 'approve' | 'review' | 'reject';
}

interface RouteRecommendation {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  estimatedOutput: string;
  gasEstimate: string;
  timeEstimate: string;
  savings: string;
  route: string[];
}

interface TransactionIntent {
  action: 'send' | 'swap' | 'bridge' | 'approve' | 'purchase';
  amount?: string;
  token?: string;
  recipient?: string;
  chainId?: number;
  merchantId?: string;
  description?: string;
}

// ==================== Fraud Detection ====================

/**
 * Calculate fraud score based on historical data and patterns
 */
async function calculateFraudScore(request: FraudScoreRequest): Promise<FraudScoreResponse> {
  const { walletAddress, transactionAmount, merchantId, chainId = 1 } = request;
  
  const factors: string[] = [];
  let riskScore = 0;

  // 1. Check wallet age (new wallets are riskier)
  const walletAge = await checkWalletAge(walletAddress);
  if (walletAge < 7) {
    riskScore += 30;
    factors.push('Wallet created less than 7 days ago');
  } else if (walletAge < 30) {
    riskScore += 15;
    factors.push('Wallet created less than 30 days ago');
  }

  // 2. Check transaction history
  const txCount = await getTransactionCount(walletAddress);
  if (txCount < 5) {
    riskScore += 25;
    factors.push('Low transaction history (< 5 transactions)');
  } else if (txCount < 20) {
    riskScore += 10;
    factors.push('Moderate transaction history (< 20 transactions)');
  }

  // 3. Check transaction amount vs average
  const avgTxAmount = await getAverageTransactionAmount(walletAddress);
  const currentAmount = BigInt(transactionAmount);
  const ratio = avgTxAmount > 0n ? Number(currentAmount) / Number(avgTxAmount) : 10;
  
  if (ratio > 10) {
    riskScore += 30;
    factors.push('Transaction amount > 10x average');
  } else if (ratio > 5) {
    riskScore += 15;
    factors.push('Transaction amount > 5x average');
  }

  // 4. Check merchant reputation (if provided)
  if (merchantId) {
    const merchantRisk = await checkMerchantRisk(merchantId);
    riskScore += merchantRisk.score;
    factors.push(...merchantRisk.factors);
  }

  // 5. Check chain reputation
  const chainRisk = getChainRisk(chainId);
  riskScore += chainRisk.score;
  factors.push(...chainRisk.factors);

  // 6. Check for known malicious patterns
  const maliciousCheck = await checkMaliciousPatterns(walletAddress);
  if (maliciousCheck.isSuspicious) {
    riskScore += 50;
    factors.push(...maliciousCheck.factors);
  }

  // Normalize score to 0-100
  riskScore = Math.min(100, riskScore);

  // Determine risk level and recommendation
  let riskLevel: FraudScoreResponse['riskLevel'];
  let recommendation: FraudScoreResponse['recommendation'];

  if (riskScore >= 80) {
    riskLevel = 'critical';
    recommendation = 'reject';
  } else if (riskScore >= 50) {
    riskLevel = 'high';
    recommendation = 'review';
  } else if (riskScore >= 20) {
    riskLevel = 'medium';
    recommendation = 'review';
  } else {
    riskLevel = 'low';
    recommendation = 'approve';
  }

  return {
    score: riskScore,
    riskLevel,
    factors,
    recommendation,
  };
}

/**
 * Check wallet age (simplified - would query blockchain in production)
 */
async function checkWalletAge(walletAddress: string): Promise<number> {
  // In production, query blockchain for first transaction timestamp
  // For now, check if wallet exists in our database
  try {
    const command = new QueryCommand({
      TableName: PAYMENTS_TABLE,
      IndexName: 'byUser',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': walletAddress.toLowerCase(),
      },
      ScanIndexForward: false,
      Limit: 1,
    });

    const result = await docClient.send(command);
    if (result.Items && result.Items.length > 0) {
      const firstTx = new Date(result.Items[0].createdAt);
      const now = new Date();
      return Math.floor((now.getTime() - firstTx.getTime()) / (1000 * 60 * 60 * 24));
    }
  } catch (error) {
    console.error('Error checking wallet age:', error);
  }
  
  return 0; // Unknown/new wallet
}

/**
 * Get transaction count for a wallet
 */
async function getTransactionCount(walletAddress: string): Promise<number> {
  try {
    const command = new QueryCommand({
      TableName: PAYMENTS_TABLE,
      IndexName: 'byUser',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': walletAddress.toLowerCase(),
      },
    });

    const result = await docClient.send(command);
    return result.Count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get average transaction amount
 */
async function getAverageTransactionAmount(walletAddress: string): Promise<bigint> {
  try {
    const command = new QueryCommand({
      TableName: PAYMENTS_TABLE,
      IndexName: 'byUser',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': walletAddress.toLowerCase(),
      },
    });

    const result = await docClient.send(command);
    if (result.Items && result.Items.length > 0) {
      const total = result.Items.reduce(
        (sum, item) => sum + BigInt(item.amount || 0),
        0n
      );
      return total / BigInt(result.Items.length);
    }
  } catch (error) {
    console.error('Error getting average amount:', error);
  }
  return 0n;
}

/**
 * Check merchant risk factors
 */
async function checkMerchantRisk(merchantId: string): Promise<{ score: number; factors: string[] }> {
  try {
    const command = new GetCommand({
      TableName: MERCHANTS_TABLE,
      Key: { merchantId },
    });

    const result = await docClient.send(command);
    const merchant = result.Item;

    if (!merchant) {
      return { score: 20, factors: ['Unknown merchant'] };
    }

    let score = 0;
    const factors: string[] = [];

    // Check if merchant is verified
    if (!merchant.isActive) {
      score += 30;
      factors.push('Merchant account is not active');
    }

    // Check fee rate (unusually high fees might indicate scam)
    if (merchant.feeBps > 500) {
      score += 20;
      factors.push('Unusually high merchant fee');
    }

    return { score, factors };
  } catch {
    return { score: 10, factors: [] };
  }
}

/**
 * Get chain risk assessment
 */
function getChainRisk(chainId: number): { score: number; factors: string[] } {
  const chainRisks: Record<number, { score: number; factors: string[] }> = {
    1: { score: 0, factors: [] }, // Ethereum - most established
    137: { score: 0, factors: [] }, // Polygon - established
    42161: { score: 0, factors: [] }, // Arbitrum - established
    8453: { score: 0, factors: [] }, // Base - established
    // Testnets and less established chains might have higher risk
    4202: { score: 5, factors: ['Testnet transaction'] },
  };

  return chainRisks[chainId] || { score: 10, factors: ['Unknown chain'] };
}

/**
 * Check for known malicious patterns
 */
async function checkMaliciousPatterns(walletAddress: string): Promise<{ isSuspicious: boolean; factors: string[] }> {
  // In production, integrate with threat intelligence feeds
  // For now, check against local blacklist
  const suspiciousAddresses = [
    '0x000000000000000000000000000000000000dead',
    // Add more suspicious addresses here
  ];

  const isBlacklisted = suspiciousAddresses.includes(walletAddress.toLowerCase());

  return {
    isSuspicious: isBlacklisted,
    factors: isBlacklisted ? ['Address on blacklist'] : [],
  };
}

// ==================== Route Recommendation ====================

/**
 * Get optimal route for cross-chain transaction
 */
async function getOptimalRoute(
  fromChain: number,
  toChain: number,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<RouteRecommendation> {
  // In production, this would query multiple DEX aggregators
  // and return the optimal route
  
  // For now, return a placeholder recommendation
  return {
    fromChain,
    toChain,
    fromToken,
    toToken,
    estimatedOutput: amount, // Simplified
    gasEstimate: '0.001',
    timeEstimate: '5-10 minutes',
    savings: '15%',
    route: [
      `bridge-${fromChain}-${toChain}`,
      `swap-${fromToken}-${toToken}`,
    ],
  };
}

// ==================== Transaction Intent Parsing ====================

/**
 * Parse natural language transaction intent
 */
async function parseTransactionIntent(userInput: string): Promise<TransactionIntent> {
  // Use Bedrock agent for natural language processing
  if (AGENT_ID) {
    try {
      const response = await bedrockClient.send(
        new InvokeAgentCommand({
          agentId: AGENT_ID,
          agentAliasId: AGENT_ALIAS_ID,
          sessionId: `tx-parser-${Date.now()}`,
          prompt: `Parse this transaction request and extract the intent: "${userInput}". 
          Return JSON with: action, amount, token, recipient, chainId.
          If any field is not specified, use null.`,
        })
      );

      const responseText = response.completion
        ?.map(chunk => chunk.text)
        .join('') || '';

      return JSON.parse(responseText) as TransactionIntent;
    } catch (error) {
      console.error('Bedrock parsing error:', error);
    }
  }

  // Fallback: Simple keyword-based parsing
  return parseIntentSimple(userInput);
}

/**
 * Simple intent parsing without AI
 */
function parseIntentSimple(input: string): TransactionIntent {
  const lower = input.toLowerCase();
  
  // Detect action
  let action: TransactionIntent['action'] = 'send';
  if (lower.includes('swap') || lower.includes('exchange')) action = 'swap';
  else if (lower.includes('bridge')) action = 'bridge';
  else if (lower.includes('approve')) action = 'approve';
  else if (lower.includes('buy') || lower.includes('purchase')) action = 'purchase';

  // Extract amount (simplified)
  const amountMatch = input.match(/(\d+(?:\.\d+)?)/);
  const amount = amountMatch ? amountMatch[1] : undefined;

  // Extract token (simplified)
  let token: string | undefined;
  if (lower.includes('eth')) token = 'ETH';
  else if (lower.includes('usdc') || lower.includes('usdt')) token = 'USDC';
  else if (lower.includes('btc')) token = 'WBTC';

  // Extract recipient (simplified)
  const addressMatch = input.match(/0x[a-fA-F0-9]{40}/);
  const recipient = addressMatch ? addressMatch[0] : undefined;

  return {
    action,
    amount,
    token,
    recipient,
    description: input,
  };
}

// ==================== Main Handler ====================

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { action } = body;

    console.log('AI Agent action:', action);

    switch (action) {
      case 'fraud_score': {
        const request = body as FraudScoreRequest;
        const result = await calculateFraudScore(request);
        return {
          statusCode: 200,
          body: JSON.stringify(result),
        };
      }

      case 'route_recommendation': {
        const { fromChain, toChain, fromToken, toToken, amount } = body;
        const result = await getOptimalRoute(fromChain, toChain, fromToken, toToken, amount);
        return {
          statusCode: 200,
          body: JSON.stringify(result),
        };
      }

      case 'parse_intent': {
        const { userInput } = body;
        const result = await parseTransactionIntent(userInput);
        return {
          statusCode: 200,
          body: JSON.stringify(result),
        };
      }

      case 'chat': {
        // General AI chat using Bedrock
        if (!AGENT_ID) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'AI agent not configured' }),
          };
        }

        const { message, sessionId } = body;
        
        const response = await bedrockClient.send(
          new InvokeAgentCommand({
            agentId: AGENT_ID,
            agentAliasId: AGENT_ALIAS_ID,
            sessionId: sessionId || `chat-${Date.now()}`,
            prompt: message,
          })
        );

        const responseText = response.completion
          ?.map(chunk => chunk.text)
          .join('') || '';

        return {
          statusCode: 200,
          body: JSON.stringify({ response: responseText }),
        };
      }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error: any) {
    console.error('AI Agent error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export default handler;

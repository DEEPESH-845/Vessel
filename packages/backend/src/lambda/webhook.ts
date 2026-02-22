/**
 * Webhook Handler
 * Processes webhooks from payment networks and blockchain events
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { ethers } from 'ethers';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || 'vessel-payments';
const MERCHANTS_TABLE = process.env.MERCHANTS_TABLE || 'vessel-merchants';
const ALERTS_TOPIC_ARN = process.env.ALERTS_TOPIC_ARN || '';

// Initialize SNS for alerts
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

interface WebhookPayload {
  event: string;
  paymentId: string;
  txHash?: string;
  status?: string;
  amount?: string;
  from?: string;
  to?: string;
  timestamp: number;
  signature?: string;
}

/**
 * Verify webhook signature
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = ethers.keccak256(ethers.toUtf8Bytes(payload + secret));
  return expectedSignature === signature;
}

/**
 * Process payment confirmed webhook
 */
async function processPaymentConfirmed(paymentId: string, txHash: string) {
  const command = new UpdateCommand({
    TableName: PAYMENTS_TABLE,
    Key: { paymentId },
    UpdateExpression: 'SET #status = :status, txHash = :txHash, completedAt = :completedAt, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'completed',
      ':txHash': txHash,
      ':completedAt': new Date().toISOString(),
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);

  // Send webhook to merchant
  if (result.Attributes) {
    await notifyMerchantWebhook(paymentId, 'payment.completed', result.Attributes);
  }

  return result.Attributes;
}

/**
 * Process payment failed webhook
 */
async function processPaymentFailed(paymentId: string, reason: string) {
  const command = new UpdateCommand({
    TableName: PAYMENTS_TABLE,
    Key: { paymentId },
    UpdateExpression: 'SET #status = :status, metadata = :metadata, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'failed',
      ':metadata': JSON.stringify({ failureReason: reason }),
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);

  // Send alert for failed payment
  if (ALERTS_TOPIC_ARN) {
    await snsClient.send(new PublishCommand({
      TopicArn: ALERTS_TOPIC_ARN,
      Subject: `Payment Failed: ${paymentId}`,
      Message: JSON.stringify({ paymentId, reason, timestamp: Date.now() }),
    }));
  }

  return result.Attributes;
}

/**
 * Process blockchain event (on-chain confirmation)
 */
async function processBlockchainEvent(eventType: string, data: Record<string, string>) {
  const { paymentId, txHash, blockNumber } = data;

  if (!paymentId) {
    throw new Error('Missing paymentId in blockchain event');
  }

  switch (eventType) {
    case 'TransactionConfirmed':
      return processPaymentConfirmed(paymentId, txHash);
    case 'TransactionFailed':
      return processPaymentFailed(paymentId, data.reason || 'Unknown error');
    default:
      console.log(`Unknown blockchain event type: ${eventType}`);
  }
}

/**
 * Notify merchant via webhook
 */
async function notifyMerchantWebhook(
  paymentId: string,
  eventType: string,
  paymentData: Record<string, unknown>
) {
  // Get merchant webhook URL
  const merchantId = paymentData.merchantId as string;
  const getMerchantCmd = new GetCommand({
    TableName: MERCHANTS_TABLE,
    Key: { merchantId },
  });

  const merchant = await docClient.send(getMerchantCmd);
  const webhookUrl = merchant.Item?.webhookUrl;

  if (!webhookUrl) {
    console.log(`No webhook URL for merchant ${merchantId}`);
    return;
  }

  // Send webhook (in production, implement retry logic)
  const payload = {
    event: eventType,
    paymentId,
    data: paymentData,
    timestamp: Date.now(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vessel-Signature': generateWebhookSignature(JSON.stringify(payload)),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send webhook:', error);
  }
}

/**
 * Generate webhook signature for verification
 */
function generateWebhookSignature(payload: string): string {
  const secret = process.env.WEBHOOK_SECRET || 'default-secret';
  return ethers.keccak256(ethers.toUtf8Bytes(payload + secret));
}

export const handler = async (event: any) => {
  try {
    console.log('Webhook received:', JSON.stringify(event));

    // Handle different webhook sources
    const source = event.source;

    if (source === 'aws:sns') {
      // Handle SNS event
      const message = JSON.parse(event.Message);
      return await handleWebhookEvent(message);
    } else if (event.body) {
      // Handle direct HTTP POST
      const body = JSON.parse(event.body);
      return await handleWebhookEvent(body);
    } else if (event.paymentId) {
      // Handle direct invocation
      return await handleWebhookEvent(event);
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid webhook payload' }),
    };
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * Main webhook event handler
 */
async function handleWebhookEvent(payload: WebhookPayload) {
  const { event, paymentId, txHash, status } = payload;

  // Verify signature if provided
  if (payload.signature && !verifySignature(JSON.stringify(payload), payload.signature, process.env.WEBHOOK_SECRET || '')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' }),
    };
  }

  let result;

  switch (event) {
    case 'payment.confirmed':
    case 'TransactionConfirmed':
      result = await processPaymentConfirmed(paymentId, txHash || '');
      break;

    case 'payment.failed':
    case 'TransactionFailed':
      result = await processPaymentFailed(paymentId, payload.status || 'Unknown error');
      break;

    case 'blockchain.event':
      result = await processBlockchainEvent(payload.status || '', payload as unknown as Record<string, string>);
      break;

    default:
      console.log(`Unknown webhook event: ${event}`);
      result = { processed: false, reason: 'Unknown event type' };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, result }),
  };
}

export default handler;

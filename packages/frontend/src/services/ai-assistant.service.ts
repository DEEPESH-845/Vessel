/**
 * AI Assistant Service
 * Handles intent parsing, suggestions, and transaction explanations
 * Requirements: FR-13.1, FR-13.2, FR-13.3, FR-13.4, FR-13.5
 */

import { TransactionIntent, ActionSuggestion } from '@/types/ai.types';

/**
 * Parsed Intent Result
 */
export interface ParsedIntent {
  intent: TransactionIntent | null;
  confidence: number;
  missingParams: string[];
  clarifyingQuestion?: string;
}

/**
 * AI Assistant Service
 * Provides AI-powered transaction assistance
 */
export class AIAssistantService {
  private static instance: AIAssistantService;
  
  private apiKey: string | null = null;
  private apiEndpoint = 'https://api.openai.com/v1/chat/completions';

  private constructor() {}

  static getInstance(): AIAssistantService {
    if (!AIAssistantService.instance) {
      AIAssistantService.instance = new AIAssistantService();
    }
    return AIAssistantService.instance;
  }

  /**
   * Configure API key
   */
  configure(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Parse user intent from natural language
   */
  async parseIntent(input: string): Promise<ParsedIntent> {
    // Sanitize input
    const sanitizedInput = this.sanitizeInput(input);

    // Check for common patterns first (no API call needed)
    const patternResult = this.matchCommonPatterns(sanitizedInput);
    if (patternResult) {
      return patternResult;
    }

    // If no API key, return pattern-based result
    if (!this.apiKey) {
      return {
        intent: null,
        confidence: 0,
        missingParams: ['all'],
        clarifyingQuestion: 'AI features require API configuration. Please set up your API key.',
      };
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: this.getIntentParsingPrompt(),
            },
            {
              role: 'user',
              content: sanitizedInput,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse intent');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      return this.parseIntentResponse(content, sanitizedInput);
    } catch (error) {
      console.error('Intent parsing error:', error);
      return {
        intent: null,
        confidence: 0,
        missingParams: ['all'],
        clarifyingQuestion: 'Could not understand your request. Please try again.',
      };
    }
  }

  /**
   * Match common patterns without AI
   */
  private matchCommonPatterns(input: string): ParsedIntent | null {
    const lowerInput = input.toLowerCase();

    // Send pattern: "send X ETH to [address/name]"
    const sendMatch = lowerInput.match(/send\s+([\d.]+)\s*(eth|matic|usdc|usdt)?\s+to\s+(.+)/i);
    if (sendMatch) {
      const amount = sendMatch[1];
      const token = sendMatch[2]?.toUpperCase() || 'ETH';
      const recipient = sendMatch[3].trim();

      return {
        intent: {
          type: 'send',
          params: {
            amount,
            token,
            recipient,
          },
        },
        confidence: 0.9,
        missingParams: this.validateParams('send', { amount, token, recipient }),
      };
    }

    // Swap pattern: "swap X ETH for USDC"
    const swapMatch = lowerInput.match(/swap\s+([\d.]+)\s+(\w+)\s+for\s+(\w+)/i);
    if (swapMatch) {
      const amount = swapMatch[1];
      const fromToken = swapMatch[2].toUpperCase();
      const toToken = swapMatch[3].toUpperCase();

      return {
        intent: {
          type: 'swap',
          params: {
            amount,
            fromToken,
            toToken,
          },
        },
        confidence: 0.9,
        missingParams: this.validateParams('swap', { amount, fromToken, toToken }),
      };
    }

    // Bridge pattern: "bridge X ETH to [chain]"
    const bridgeMatch = lowerInput.match(/bridge\s+([\d.]+)\s+(\w+)\s+to\s+(\w+)/i);
    if (bridgeMatch) {
      const amount = bridgeMatch[1];
      const token = bridgeMatch[2].toUpperCase();
      const toChain = bridgeMatch[3];

      return {
        intent: {
          type: 'bridge',
          params: {
            amount,
            token,
            toChain,
          },
        },
        confidence: 0.85,
        missingParams: this.validateParams('bridge', { amount, token, toChain }),
      };
    }

    return null;
  }

  /**
   * Validate required params for intent type
   */
  private validateParams(type: string, params: Record<string, string>): string[] {
    const missing: string[] = [];

    switch (type) {
      case 'send':
        if (!params.amount) missing.push('amount');
        if (!params.recipient) missing.push('recipient');
        if (!params.token) missing.push('token');
        break;
      case 'swap':
        if (!params.amount) missing.push('amount');
        if (!params.fromToken) missing.push('fromToken');
        if (!params.toToken) missing.push('toToken');
        break;
      case 'bridge':
        if (!params.amount) missing.push('amount');
        if (!params.toChain) missing.push('toChain');
        break;
    }

    return missing;
  }

  /**
   * Get system prompt for intent parsing
   */
  private getIntentParsingPrompt(): string {
    return `You are a blockchain transaction intent parser. Extract structured intent from user messages.

Respond in JSON format:
{
  "type": "send" | "swap" | "bridge" | "stake" | "unknown",
  "params": {
    "amount": string,
    "token": string,
    "recipient": string,
    "fromToken": string,
    "toToken": string,
    "toChain": string,
    "contract": string
  },
  "confidence": number (0-1),
  "missingParams": string[]
}

Only include relevant params for the intent type. Be strict with validation.`;
  }

  /**
   * Parse AI response into ParsedIntent
   */
  private parseIntentResponse(content: string, originalInput: string): ParsedIntent {
    try {
      const parsed = JSON.parse(content);
      
      const missingParams = parsed.missingParams || [];
      let clarifyingQuestion: string | undefined;

      if (missingParams.length > 0) {
        clarifyingQuestion = this.generateClarifyingQuestion(parsed.type, missingParams);
      }

      return {
        intent: {
          type: parsed.type,
          params: parsed.params || {},
        },
        confidence: parsed.confidence || 0.5,
        missingParams,
        clarifyingQuestion,
      };
    } catch {
      return {
        intent: null,
        confidence: 0,
        missingParams: ['all'],
        clarifyingQuestion: 'Could not parse your request. Please be more specific.',
      };
    }
  }

  /**
   * Generate clarifying question for missing params
   */
  private generateClarifyingQuestion(type: string, missingParams: string[]): string {
    const questions: Record<string, Record<string, string>> = {
      send: {
        amount: 'How much would you like to send?',
        recipient: 'Who would you like to send to? (address or ENS name)',
        token: 'Which token would you like to send?',
      },
      swap: {
        amount: 'How much would you like to swap?',
        fromToken: 'Which token are you swapping from?',
        toToken: 'Which token would you like to receive?',
      },
      bridge: {
        amount: 'How much would you like to bridge?',
        toChain: 'Which chain would you like to bridge to?',
        token: 'Which token would you like to bridge?',
      },
    };

    const typeQuestions = questions[type] || {};
    const firstMissing = missingParams[0];
    
    return typeQuestions[firstMissing] || 'Please provide more details.';
  }

  /**
   * Sanitize user input to prevent prompt injection
   */
  private sanitizeInput(input: string): string {
    // Remove potential prompt injection patterns
    return input
      .replace(/system:/gi, '')
      .replace(/assistant:/gi, '')
      .replace(/user:/gi, '')
      .replace(/\n\n/g, ' ')
      .trim()
      .slice(0, 500); // Limit length
  }

  /**
   * Generate proactive suggestions
   */
  async generateSuggestions(context: {
    walletAddress: string;
    balances: { token: string; balance: string; value: number }[];
    recentTransactions: { type: string; token: string }[];
  }): Promise<ActionSuggestion[]> {
    const suggestions: ActionSuggestion[] = [];

    // Check for high-value tokens that could be staked
    const stakeableTokens = context.balances.filter(
      (b) => ['ETH', 'MATIC', 'USDC', 'USDT'].includes(b.token) && b.value > 100
    );

    for (const token of stakeableTokens.slice(0, 2)) {
      suggestions.push({
        type: 'stake',
        title: `Stake ${token.token}`,
        description: `Earn yield on your ${token.token} balance`,
        action: {
          type: 'stake',
          params: { token: token.token, amount: token.balance },
        },
        priority: 'medium',
      });
    }

    // Check for small balances that could be consolidated
    const smallBalances = context.balances.filter((b) => b.value > 10 && b.value < 100);
    if (smallBalances.length > 2) {
      suggestions.push({
        type: 'consolidate',
        title: 'Consolidate Tokens',
        description: 'Swap small balances to your preferred token',
        action: {
          type: 'swap',
          params: {},
        },
        priority: 'low',
      });
    }

    return suggestions;
  }

  /**
   * Explain a transaction in human-readable terms
   */
  async explainTransaction(tx: {
    to: string;
    value: string;
    data: string;
    chainId: number;
  }): Promise<string> {
    // Simple explanation for common patterns
    if (tx.data === '0x' || !tx.data) {
      const value = parseFloat(tx.value) / 1e18;
      return `This transaction sends ${value.toFixed(4)} native tokens to ${tx.to.slice(0, 8)}...${tx.to.slice(-6)}`;
    }

    // Try to decode common function calls
    const selector = tx.data.slice(0, 10).toLowerCase();
    
    const knownSelectors: Record<string, string> = {
      '0xa9059cbb': 'Transfer tokens to another address',
      '0x23b872dd': 'Transfer tokens from one address to another',
      '0x095ea7b3': 'Approve a spender to use your tokens',
      '0x18cbafe5': 'Swap tokens on Uniswap V2',
      '0x7ff36ab5': 'Swap exact ETH for tokens',
      '0x04e45aaf': 'Swap tokens on Uniswap V3',
    };

    const explanation = knownSelectors[selector];
    if (explanation) {
      return explanation;
    }

    return 'This is a contract interaction. Please verify the contract address and function before confirming.';
  }
}

// Export singleton instance
export const aiAssistantService = AIAssistantService.getInstance();
/**
 * TypeScript interfaces for the Crypto Wallet Dashboard
 * 
 * These interfaces define the data structures used across wallet components
 * to ensure type safety and maintainability.
 */

/**
 * Represents the wallet balance information
 * 
 * @property totalUSD - Total balance in USD
 * @property lastUpdated - Optional timestamp of last balance update
 */
export interface WalletBalance {
  totalUSD: number;
  lastUpdated?: Date;
}

/**
 * Represents a single transaction in the wallet
 * 
 * @property id - Unique identifier for the transaction
 * @property merchant - Recipient/merchant name
 * @property amount - Transaction amount in USD
 * @property timestamp - Human-readable time string
 * @property status - Current status of the transaction
 */
export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

/**
 * Represents the complete dashboard data structure
 * 
 * @property balance - Total USD balance
 * @property transactions - Array of recent transactions
 */
export interface DashboardData {
  balance: number;
  transactions: Transaction[];
}

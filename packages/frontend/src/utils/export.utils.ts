/**
 * Export Utilities
 * 
 * Utilities for exporting transaction data in various formats (CSV, JSON, PDF)
 * Requirements: FR-1.5
 */

import { jsPDF } from 'jspdf';
import { ActivityTransaction } from '@/types/transaction.types';

/**
 * Format date for export
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format transaction type for display
 */
function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Export transactions to CSV format
 */
export function exportToCSV(transactions: ActivityTransaction[]): string {
  const headers = [
    'Date',
    'Type',
    'Chain',
    'From',
    'To',
    'Amount',
    'Token',
    'Status',
    'Transaction Hash',
    'Block Number',
    'Gas Used',
    'Gas Cost (USD)',
  ];

  const rows = transactions.map((tx) => [
    formatDate(tx.timestamp),
    formatType(tx.type),
    tx.chain,
    tx.from,
    tx.to,
    tx.value,
    tx.token || 'Native',
    tx.status,
    tx.hash,
    tx.blockNumber?.toString() || 'Pending',
    tx.gasUsed || 'N/A',
    tx.gasCostUSD || 'N/A',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Export transactions to JSON format
 */
export function exportToJSON(transactions: ActivityTransaction[]): string {
  const exportData = transactions.map((tx) => ({
    date: formatDate(tx.timestamp),
    type: tx.type,
    chain: tx.chain,
    chainId: tx.chainId,
    from: tx.from,
    to: tx.to,
    amount: tx.value,
    token: tx.token || 'Native',
    status: tx.status,
    transactionHash: tx.hash,
    blockNumber: tx.blockNumber || null,
    gasUsed: tx.gasUsed || null,
    gasCostUSD: tx.gasCostUSD || null,
    metadata: tx.metadata,
  }));

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export transactions to PDF format
 */
export function exportToPDF(transactions: ActivityTransaction[]): Blob {
  const doc = new jsPDF();
  
  // Set up document styling
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const lineHeight = 7;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(204, 255, 0); // Neon Green
  doc.text('Transaction History', margin, yPosition);
  yPosition += lineHeight * 2;

  // Export date
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170); // Gray
  doc.text(`Exported: ${formatDate(new Date())}`, margin, yPosition);
  yPosition += lineHeight * 1.5;

  // Summary
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); // White
  doc.text(`Total Transactions: ${transactions.length}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Transaction details
  doc.setFontSize(9);
  
  transactions.forEach((tx, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - margin - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Transaction header
    doc.setTextColor(204, 255, 0); // Neon Green
    doc.setFontSize(10);
    doc.text(`Transaction ${index + 1}`, margin, yPosition);
    yPosition += lineHeight;

    // Transaction details
    doc.setTextColor(255, 255, 255); // White
    doc.setFontSize(8);
    
    const details = [
      `Date: ${formatDate(tx.timestamp)}`,
      `Type: ${formatType(tx.type)}`,
      `Chain: ${tx.chain}`,
      `From: ${tx.from.slice(0, 10)}...${tx.from.slice(-8)}`,
      `To: ${tx.to.slice(0, 10)}...${tx.to.slice(-8)}`,
      `Amount: ${tx.value} ${tx.token || 'Native'}`,
      `Status: ${tx.status}`,
      `Hash: ${tx.hash.slice(0, 20)}...${tx.hash.slice(-10)}`,
    ];

    if (tx.blockNumber) {
      details.push(`Block: ${tx.blockNumber}`);
    }
    if (tx.gasUsed) {
      details.push(`Gas Used: ${tx.gasUsed}`);
    }
    if (tx.gasCostUSD) {
      details.push(`Gas Cost: $${tx.gasCostUSD}`);
    }

    details.forEach((detail) => {
      doc.text(detail, margin + 5, yPosition);
      yPosition += lineHeight * 0.8;
    });

    yPosition += lineHeight * 0.5;

    // Separator line
    doc.setDrawColor(39, 39, 42); // Border color
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight;
  });

  return doc.output('blob');
}

/**
 * Download file to user's device
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = typeof content === 'string' 
    ? new Blob([content], { type: mimeType })
    : content;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(format: 'csv' | 'json' | 'pdf'): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `transactions_${timestamp}.${format}`;
}

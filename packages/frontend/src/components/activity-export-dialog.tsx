/**
 * ActivityExportDialog Component
 * 
 * Dialog for exporting transaction history in various formats (CSV, JSON, PDF)
 * with date range selection and progress indication.
 * 
 * Requirements: FR-1.5
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ActivityTransaction } from '@/types/transaction.types';
import { exportToCSV, exportToJSON, exportToPDF, downloadFile, generateFilename } from '@/utils/export.utils';
import { FileDown, X, FileText, FileJson, FileType } from 'lucide-react';

export interface ActivityExportDialogProps {
  transactions: ActivityTransaction[];
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'pdf';

export default function ActivityExportDialog({
  transactions,
  isOpen,
  onClose,
}: ActivityExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (!startDate && !endDate) {
      return transactions;
    }

    return transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);
      const start = startDate ? new Date(startDate + 'T00:00:00Z') : null;
      const end = endDate ? new Date(endDate + 'T23:59:59Z') : null;

      if (start && txDate < start) return false;
      if (end && txDate > end) return false;
      return true;
    });
  }, [transactions, startDate, endDate]);

  // Handle export
  const handleExport = async () => {
    if (filteredTransactions.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      // Simulate processing time for large exports
      await new Promise((resolve) => setTimeout(resolve, 500));

      const filename = generateFilename(selectedFormat);

      switch (selectedFormat) {
        case 'csv': {
          const csvContent = exportToCSV(filteredTransactions);
          downloadFile(csvContent, filename, 'text/csv');
          break;
        }
        case 'json': {
          const jsonContent = exportToJSON(filteredTransactions);
          downloadFile(jsonContent, filename, 'application/json');
          break;
        }
        case 'pdf': {
          const pdfBlob = exportToPDF(filteredTransactions);
          downloadFile(pdfBlob, filename, 'application/pdf');
          break;
        }
      }

      // Close dialog after successful export
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4"
        style={{
          background: '#18181B',
          border: '1px solid #27272A',
          borderRadius: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #27272A' }}
        >
          <div className="flex items-center gap-3">
            <FileDown size={24} style={{ color: '#CCFF00' }} />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Export Transactions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X size={24} style={{ color: '#71717A' }} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label
              className="block mb-3"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: '#A1A1AA',
              }}
            >
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'csv' as ExportFormat, label: 'CSV', icon: FileText },
                { value: 'json' as ExportFormat, label: 'JSON', icon: FileJson },
                { value: 'pdf' as ExportFormat, label: 'PDF', icon: FileType },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedFormat(value)}
                  className="flex flex-col items-center gap-2 py-4 px-3 transition-all"
                  style={{
                    background: selectedFormat === value ? '#27272A' : '#18181B',
                    border: `1px solid ${selectedFormat === value ? '#CCFF00' : '#27272A'}`,
                    borderRadius: '12px',
                  }}
                >
                  <Icon
                    size={24}
                    style={{ color: selectedFormat === value ? '#CCFF00' : '#71717A' }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: selectedFormat === value ? '#FFFFFF' : '#A1A1AA',
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label
              className="block mb-3"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: '#A1A1AA',
              }}
            >
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: '#71717A',
                  }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2"
                  style={{
                    background: '#0A0A0A',
                    border: '1px solid #27272A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: '#71717A',
                  }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2"
                  style={{
                    background: '#0A0A0A',
                    border: '1px solid #27272A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Transaction Count */}
          <div
            className="px-4 py-3"
            style={{
              background: '#0A0A0A',
              border: '1px solid #27272A',
              borderRadius: '12px',
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: '#A1A1AA',
              }}
            >
              Transactions to export:{' '}
              <span style={{ color: '#CCFF00', fontWeight: 600 }}>
                {filteredTransactions.length}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid #27272A' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 transition-opacity hover:opacity-70"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#A1A1AA',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredTransactions.length === 0}
            className="px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isExporting ? '#27272A' : '#CCFF00',
              color: '#0A0A0A',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

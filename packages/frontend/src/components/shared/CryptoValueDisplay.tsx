'use client';

/**
 * CryptoValueDisplay - Large numeric price display
 * Font: JetBrains Mono bold, 28-34px
 */

interface CryptoValueDisplayProps {
  value: string | number;
  prefix?: '~' | '|' | '';
  usdValue?: string;
  symbol?: string;
  className?: string;
}

export function CryptoValueDisplay({
  value,
  prefix = '',
  usdValue,
  symbol,
  className = '',
}: CryptoValueDisplayProps) {
  const displayValue = typeof value === 'number' ? value.toFixed(8) : value;
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="text-[#6b7fa3] text-xl font-mono">{prefix}</span>
        )}
        <span className="font-mono font-bold text-white text-[28px]">
          {displayValue}
        </span>
        {symbol && (
          <span className="text-[#6b7fa3] text-sm font-mono ml-1">{symbol}</span>
        )}
      </div>
      {usdValue && (
        <span className="text-[#6b7fa3] text-sm font-mono mt-1">{usdValue}</span>
      )}
    </div>
  );
}
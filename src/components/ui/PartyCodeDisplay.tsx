// Reusable component for displaying party code with copy functionality

import { useState } from 'react';

interface PartyCodeDisplayProps {
  partyCode: string;
  className?: string;
}

export function PartyCodeDisplay({ partyCode, className = '' }: PartyCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(partyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy party code:', err);
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-blue-200 mb-2">Party Code</p>
      <button
        onClick={handleCopy}
        className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-6 py-3 font-mono text-2xl font-bold text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
      >
        {partyCode}
      </button>
      {copied && (
        <p className="text-green-300 text-sm mt-2">Copied to clipboard!</p>
      )}
    </div>
  );
}

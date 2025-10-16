import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultMinimized?: boolean;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultMinimized = true,
  className = ''
}: CollapsibleSectionProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);

  return (
    <div className={`${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-all duration-200"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="text-white">
          {isMinimized ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </div>
      </div>
      {!isMinimized && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

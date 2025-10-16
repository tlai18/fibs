import React from 'react';

interface PhaseHeaderProps {
  roundNumber: number;
  phaseName: string;
  phaseColor?: 'blue' | 'green' | 'purple' | 'red' | 'orange';
}

export function PhaseHeader({ 
  roundNumber, 
  phaseName, 
  phaseColor = 'blue' 
}: PhaseHeaderProps) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-200',
    green: 'bg-green-500/20 text-green-200',
    purple: 'bg-purple-500/20 text-purple-200',
    red: 'bg-red-500/20 text-red-200',
    orange: 'bg-orange-500/20 text-orange-200'
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">Round {roundNumber}</h1>
      <div className={`${colorClasses[phaseColor]} rounded-lg px-4 py-2 inline-block`}>
        <span className="text-sm">{phaseName}</span>
      </div>
    </div>
  );
}

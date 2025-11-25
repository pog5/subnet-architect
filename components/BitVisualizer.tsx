
import React from 'react';
import { BitType } from '../types';
import { HelpTrigger } from './HelpSystem';
import { useLanguage } from '../contexts/LanguageContext';

interface BitVisualizerProps {
  originalCidr: number;
  borrowedBits: number;
}

export const BitVisualizer: React.FC<BitVisualizerProps> = ({ originalCidr, borrowedBits }) => {
  const { t } = useLanguage();
  const totalBits = 32;
  const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];

  // Helper to determine bit type
  const getBitType = (absoluteIndex: number): BitType => {
    if (absoluteIndex < originalCidr) return BitType.NETWORK;
    if (absoluteIndex < originalCidr + borrowedBits) return BitType.SUBNET;
    return BitType.HOST;
  };

  const getColor = (type: BitType) => {
    switch (type) {
      case BitType.NETWORK: return 'bg-green-300 border-green-400 text-green-900';
      case BitType.SUBNET: return 'bg-sky-300 border-sky-400 text-sky-900';
      case BitType.HOST: return 'bg-red-300 border-red-400 text-red-900';
    }
  };

  const getLabel = (type: BitType) => {
    switch (type) {
        case BitType.NETWORK: return 'N';
        case BitType.SUBNET: return 'S';
        case BitType.HOST: return 'H';
    }
  }

  return (
    <HelpTrigger topic="VIS_BITS" data={{ count: Math.pow(2, borrowedBits) }} className="block">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('vis.title')}</h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono border border-slate-200">{t('vis.total_bits')}</span>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-300 rounded border border-green-400"></div>
            <span>{t('vis.legend.net')}</span>
            </div>
            <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-sky-300 rounded border border-sky-400"></div>
            <span>{t('vis.legend.sub')}</span>
            </div>
            <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-300 rounded border border-red-400"></div>
            <span>{t('vis.legend.host')}</span>
            </div>
        </div>

        <div className="flex flex-col gap-2">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-1 mb-2">
                {bitValues.map((val) => (
                    <div key={val} className="flex flex-col items-center justify-end">
                         <div className="text-[10px] text-slate-400 font-mono leading-none mb-0.5">2<sup>{Math.log2(val)}</sup></div>
                         <div className="text-[10px] text-center text-slate-600 font-bold font-mono leading-none">{val}</div>
                    </div>
                ))}
            </div>

            {/* 4 Octets */}
            {[0, 1, 2, 3].map((octetIndex) => {
                return (
                    <div key={octetIndex} className="grid grid-cols-8 gap-1 items-center">
                        {bitValues.map((val, bitIndex) => {
                        const absoluteIndex = octetIndex * 8 + bitIndex;
                        const type = getBitType(absoluteIndex);
                        
                        // Don't render bits beyond 32 (shouldn't happen with fixed loops but good practice)
                        if (absoluteIndex >= totalBits) return null;

                        return (
                            <div
                            key={bitIndex}
                            className={`
                                h-8 flex items-center justify-center rounded text-xs font-bold border
                                transition-colors duration-300
                                ${getColor(type)}
                            `}
                            >
                            {getLabel(type)}
                            </div>
                        );
                        })}
                    </div>
                );
            })}
        </div>
        </div>
    </HelpTrigger>
  );
};

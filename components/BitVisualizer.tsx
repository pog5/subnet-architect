import React from 'react';
import { BitType, IpVersion } from '../types';
import { HelpTrigger } from './HelpSystem';
import { useLanguage } from '../contexts/LanguageContext';

interface BitVisualizerProps {
  originalCidr: number;
  borrowedBits: number;
  version: IpVersion;
}

export const BitVisualizer: React.FC<BitVisualizerProps> = ({ originalCidr, borrowedBits, version }) => {
  const { t } = useLanguage();
  
  const isV4 = version === 'v4';
  const totalBits = isV4 ? 32 : 128;
  const bitsPerSegment = isV4 ? 8 : 16;
  const segments = isV4 ? 4 : 8;
  // Fix: grid-cols-16 does not exist in default Tailwind. Using arbitrary value.
  const gridCols = isV4 ? 'grid-cols-8' : 'grid-cols-[repeat(16,minmax(0,1fr))]';
  
  // Headers for bit values
  const bitValues = isV4 
    ? [128, 64, 32, 16, 8, 4, 2, 1]
    : Array.from({length: 16}, (_, i) => Math.pow(2, 15 - i)); // 32768...1

  // Helper to determine bit type
  const getBitType = (absoluteIndex: number): BitType => {
    if (absoluteIndex < originalCidr) return BitType.NETWORK;
    if (absoluteIndex < originalCidr + borrowedBits) return BitType.SUBNET;
    return BitType.HOST;
  };

  const getColor = (type: BitType) => {
    switch (type) {
      case BitType.NETWORK: return 'bg-green-300 border-green-400 text-green-900 dark:bg-green-900/60 dark:border-green-800 dark:text-green-200';
      case BitType.SUBNET: return 'bg-sky-300 border-sky-400 text-sky-900 dark:bg-sky-900/60 dark:border-sky-800 dark:text-sky-200';
      case BitType.HOST: return 'bg-red-300 border-red-400 text-red-900 dark:bg-red-900/60 dark:border-red-800 dark:text-red-200';
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
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('vis.title')}</h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">{t('vis.total_bits', { bits: totalBits })}</span>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-300 dark:bg-green-900/60 rounded border border-green-400 dark:border-green-800"></div>
            <span className="text-slate-600 dark:text-slate-400">{t('vis.legend.net')}</span>
            </div>
            <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-sky-300 dark:bg-sky-900/60 rounded border border-sky-400 dark:border-sky-800"></div>
            <span className="text-slate-600 dark:text-slate-400">{t('vis.legend.sub')}</span>
            </div>
            <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-300 dark:bg-red-900/60 rounded border border-red-400 dark:border-red-800"></div>
            <span className="text-slate-600 dark:text-slate-400">{t('vis.legend.host')}</span>
            </div>
        </div>

        <div className="flex flex-col gap-2 overflow-x-auto pb-2">
            {/* Header Row */}
            <div className={`grid ${gridCols} gap-1 mb-2 min-w-max`}>
                {bitValues.map((val) => (
                    <div key={val} className="flex flex-col items-center justify-end w-5 sm:w-8">
                         <div className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-none mb-0.5">2<sup>{Math.log2(val)}</sup></div>
                         {/* Show value only if small enough or if plenty space? Hiding specific numbers for IPv6 might be cleaner, but user asked for logic transform. */}
                         <div className="text-[8px] sm:text-[10px] text-center text-slate-600 dark:text-slate-400 font-bold font-mono leading-none hidden sm:block">{val}</div>
                    </div>
                ))}
            </div>

            {/* Segments */}
            {Array.from({length: segments}).map((_, segmentIndex) => {
                return (
                    <div key={segmentIndex} className={`grid ${gridCols} gap-1 items-center min-w-max`}>
                        {Array.from({length: bitsPerSegment}).map((_, bitIndex) => {
                            const absoluteIndex = segmentIndex * bitsPerSegment + bitIndex;
                            const type = getBitType(absoluteIndex);
                            
                            return (
                                <div
                                key={bitIndex}
                                className={`
                                    w-5 sm:w-8 h-8 flex items-center justify-center rounded text-[10px] sm:text-xs font-bold border
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
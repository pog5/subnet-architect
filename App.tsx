
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { calculateSubnets, intToIp, ipToInt, isValidIp, cidrToMask } from './utils/ipHelpers';
import { SubnetTable } from './components/SubnetTable';
import { BitVisualizer } from './components/BitVisualizer';
import { HelpProvider, HelpTrigger } from './components/HelpSystem';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  // State - Inputs stored as strings to allow flexible editing (empty string, etc.)
  const [ip, setIp] = useState<string>('10.0.0.0');
  const [mask, setMask] = useState<string>('8');
  const [subnetCount, setSubnetCount] = useState<string>('4');

  // Refs for inputs to handle non-passive event listeners
  const maskInputRef = useRef<HTMLInputElement>(null);
  const subnetCountInputRef = useRef<HTMLInputElement>(null);

  // Derived Safe Values for Calculation
  const safeMask = useMemo(() => {
    const val = parseInt(mask);
    if (isNaN(val)) return 0;
    return Math.min(32, Math.max(0, val));
  }, [mask]);

  const safeSubnetCount = useMemo(() => {
    const val = parseInt(subnetCount);
    if (isNaN(val)) return 1;
    return Math.max(1, val);
  }, [subnetCount]);

  // Derived State (Calculation)
  const result = useMemo(() => {
    return calculateSubnets(ip, safeMask, safeSubnetCount);
  }, [ip, safeMask, safeSubnetCount]);

  // Derived State (Supernet Details)
  const supernetDetails = useMemo(() => {
    if (!isValidIp(ip)) return null;
    
    const inputInt = ipToInt(ip);
    
    // Gateway: User requested "initial Network IP + 1"
    const gatewayInt = (inputInt + 1) >>> 0;
    const gateway = intToIp(gatewayInt);
    
    // Supernet Broadcast
    const shift = 32 - safeMask;
    let broadcastInt;
    if (safeMask === 0) broadcastInt = 0xffffffff;
    else if (safeMask === 32) broadcastInt = inputInt;
    else {
        // Calculate broadcast based on standard network boundary for the bits N
        // or relative to input if treating input as exact start?
        // Standard subnet calculators mask the input to find the block start.
        // However, this app treats the input IP as the specific start of the block per user request.
        // But for broadcast calculation of the *Supernet*, standard masking usually applies to find the top of the range.
        // Let's assume the user inputs a valid network address.
        const networkInt = (inputInt >>> shift) << shift; 
        const wildcardMask = Math.pow(2, shift) - 1;
        broadcastInt = (networkInt | wildcardMask) >>> 0;
        
        // If the user's input IP is NOT aligned (e.g. 10.0.0.1/8), 
        // usually we'd align it. But if we want to be strictly consistent with "Input is start",
        // the broadcast would be inputInt | wildcardMask IF inputInt is aligned.
        // If inputInt is 10.0.0.1, and mask is /8. Range is 10.0.0.0 - 10.255.255.255.
        // Let's stick to standard broadcast calculation which is robust.
    }

    const broadcast = intToIp(broadcastInt);
    const oldMaskStr = cidrToMask(safeMask);
    const newMaskStr = cidrToMask(result.newCidr);

    return { gateway, broadcast, oldMaskStr, newMaskStr };
  }, [ip, safeMask, result.newCidr]);

  // Effect to prevent native browser scrolling when using wheel on inputs
  useEffect(() => {
    const preventDefaultWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    const maskEl = maskInputRef.current;
    const subnetEl = subnetCountInputRef.current;

    // We must use non-passive listener to be able to preventDefault
    if (maskEl) maskEl.addEventListener('wheel', preventDefaultWheel, { passive: false });
    if (subnetEl) subnetEl.addEventListener('wheel', preventDefaultWheel, { passive: false });

    return () => {
      if (maskEl) maskEl.removeEventListener('wheel', preventDefaultWheel);
      if (subnetEl) subnetEl.removeEventListener('wheel', preventDefaultWheel);
    };
  }, []);

  // Handlers
  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => setIp(e.target.value);
  
  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string or digits only
    if (val === '' || /^\d+$/.test(val)) {
        setMask(val);
    }
  };

  const handleMaskBlur = () => {
    let val = parseInt(mask);
    if (isNaN(val)) val = 0;
    // Clamp to valid CIDR range on blur
    if (val > 32) val = 32;
    if (val < 0) val = 0;
    setMask(val.toString());
  };

  const handleSubnetCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
        setSubnetCount(val);
    }
  };

  const handleSubnetCountBlur = () => {
    let val = parseInt(subnetCount);
    if (isNaN(val) || val < 1) val = 1;
    setSubnetCount(val.toString());
  };

  // Wheel Handler for numeric inputs
  const handleInputWheel = (
    e: React.WheelEvent<HTMLInputElement>,
    currentValue: string,
    setValue: (val: string) => void,
    min: number,
    max: number
  ) => {
    // Focus the element if it's not focused, to make user interaction feel natural
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.focus();
    }
    
    const delta = e.deltaY > 0 ? -1 : 1;
    let val = parseInt(currentValue);
    if (isNaN(val)) val = min;
    
    let newVal = val + delta;
    if (newVal > max) newVal = max;
    if (newVal < min) newVal = min;
    
    setValue(newVal.toString());
  };

  const getTranslatedError = (error: string) => {
    if (error === 'Invalid IP Address') return t('errors.invalid_ip');
    if (error === 'Invalid CIDR') return t('errors.invalid_cidr');
    if (error === 'Must request at least 1 subnet') return t('errors.min_subnet');
    if (error.includes('Not enough bits')) return error; // Keep dynamic technical error
    if (error.includes('Display limited')) return t('errors.limit_display');
    return error;
  };

  const maskLogicData = {
    n: safeMask,
    s: result.borrowedBits,
    h: 32 - result.newCidr
  };

  const quickSetButtons = [
    { label: 'A', value: 8, colorClass: 'rose' },
    { label: 'B', value: 16, colorClass: 'amber' },
    { label: 'C', value: 24, colorClass: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 relative">
        <div className="flex justify-end gap-2 mb-4 md:absolute md:top-0 md:right-0 md:mb-0 z-10">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <div className="text-center pt-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-2">
            {t('app.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('app.description')}
            </p>
            <p className="text-xs text-indigo-500 dark:text-indigo-300 mt-2 font-medium bg-indigo-50 dark:bg-indigo-900/30 inline-block px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
            {t('app.tip')}
            </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Section: Inputs & Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Inputs */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {t('config.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Network IP */}
              <div className="space-y-2">
                <HelpTrigger topic="INPUT_IP">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 pointer-events-none">{t('config.network_addr')}</label>
                </HelpTrigger>
                <input 
                  type="text" 
                  value={ip} 
                  onChange={handleIpChange}
                  placeholder="e.g. 192.168.1.0"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('config.network_addr_desc')}</p>
              </div>

              {/* Subnet Mask */}
              <div className="space-y-2">
                <HelpTrigger topic="INPUT_MASK">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 pointer-events-none">{t('config.subnet_mask')} (/{safeMask})</label>
                </HelpTrigger>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-lg">/</span>
                    <input 
                      ref={maskInputRef}
                      type="text"
                      inputMode="numeric"
                      value={mask} 
                      onChange={handleMaskChange}
                      onBlur={handleMaskBlur}
                      onWheel={(e) => handleInputWheel(e, mask, setMask, 0, 32)}
                      placeholder="0-32"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  {/* Quick Set Buttons */}
                  <div className="flex gap-1">
                    {quickSetButtons.map((btn) => {
                      const isActive = safeMask === btn.value;
                      // Mapping colors for active/inactive states
                      const colorStyles = {
                        rose: isActive 
                          ? 'bg-rose-500 border-rose-600 text-white' 
                          : 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20',
                        amber: isActive 
                          ? 'bg-amber-500 border-amber-600 text-white' 
                          : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
                        emerald: isActive 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                      };
                      const currentStyle = colorStyles[btn.colorClass as keyof typeof colorStyles];

                      return (
                        <button
                          key={btn.label}
                          onClick={() => setMask(btn.value.toString())}
                          className={`
                            px-2 py-2 text-xs font-bold rounded border transition-all flex items-center gap-1
                            ${currentStyle}
                          `}
                          title={`Set mask to /${btn.value} (Class ${btn.label})`}
                        >
                          <span>{btn.label}</span>
                          <span className={`${isActive ? 'text-white/70' : 'opacity-60'} font-normal`}>
                            (/{btn.value})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('config.subnet_mask_desc')}</p>
              </div>

              {/* Requested Subnets */}
              <div className="md:col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <HelpTrigger topic="INPUT_SUBNETS">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 pointer-events-none">{t('config.req_subnets')}</label>
                </HelpTrigger>
                <input 
                  ref={subnetCountInputRef}
                  type="text"
                  inputMode="numeric"
                  value={subnetCount} 
                  onChange={handleSubnetCountChange}
                  onBlur={handleSubnetCountBlur}
                  onWheel={(e) => handleInputWheel(e, subnetCount, setSubnetCount, 1, 1000000)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-slate-900 dark:text-white"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{t('config.target_subnets', { count: safeSubnetCount })}</span>
                  <span>{t('config.req_bits', { count: result.borrowedBits })}</span>
                </div>
              </div>
            </div>

            {/* Calculated Details Grid */}
            {supernetDetails && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <HelpTrigger topic="DETAILS_GATEWAY" as="div" className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">{t('config.details.gateway')}</div>
                    <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{supernetDetails.gateway}</div>
                </HelpTrigger>
                <HelpTrigger topic="DETAILS_BROADCAST" as="div" className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">{t('config.details.broadcast')}</div>
                    <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{supernetDetails.broadcast}</div>
                </HelpTrigger>
                <HelpTrigger topic="DETAILS_OLD_MASK" data={maskLogicData} as="div" className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">{t('config.details.old_mask')}</div>
                    <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{supernetDetails.oldMaskStr}</div>
                </HelpTrigger>
                <HelpTrigger topic="DETAILS_NEW_MASK" data={maskLogicData} as="div" className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">{t('config.details.new_mask')}</div>
                    <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{supernetDetails.newMaskStr}</div>
                </HelpTrigger>
              </div>
            )}

            {/* Error Message */}
            {result.error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
                 <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span>{getTranslatedError(result.error)}</span>
              </div>
            )}
          </div>

          {/* Right: Visualizer */}
          <div className="lg:col-span-5">
            <BitVisualizer 
              originalCidr={safeMask} 
              borrowedBits={result.borrowedBits} 
            />
            
            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-center transition-colors">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{t('stats.new_mask')}</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">/{result.newCidr}</div>
              </div>
              <HelpTrigger topic="ROW_HOSTS" data={{ hostBits: 32 - result.newCidr, count: result.maxHosts }}>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold pointer-events-none">{t('stats.hosts_per_subnet')}</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono pointer-events-none">
                    {result.maxHosts.toLocaleString()}
                  </div>
                </div>
              </HelpTrigger>
            </div>
          </div>
        </div>

        {/* Bottom Section: Result Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('table.title')}</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              {t('table.showing', { count: result.rows.length })}
            </span>
          </div>
          <SubnetTable rows={result.rows} />
        </section>

      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HelpProvider>
          <AppContent />
        </HelpProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

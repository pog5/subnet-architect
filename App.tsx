
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { calculateSubnets, intToIp, ipToInt, isValidIpV4, cidrToMaskV4, ipv6ToBigInt, bigIntToIPv6, isValidIpV6 } from './utils/ipHelpers';
import { SubnetTable } from './components/SubnetTable';
import { BitVisualizer } from './components/BitVisualizer';
import { HelpProvider, HelpTrigger } from './components/HelpSystem';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { IpVersion } from './types';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [ipVersion, setIpVersion] = useState<IpVersion>('v4');
  
  // State
  const [ip, setIp] = useState<string>('10.0.0.0');
  const [mask, setMask] = useState<string>('8');
  const [subnetCount, setSubnetCount] = useState<string>('4');

  const maskInputRef = useRef<HTMLInputElement>(null);
  const subnetCountInputRef = useRef<HTMLInputElement>(null);

  const maxMask = ipVersion === 'v4' ? 32 : 128;
  const isV6 = ipVersion === 'v6';

  // Reset/Adjust defaults when switching version
  const handleVersionChange = (newVersion: IpVersion) => {
      setIpVersion(newVersion);
      if (newVersion === 'v6') {
          setIp('2001:db8::');
          setMask('32');
      } else {
          setIp('10.0.0.0');
          setMask('8');
      }
  };

  // Safe Values
  const safeMask = useMemo(() => {
    const val = parseInt(mask);
    if (isNaN(val)) return 0;
    return Math.min(maxMask, Math.max(0, val));
  }, [mask, maxMask]);

  const safeSubnetCount = useMemo(() => {
    const val = parseInt(subnetCount);
    if (isNaN(val)) return 1;
    return Math.max(1, val);
  }, [subnetCount]);

  // Calc
  const result = useMemo(() => {
    return calculateSubnets(ip, safeMask, safeSubnetCount, ipVersion);
  }, [ip, safeMask, safeSubnetCount, ipVersion]);

  // Full Host Count for V6 Help
  const fullHostCountV6 = useMemo(() => {
    if (!isV6) return null;
    const hostBits = BigInt(128 - result.newCidr);
    // 2^hostBits - 2 (Standard logic, though V6 is different, sticking to calc logic)
    const count = (1n << hostBits) - 2n;
    return count.toString();
  }, [result.newCidr, isV6]);

  // Details
  const supernetDetails = useMemo(() => {
    if (ipVersion === 'v4') {
        if (!isValidIpV4(ip)) return null;
        const inputInt = ipToInt(ip);
        const gatewayInt = (inputInt + 1) >>> 0;
        const gateway = intToIp(gatewayInt);
        
        const shift = 32 - safeMask;
        // Standard broadcast logic for "Old Mask" details
        // Assuming we treat input as start:
        const broadcastInt = (inputInt + Math.pow(2, shift) - 1) >>> 0;
        const broadcast = intToIp(broadcastInt);
        const oldMaskStr = cidrToMaskV4(safeMask);
        const newMaskStr = cidrToMaskV4(result.newCidr);
        return { gateway, broadcast, oldMaskStr, newMaskStr };
    } else {
        // IPv6
        const inputBig = ipv6ToBigInt(ip);
        if (inputBig === null) return null;
        
        const gatewayBig = inputBig + 1n;
        const gateway = bigIntToIPv6(gatewayBig);
        
        const shift = 128n - BigInt(safeMask);
        const blockSize = 1n << shift;
        const endBig = inputBig + blockSize - 1n;
        const broadcast = bigIntToIPv6(endBig); // Actually "End IP"
        
        return { 
            gateway, 
            broadcast, 
            oldMaskStr: `/${safeMask}`, 
            newMaskStr: `/${result.newCidr}` 
        };
    }
  }, [ip, safeMask, result.newCidr, ipVersion]);

  // Wheel Prevention
  useEffect(() => {
    const preventDefaultWheel = (e: WheelEvent) => { e.preventDefault(); };
    const maskEl = maskInputRef.current;
    const subnetEl = subnetCountInputRef.current;
    if (maskEl) maskEl.addEventListener('wheel', preventDefaultWheel, { passive: false });
    if (subnetEl) subnetEl.addEventListener('wheel', preventDefaultWheel, { passive: false });
    return () => {
      if (maskEl) maskEl.removeEventListener('wheel', preventDefaultWheel);
      if (subnetEl) subnetEl.removeEventListener('wheel', preventDefaultWheel);
    };
  }, []);

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => setIp(e.target.value);
  
  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) setMask(val);
  };

  const handleMaskBlur = () => {
    let val = parseInt(mask);
    if (isNaN(val)) val = 0;
    if (val > maxMask) val = maxMask;
    if (val < 0) val = 0;
    setMask(val.toString());
  };

  const handleSubnetCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) setSubnetCount(val);
  };

  const handleSubnetCountBlur = () => {
    let val = parseInt(subnetCount);
    if (isNaN(val) || val < 1) val = 1;
    setSubnetCount(val.toString());
  };

  const handleInputWheel = (
    e: React.WheelEvent<HTMLInputElement>,
    currentValue: string,
    setValue: (val: string) => void,
    min: number,
    max: number
  ) => {
    if (document.activeElement !== e.currentTarget) e.currentTarget.focus();
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
    if (error === 'Invalid IPv6 Address') return t('errors.invalid_ip');
    if (error === 'Invalid CIDR') return t('errors.invalid_cidr');
    if (error === 'Must request at least 1 subnet') return t('errors.min_subnet');
    if (error.includes('Not enough bits')) return error; 
    if (error.includes('Display limited')) return t('errors.limit_display');
    return error;
  };

  const maskLogicData = {
    n: safeMask,
    s: result.borrowedBits,
    h: maxMask - result.newCidr
  };

  const quickSetButtons = ipVersion === 'v4' 
    ? [
        { label: 'A', value: 8, colorClass: 'rose' },
        { label: 'B', value: 16, colorClass: 'amber' },
        { label: 'C', value: 24, colorClass: 'emerald' },
      ]
    : [
        { label: 'Site', value: 48, colorClass: 'rose' },
        { label: 'S-Site', value: 56, colorClass: 'amber' },
        { label: 'LAN', value: 64, colorClass: 'emerald' },
      ];

  // Layout Logic
  const inputsColSpan = isV6 ? 'lg:col-span-4' : 'lg:col-span-7';
  const visualizerColSpan = isV6 ? 'lg:col-span-8' : 'lg:col-span-5';
  const inputsGridCols = isV6 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 relative flex flex-col items-center">
        {/* Fix: Added md:w-auto to prevent overlap with center elements on desktop */}
        <div className="w-full md:w-auto flex justify-end gap-2 mb-4 md:absolute md:top-0 md:right-0 md:mb-0 z-10">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        
        <div className="text-center pt-2">
            <div className="flex items-center justify-center gap-3 mb-2">
                {/* Version Switcher Dropdown as requested */}
                {/* Fix: Added z-20 to ensure it is clickable above potential overlapping layers */}
                <div className="relative group z-20">
                    <select 
                        value={ipVersion}
                        onChange={(e) => handleVersionChange(e.target.value as IpVersion)}
                        className="appearance-none bg-indigo-600 dark:bg-indigo-700 text-white font-bold py-2 pl-4 pr-8 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-xl"
                    >
                        <option value="v4">IPv4</option>
                        <option value="v6">IPv6</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                    {t('app.title')}
                </h1>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('app.description')}
            </p>
            <p className="text-xs text-indigo-500 dark:text-indigo-300 mt-2 font-medium bg-indigo-50 dark:bg-indigo-900/30 inline-block px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
            {t('app.tip')}
            </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs */}
          <div className={`${inputsColSpan} bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors`}>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {t('config.title')}
            </h2>
            
            <div className={`grid ${inputsGridCols} gap-6 mb-6`}>
              
              {/* Network IP */}
              <div className="space-y-2">
                <HelpTrigger topic="INPUT_IP">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 pointer-events-none">{t('config.network_addr')}</label>
                </HelpTrigger>
                <input 
                  type="text" 
                  value={ip} 
                  onChange={handleIpChange}
                  placeholder={ipVersion === 'v4' ? "e.g. 192.168.1.0" : "e.g. 2001:db8::"}
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
                      onWheel={(e) => handleInputWheel(e, mask, setMask, 0, maxMask)}
                      placeholder={`0-${maxMask}`}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  {/* Quick Set Buttons */}
                  <div className="flex gap-1">
                    {quickSetButtons.map((btn) => {
                      const isActive = safeMask === btn.value;
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
                          title={`Set mask to /${btn.value} (${btn.label})`}
                        >
                          <span className="hidden xl:inline">{btn.label}</span>
                          <span className={`${isActive ? 'text-white/70' : 'opacity-60'} font-normal`}>
                            (/{btn.value})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('config.subnet_mask_desc', { max: maxMask })}</p>
              </div>

              {/* Requested Subnets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 md:col-span-1 lg:col-span-full">
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
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">
                      {ipVersion === 'v4' ? t('config.details.old_mask_v4') : t('config.details.old_mask_v6')}
                    </div>
                    <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{supernetDetails.oldMaskStr}</div>
                </HelpTrigger>
                <HelpTrigger topic="DETAILS_NEW_MASK" data={maskLogicData} as="div" className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">
                      {ipVersion === 'v4' ? t('config.details.new_mask_v4') : t('config.details.new_mask_v6')}
                    </div>
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

          {/* Visualizer */}
          <div className={visualizerColSpan}>
            <BitVisualizer 
              originalCidr={safeMask} 
              borrowedBits={result.borrowedBits} 
              version={ipVersion}
            />
            
            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <HelpTrigger topic="STATS_NEW_PREFIX" data={maskLogicData}>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold pointer-events-none">{t('stats.new_mask')}</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono pointer-events-none">/{result.newCidr}</div>
                </div>
              </HelpTrigger>

              <HelpTrigger topic="ROW_HOSTS" data={{ hostBits: maxMask - result.newCidr, count: result.maxHosts, fullCount: fullHostCountV6 }}>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold pointer-events-none">{t('stats.hosts_per_subnet')}</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono pointer-events-none truncate px-1">
                    {typeof result.maxHosts === 'number' ? result.maxHosts.toLocaleString() : result.maxHosts}
                  </div>
                </div>
              </HelpTrigger>
            </div>
          </div>
        </div>

        {/* Result Table */}
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

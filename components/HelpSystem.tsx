
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// --- Help Content & Logic ---

const SubnetBitsVisual: React.FC<{ bits: string }> = ({ bits }) => {
  const { t } = useLanguage();
  const currentVal = parseInt(bits, 2);
  const prevVal = currentVal > 0 ? currentVal - 1 : 0;
  const prevBits = prevVal.toString(2).padStart(bits.length, '0');
  
  // If bits are "000" (first subnet), show simple initialization
  if (currentVal === 0) {
     return (
        <div className="flex flex-col items-center gap-4 my-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
           <div className="text-sm text-slate-500 mb-2">{t('help.first_subnet')}</div>
           <div className="flex gap-2">
              {bits.split('').map((b, i) => (
                  <div key={i} className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-300 rounded font-mono text-xl font-bold shadow-sm">
                      {b}
                  </div>
              ))}
           </div>
           <p className="text-xs text-slate-500">{t('help.start_counting')}</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col items-center gap-2 my-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 opacity-50">
        <span className="text-xs font-mono uppercase w-16 text-right">{t('help.previous')}</span>
        <div className="flex gap-1">
            {prevBits.split('').map((b, i) => (
                <div key={i} className="w-8 h-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded text-slate-500 font-mono font-bold">
                    {b}
                </div>
            ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
         <span className="w-16"></span>
         <div className="flex gap-1 justify-center w-full relative">
             <div className="absolute -top-3 text-slate-400 font-bold text-lg">+</div>
             <span className="text-sm font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 mt-1">1</span>
         </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase w-16 text-right font-bold text-slate-700">{t('help.current')}</span>
        <div className="flex gap-1">
            {bits.split('').map((b, i) => {
                const changed = b !== prevBits[i];
                return (
                    <div key={i} className={`
                        w-10 h-10 flex items-center justify-center border-2 rounded font-mono text-xl font-bold shadow-sm transition-colors
                        ${changed ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-white border-slate-400 text-slate-800'}
                    `}>
                        {b}
                    </div>
                );
            })}
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center max-w-xs">
          {t('help.binary_expl')} <br/>
          <span className="text-yellow-700">{t('help.highlight_expl')}</span>
      </p>
    </div>
  );
};

const HostRangeVisual: React.FC<{ net: string, first: string, last: string, broadcast: string }> = ({ net, first, last, broadcast }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-3 my-4">
            <div className="flex items-center gap-3 p-2 rounded bg-red-50 border border-red-100 opacity-75">
                <div className="w-2 h-full bg-red-400 rounded-full"></div>
                <div className="flex-1">
                    <div className="text-xs uppercase font-bold text-red-800">Network ID</div>
                    <div className="font-mono text-red-900">{net}</div>
                </div>
                <div className="text-xs text-red-600 italic">{t('help.reserved')} ({t('help.cannot_use')})</div>
            </div>
            
            <div className="flex flex-col gap-1 pl-4 border-l-2 border-emerald-300 ml-3">
                <div className="flex items-center gap-2">
                    <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{t('help.first_usable')}</div>
                    <div className="font-mono text-slate-700">{first}</div>
                    <div className="text-xs text-slate-400">({t('help.network_ip_math')})</div>
                </div>
                <div className="h-4 border-l border-dashed border-slate-300 ml-2"></div>
                <div className="flex items-center gap-2">
                    <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{t('help.last_usable')}</div>
                    <div className="font-mono text-slate-700">{last}</div>
                    <div className="text-xs text-slate-400">({t('help.broadcast_ip_math')})</div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded bg-amber-50 border border-amber-100 opacity-75">
                <div className="w-2 h-full bg-amber-400 rounded-full"></div>
                <div className="flex-1">
                    <div className="text-xs uppercase font-bold text-amber-800">Broadcast ID</div>
                    <div className="font-mono text-amber-900">{broadcast}</div>
                </div>
                <div className="text-xs text-amber-600 italic">{t('help.reserved')} ({t('help.talks_to_all')})</div>
            </div>
        </div>
    );
};

// Component to visualize Mask bits (N vs S vs H)
const MaskLogicVisual: React.FC<{ n: number, s: number, h: number, sActive: boolean }> = ({ n, s, h, sActive }) => {
  const { t } = useLanguage();
  const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];
  
  const getBitState = (index: number) => {
    if (index < n) return { type: 'N', val: 1 };
    if (index < n + s) return { type: 'S', val: sActive ? 1 : 0 };
    return { type: 'H', val: 0 };
  };

  const getColor = (type: string, val: number) => {
     // N is always 1 (Green)
     if (type === 'N') return 'bg-green-500 border-green-600 text-white';
     
     // S depends on state
     if (type === 'S') {
         // If val is 1 (New Mask), Green. If val is 0 (Old Mask), Red.
         // Using a slightly stronger Red for S(0) to distinguish from H(0)
         return val === 1 ? 'bg-green-500 border-green-600 text-white' : 'bg-red-400 border-red-500 text-white';
     }

     // H is always 0 (Red)
     return 'bg-red-200 border-red-300 text-red-800';
  };

  const getTooltip = (type: string) => {
    if (type === 'N') return t('help.mask_tooltip_n');
    if (type === 'S') return t('help.mask_tooltip_s');
    return t('help.mask_tooltip_h');
  };

  return (
    <div className="my-4">
      {/* Legend */}
      <div className="flex gap-4 text-xs mb-3 justify-center bg-slate-50 py-2 rounded border border-slate-100">
         <div className="flex items-center gap-1">
             <div className="w-3 h-3 bg-green-500 rounded border border-green-600"></div> 
             <span className="font-medium text-slate-600">{t('help.mask_legend_masked')}</span>
         </div>
         <div className="flex items-center gap-1">
             <div className="w-3 h-3 bg-red-400 rounded border border-red-500"></div> 
             <span className="font-medium text-slate-600">{t('help.mask_legend_unmasked')}</span>
         </div>
      </div>
      
      {/* Bit Values Header */}
      <div className="flex gap-1 justify-center mb-1 pr-10">
        {bitValues.map((val) => (
            <div key={val} className="w-8 flex flex-col items-center">
                 <div className="text-[9px] text-slate-400 leading-none">2<sup>{Math.log2(val)}</sup></div>
                 <div className="text-[9px] text-slate-500 font-mono font-bold leading-none">{val}</div>
            </div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-2">
         {[0, 1, 2, 3].map(octet => {
            let rowValue = 0;
            return (
                <div key={octet} className="flex gap-1 justify-center items-center">
                    {Array.from({length: 8}).map((_, bit) => {
                        const absIndex = octet * 8 + bit;
                        const { type, val } = getBitState(absIndex);
                        if (val === 1) rowValue += bitValues[bit];
                        
                        return (
                            <div key={bit} className={`
                                w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-sm border shadow-sm
                                ${getColor(type, val)}
                                relative group cursor-default transition-all hover:scale-110 z-0 hover:z-10
                            `}>
                                {val}
                                {/* Hover Tooltip */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                    {getTooltip(type)}
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                                </div>
                            </div>
                        )
                    })}
                    {/* Row Value */}
                    <div className="w-8 ml-2 text-xs font-mono font-bold text-slate-600 text-right">
                        {rowValue}
                    </div>
                </div>
            )
         })}
      </div>
      
      {/* Dynamic explanation */}
      <div 
        className="mt-4 text-center text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100"
        dangerouslySetInnerHTML={{ __html: t(sActive ? 'help.mask_expl_new_html' : 'help.mask_expl_old_html') }}
      />
    </div>
  );
};

const getHelpContent = (topic: string, data: any, language: string, t: any) => {
  if (language === 'bg') {
    switch (topic) {
        case 'INPUT_IP':
          return {
            title: 'Мрежов Адрес',
            content: (
              <div>
                <p><strong>Мрежовият адрес</strong> е началната точка за вашето разпределение. Той представлява идентификатора за целия блок от IP адреси, с които работите.</p>
                <p className="mt-2">Мислете за него като за името на улицата. Той определя "къде" се намира мрежата, но все още не посочва конкретна къща (хост).</p>
              </div>
            )
          };
        case 'INPUT_MASK':
          return {
            title: 'Подмрежова Маска (CIDR)',
            content: (
              <div>
                <p><strong>Подмрежовата маска</strong> (представена тук в CIDR нотация, напр. /8, /24) определя колко голяма е вашата мрежа.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>По-малко число (напр. /8) = Повече хостове, по-голяма мрежа.</li>
                  <li>По-голямо число (напр. /24) = По-малко хостове, по-малка мрежа.</li>
                </ul>
                <p className="mt-2">Тя казва на компютъра коя част от IP адреса е "Мрежа" и коя част е налична за "Хостове".</p>
              </div>
            )
          };
        case 'INPUT_SUBNETS':
          return {
            title: 'Изисквани Подмрежи',
            content: (
              <div>
                <p>Това е броят на по-малките мрежи, които искате да създадете от вашия оригинален блок.</p>
                <p className="mt-2">Калкулаторът използва формулата <code className="bg-slate-100 px-1 rounded">2^N ≥ Изисквани</code>, за да определи колко бита трябва да "заемем" от частта за хостове, за да създадем тези нови мрежови индекси.</p>
              </div>
            )
          };
        case 'VIS_BITS':
          return {
            title: 'Визуализация на Битове',
            content: (
                <div>
                    <p>Тази решетка показва 32-та бита, които съставят един IPv4 адрес. Всеки ред е "октет" (8 бита).</p>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-300 rounded border border-green-400"></div> <span><strong>Мрежови битове:</strong> Фиксирани от вашия оригинален IP/Маска. Не можем да ги пипаме.</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-sky-300 rounded border border-sky-400"></div> <span><strong>Подмрежови битове:</strong> Битовете, които "заехме", за да създадем {data?.count} подмрежи, които поискахте.</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-300 rounded border border-red-400"></div> <span><strong>Хост битове:</strong> Останалите битове, налични за устройства (компютри, телефони и др.) във всяка подмрежа.</span></div>
                    </div>
                </div>
            )
        };
        case 'ROW_INDEX':
            return {
                title: 'Индекс на Подмрежа',
                content: <p>Просто пореден номер, идентифициращ новия подмрежов дял.</p>
            };
        case 'ROW_SUBNET_BITS':
            return {
                title: 'Изчисляване на Подмрежови Битове',
                content: (
                    <div>
                        <p>Това са уникалните битове, които идентифицират тази конкретна подмрежа. Изчисляваме ги чрез броене в двоична система.</p>
                        <SubnetBitsVisual bits={data.subnetBits} />
                        <p>Всяка уникална комбинация от тези битове създава различен мрежов адрес.</p>
                    </div>
                )
            };
        case 'ROW_NETWORK_IP':
            return {
                title: 'Мрежов ID',
                content: (
                    <div>
                        <p><strong>Мрежовият ID</strong> е най-първият адрес в обхвата на подмрежата.</p>
                        <p className="mt-2 text-red-600 font-semibold">Той е ЗАПАЗЕН.</p>
                        <p>Не можете да присвоите този IP на компютър. Използва се от рутерите, за да знаят "къде" да изпращат трафика за тази подмрежа.</p>
                    </div>
                )
            };
        case 'ROW_BROADCAST_IP':
            return {
                title: 'Броудкаст Адрес',
                content: (
                    <div>
                        <p><strong>Броудкаст Адресът</strong> е последният адрес в обхвата на подмрежата.</p>
                        <p className="mt-2 text-amber-600 font-semibold">Той е ЗАПАЗЕН.</p>
                        <p>Всички данни, изпратени до този IP адрес, се получават от <em>всяко</em> устройство в тази подмрежа. Това е като да викаш на цялата стая.</p>
                    </div>
                )
            };
        case 'ROW_RANGE':
            return {
                title: 'Използваем Хост Обхват',
                content: (
                    <div>
                        <p>Това е обхватът от IP адреси, които действително можете да присвоите на устройства (сървъри, лаптопи, принтери).</p>
                        <HostRangeVisual 
                            net={data.networkIp} 
                            first={data.firstUsable} 
                            last={data.lastUsable} 
                            broadcast={data.broadcastIp} 
                        />
                        <p>Изчисляваме това, като вземем пълния обхват и премахнем първия (Мрежов) и последния (Броудкаст) IP адрес.</p>
                    </div>
                )
            };
        case 'ROW_HOSTS':
            return {
                title: 'Капацитет за Използваеми Хостове',
                content: (
                    <div>
                        <p>Общият брой устройства, които могат да се поберат в тази подмрежа.</p>
                        <div className="bg-slate-100 p-3 rounded font-mono mt-2 text-center">
                            2<sup>{data.hostBits}</sup> - 2 = <strong>{data.count}</strong>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            Където {data.hostBits} е броят на оставащите Хост (Червени) битове.<br/>
                            "- 2" отчита запазените Мрежов и Броудкаст адреси.
                        </p>
                    </div>
                )
            };
        case 'DETAILS_GATEWAY':
            return t('help.details_gateway');
        case 'DETAILS_BROADCAST':
            return t('help.details_broadcast');
        case 'DETAILS_OLD_MASK':
            return {
              ...t('help.details_old_mask'),
              content: (
                <div>
                   <p className="mb-2">{t('help.details_old_mask').content}</p>
                   <MaskLogicVisual n={data.n} s={data.s} h={data.h} sActive={false} />
                </div>
              )
            }
        case 'DETAILS_NEW_MASK':
            return {
              ...t('help.details_new_mask'),
              content: (
                <div>
                   <p className="mb-2">{t('help.details_new_mask').content}</p>
                   <MaskLogicVisual n={data.n} s={data.s} h={data.h} sActive={true} />
                </div>
              )
            }
        default:
          return { title: 'Помощ', content: 'Няма налични детайли.' };
      }
  } else {
    // English Content
    switch (topic) {
        case 'INPUT_IP':
          return {
            title: 'Network Address',
            content: (
              <div>
                <p>The <strong>Network Address</strong> is the starting point for your allocation. It represents the identifier for the entire block of IP addresses you are working with.</p>
                <p className="mt-2">Think of it like the street name. It defines "where" the network is, but doesn't point to a specific house (host) yet.</p>
              </div>
            )
          };
        case 'INPUT_MASK':
          return {
            title: 'Subnet Mask (CIDR)',
            content: (
              <div>
                <p>The <strong>Subnet Mask</strong> (represented here in CIDR notation, e.g., /8, /24) defines how large your network is.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Smaller number (e.g., /8) = More hosts, larger network.</li>
                  <li>Larger number (e.g., /24) = Fewer hosts, smaller network.</li>
                </ul>
                <p className="mt-2">It tells the computer which part of the IP address is the "Network" and which part is available for "Hosts".</p>
              </div>
            )
          };
        case 'INPUT_SUBNETS':
          return {
            title: 'Requested Subnets',
            content: (
              <div>
                <p>This is the number of smaller networks you want to create from your original block.</p>
                <p className="mt-2">The calculator uses the formula <code className="bg-slate-100 px-1 rounded">2^N ≥ Required</code> to determine how many bits we need to "borrow" from the host portion to create these new network indexes.</p>
              </div>
            )
          };
        case 'VIS_BITS':
          return {
            title: 'Bit Visualization',
            content: (
                <div>
                    <p>This grid shows the 32 bits that make up an IPv4 address. Each row is an "octet" (8 bits).</p>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-300 rounded border border-green-400"></div> <span><strong>Network Bits:</strong> Fixed by your original IP/Mask. We cannot touch these.</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-sky-300 rounded border border-sky-400"></div> <span><strong>Subnet Bits:</strong> The bits we "borrowed" to create the {data?.count} subnets you requested.</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-300 rounded border border-red-400"></div> <span><strong>Host Bits:</strong> The remaining bits available for devices (computers, phones, etc.) in each subnet.</span></div>
                    </div>
                </div>
            )
        };
        case 'ROW_INDEX':
            return {
                title: 'Subnet Index',
                content: <p>Just a sequential number identifying the new sub-network partition.</p>
            };
        case 'ROW_SUBNET_BITS':
            return {
                title: 'Subnet Bits Calculation',
                content: (
                    <div>
                        <p>These are the unique bits that identify this specific sub-network. We calculate them by counting in binary.</p>
                        <SubnetBitsVisual bits={data.subnetBits} />
                        <p>Each unique combination of these bits creates a different network address.</p>
                    </div>
                )
            };
        case 'ROW_NETWORK_IP':
            return {
                title: 'Network ID',
                content: (
                    <div>
                        <p>The <strong>Network ID</strong> is the very first address in the subnet range.</p>
                        <p className="mt-2 text-red-600 font-semibold">It is RESERVED.</p>
                        <p>You cannot assign this IP to a computer. It is used by routers to know "where" to send traffic for this subnet.</p>
                    </div>
                )
            };
        case 'ROW_BROADCAST_IP':
            return {
                title: 'Broadcast Address',
                content: (
                    <div>
                        <p>The <strong>Broadcast Address</strong> is the very last address in the subnet range.</p>
                        <p className="mt-2 text-amber-600 font-semibold">It is RESERVED.</p>
                        <p>Any data sent to this IP address is received by <em>every</em> device on this subnet. It's like shouting to the whole room.</p>
                    </div>
                )
            };
        case 'ROW_RANGE':
            return {
                title: 'Usable Host Range',
                content: (
                    <div>
                        <p>This is the range of IP addresses you can actually assign to devices (servers, laptops, printers).</p>
                        <HostRangeVisual 
                            net={data.networkIp} 
                            first={data.firstUsable} 
                            last={data.lastUsable} 
                            broadcast={data.broadcastIp} 
                        />
                        <p>We calculate this by taking the full range and chopping off the first (Network) and last (Broadcast) IPs.</p>
                    </div>
                )
            };
        case 'ROW_HOSTS':
            return {
                title: 'Usable Hosts Capacity',
                content: (
                    <div>
                        <p>The total number of devices that can fit in this subnet.</p>
                        <div className="bg-slate-100 p-3 rounded font-mono mt-2 text-center">
                            2<sup>{data.hostBits}</sup> - 2 = <strong>{data.count}</strong>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            Where {data.hostBits} is the number of Host (Red) bits remaining.<br/>
                            The "- 2" accounts for the reserved Network and Broadcast addresses.
                        </p>
                    </div>
                )
            };
        case 'DETAILS_GATEWAY':
            return t('help.details_gateway');
        case 'DETAILS_BROADCAST':
            return t('help.details_broadcast');
        case 'DETAILS_OLD_MASK':
            return {
              ...t('help.details_old_mask'),
              content: (
                <div>
                   <p className="mb-2">{t('help.details_old_mask').content}</p>
                   <MaskLogicVisual n={data.n} s={data.s} h={data.h} sActive={false} />
                </div>
              )
            }
        case 'DETAILS_NEW_MASK':
            return {
              ...t('help.details_new_mask'),
              content: (
                <div>
                   <p className="mb-2">{t('help.details_new_mask').content}</p>
                   <MaskLogicVisual n={data.n} s={data.s} h={data.h} sActive={true} />
                </div>
              )
            }
        default:
          return { title: 'Help', content: 'No details available.' };
    }
  }
};

// --- Context & Provider ---
// (No changes to Context/Provider logic needed, just export valid HelpSystem)

interface HelpContextType {
  openHelp: (topic: string, data?: any) => void;
  closeHelp: () => void;
  isOpen: boolean;
  topic: string | null;
  data: any;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) throw new Error('useHelp must be used within a HelpProvider');
  return context;
};

// --- Components ---

export const HelpModal: React.FC = () => {
  const { isOpen, closeHelp, topic, data } = useHelp();
  const { language, t } = useLanguage();

  if (!isOpen || !topic) return null;

  const { title, content } = getHelpContent(topic, data, language, t);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeHelp}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {title}
          </h3>
          <button onClick={closeHelp} className="text-indigo-100 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 text-slate-700 leading-relaxed">
          {content}
        </div>
        <div className="bg-slate-50 px-6 py-3 text-right border-t border-slate-100">
            <button onClick={closeHelp} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">{t('help.close')}</button>
        </div>
      </div>
    </div>
  );
};

interface HelpTriggerProps {
  topic: string;
  data?: any;
  children: React.ReactNode;
  className?: string;
  as?: any;
}

export const HelpTrigger: React.FC<HelpTriggerProps> = ({ 
  topic, 
  data, 
  children, 
  className = '', 
  as: Component = 'div' 
}) => {
  const { openHelp } = useHelp();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling issues
    openHelp(topic, data);
  };

  return (
    <Component 
      onClick={handleClick} 
      className={`cursor-help hover:opacity-80 transition-opacity relative group ${className}`}
      title="Click for explanation"
      role="button"
    >
      {children}
      {/* Optional Hover Indicator */}
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
    </Component>
  );
};

export const HelpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const openHelp = (topicId: string, contextData?: any) => {
    setTopic(topicId);
    setData(contextData);
    setIsOpen(true);
  };

  const closeHelp = () => {
    setIsOpen(false);
    setTopic(null);
    setData(null);
  };

  return (
    <HelpContext.Provider value={{ openHelp, closeHelp, isOpen, topic, data }}>
      {children}
      <HelpModal />
    </HelpContext.Provider>
  );
};

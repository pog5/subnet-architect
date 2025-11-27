import React from 'react';
import { SubnetRow } from '../types';
import { HelpTrigger } from './HelpSystem';
import { useLanguage } from '../contexts/LanguageContext';

interface SubnetTableProps {
  rows: SubnetRow[];
  loading?: boolean;
}

export const SubnetTable: React.FC<SubnetTableProps> = ({ rows, loading }) => {
  const { t } = useLanguage();

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">{t('table.loading')}</div>;
  }

  if (rows.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500">
        {t('table.empty')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-3 md:px-6 py-3 font-medium whitespace-nowrap">
                <HelpTrigger topic="ROW_INDEX" as="span">{t('table.headers.index')}</HelpTrigger>
            </th>
            <th className="px-3 md:px-6 py-3 font-medium whitespace-nowrap">
                <HelpTrigger topic="ROW_SUBNET_BITS" data={{subnetBits: '000'}} as="span">{t('table.headers.subnet_bits')}</HelpTrigger>
            </th>
            <th className="px-3 md:px-6 py-3 font-medium hidden sm:table-cell whitespace-nowrap">
                <HelpTrigger topic="ROW_NETWORK_IP" as="span">{t('table.headers.network_ip')}</HelpTrigger>
            </th>
            <th className="px-3 md:px-6 py-3 font-medium hidden lg:table-cell whitespace-nowrap">
                <HelpTrigger topic="ROW_BROADCAST_IP" as="span">{t('table.headers.broadcast_ip')}</HelpTrigger>
            </th>
            <th className="px-3 md:px-6 py-3 font-medium text-center whitespace-nowrap">
                <HelpTrigger topic="ROW_RANGE" data={{ networkIp: "x.x.x.0", firstUsable: "x.x.x.1", lastUsable: "x.x.x.254", broadcastIp: "x.x.x.255" }} as="span">{t('table.headers.range')}</HelpTrigger>
            </th>
            <th className="px-3 md:px-6 py-3 font-medium text-right hidden sm:table-cell whitespace-nowrap">
                <HelpTrigger topic="ROW_HOSTS" data={{ hostBits: 'H', count: '2^H' }} as="span">{t('table.headers.hosts')}</HelpTrigger>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300">
              <td className="px-3 md:px-6 py-3 font-mono text-slate-500 dark:text-slate-400 align-top md:align-middle">
                {row.index}
              </td>
              <td className="px-3 md:px-6 py-3 font-mono text-blue-600 dark:text-blue-400 font-semibold align-middle">
                <HelpTrigger topic="ROW_SUBNET_BITS" data={row} as="span">
                    {row.subnetBits}
                </HelpTrigger>
              </td>
              <td className="px-3 md:px-6 py-3 font-mono font-medium hidden sm:table-cell align-top md:align-middle break-all max-w-[200px] xl:max-w-none">
                <HelpTrigger topic="ROW_NETWORK_IP" as="div" className="inline-flex flex-col md:flex-row md:items-center">
                    <span>{row.networkIp}</span>
                    <span className="text-slate-400 dark:text-slate-500 md:ml-2 text-xs md:text-sm">/{row.cidr}</span>
                </HelpTrigger>
              </td>
              <td className="px-3 md:px-6 py-3 font-mono text-slate-600 dark:text-slate-400 hidden lg:table-cell align-middle break-all max-w-[200px] xl:max-w-none">
                <HelpTrigger topic="ROW_BROADCAST_IP" as="span">
                    {row.broadcastIp}
                </HelpTrigger>
              </td>
              <td className="px-3 md:px-6 py-3 font-mono text-center text-slate-600 dark:text-slate-300 align-top md:align-middle">
                <HelpTrigger topic="ROW_RANGE" data={row} as="div" className="flex flex-col xl:flex-row items-center justify-center gap-0.5 xl:gap-2">
                    <span className="break-all max-w-[150px]">{row.firstUsable}</span>
                    <span className="text-slate-300 dark:text-slate-600 text-[10px] xl:text-xs leading-none xl:leading-normal">
                      <span className="hidden xl:inline">→</span>
                      <span className="xl:hidden">↓</span>
                    </span>
                    <span className="break-all max-w-[150px]">{row.lastUsable}</span>
                </HelpTrigger>
              </td>
              <td className="px-3 md:px-6 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400 hidden sm:table-cell align-middle">
                 {typeof row.hostCount === 'number' ? row.hostCount.toLocaleString() : row.hostCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
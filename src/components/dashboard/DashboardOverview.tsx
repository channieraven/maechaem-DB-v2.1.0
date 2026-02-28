import React from 'react';
import { Trees, CheckCircle2, BarChart3 } from 'lucide-react';
import { usePlots } from '../../hooks/usePlots';
import SurvivalChart from './SurvivalChart';

const DashboardOverview: React.FC = () => {
  const { plots, isLoading } = usePlots();

  const totalTrees = plots.reduce((s, p) => s + p.tree_count, 0);
  const totalAlive = plots.reduce((s, p) => s + p.alive_count, 0);
  const overallRate = totalTrees > 0 ? Math.round((totalAlive / totalTrees) * 100) : null;

  const stats = [
    {
      label: 'ต้นไม้ทั้งหมด',
      value: totalTrees.toLocaleString(),
      icon: <Trees size={20} className="text-[#2d5a27]" />,
      className: 'bg-white border border-gray-100 shadow-sm',
    },
    {
      label: 'อัตราการรอดตาย',
      value: overallRate !== null ? `${overallRate}%` : '—',
      icon: <CheckCircle2 size={20} className="text-emerald-600" />,
      className: 'bg-white border border-gray-100 shadow-sm border-l-4 border-l-green-500',
    },
    {
      label: 'จำนวนแปลง',
      value: plots.length.toString(),
      icon: <BarChart3 size={20} className="text-blue-600" />,
      className: 'bg-white border border-gray-100 shadow-sm border-l-4 border-l-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon, className }) => (
          <div key={label} className={`rounded-xl p-4 ${className}`}>
            <div className="flex items-center gap-3 mb-2">
              {icon}
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-mono font-bold text-gray-900">{isLoading ? '...' : value}</p>
          </div>
        ))}
      </div>

      {/* Survival chart */}
      <SurvivalChart />
    </div>
  );
};

export default DashboardOverview;

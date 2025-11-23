import React, { useEffect, useRef } from 'react';
import { Subscription, CURRENCIES, Language, TRANSLATIONS, TRADE_OFFS } from '../types';
import Chart from 'chart.js/auto';

interface DashboardStatsProps {
  subscriptions: Subscription[];
  viewMode: 'monthly' | 'yearly';
  onViewModeChange: (mode: 'monthly' | 'yearly') => void;
  language: Language;
  tradeOffId: string;
  setTradeOffId: (id: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  subscriptions, 
  viewMode, 
  onViewModeChange,
  language,
  tradeOffId,
  setTradeOffId
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const t = TRANSLATIONS[language];

  // Calculate Total Cost in Base Currency (USD for calculation consistency, but displayed)
  const totalCostBase = subscriptions.reduce((acc, sub) => {
    const rate = CURRENCIES.find(c => c.code === sub.currency)?.rateToUSD || 1;
    let monthlyCostUSD = sub.cost * rate;
    if (sub.cycle === 'yearly') monthlyCostUSD /= 12;
    return acc + monthlyCostUSD;
  }, 0);

  const displayTotal = viewMode === 'yearly' ? totalCostBase * 12 : totalCostBase;

  // Vibe Check
  let vibeText = t.vibe.low;
  if (totalCostBase > 50) vibeText = t.vibe.medium;
  if (totalCostBase > 150) vibeText = t.vibe.high;

  // Chart Logic
  useEffect(() => {
    if (!chartRef.current) return;

    const categoryData: Record<string, number> = {};
    subscriptions.forEach(sub => {
        const rate = CURRENCIES.find(c => c.code === sub.currency)?.rateToUSD || 1;
        let monthlyCost = sub.cost * rate;
        if (sub.cycle === 'yearly') monthlyCost /= 12;
        categoryData[sub.category] = (categoryData[sub.category] || 0) + monthlyCost;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    
    // Get computed style for dynamic colors
    const style = getComputedStyle(document.body);
    const borderColor = style.getPropertyValue('--bg-primary').trim();
    const textColor = style.getPropertyValue('--text-secondary').trim();

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#10b981', '#3b82f6'
                    ],
                    borderColor: borderColor,
                    borderWidth: 4,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor, // Dynamic text color
                            font: { family: 'Inter', size: 11 },
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                cutout: '75%',
            }
        });
    }

    return () => {
        if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [subscriptions, language]); // Re-render on subscription change or theme change implied by re-mount


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Total Cost Card */}
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <i className="fa-solid fa-wallet text-[var(--text-primary)] text-9xl -rotate-12 translate-x-8 -translate-y-8"></i>
        </div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
           <div>
             <h3 className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mb-1">{t.dashboard.totalExpenses}</h3>
             <p className="text-[10px] text-[var(--text-secondary)] opacity-70">{t.dashboard.convertedBase}</p>
           </div>
           
           <div className="flex bg-[var(--input-bg)] rounded-lg p-1 border border-[var(--glass-border)]">
             <button 
               onClick={() => onViewModeChange('monthly')}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'monthly' ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
             >
               {t.form.monthly.slice(0, 3)}
             </button>
             <button 
               onClick={() => onViewModeChange('yearly')}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'yearly' ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
             >
               {t.form.yearly.slice(0, 3)}
             </button>
           </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-1">
             <span className="text-2xl text-[var(--text-secondary)] font-light">$</span>
             <span className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
               {displayTotal.toFixed(2)}
             </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="bg-[var(--input-bg)] text-[var(--accent-primary)] border border-[var(--glass-border)] px-2 py-1 rounded text-xs font-medium">
                {vibeText}
             </span>
          </div>
        </div>
      </div>

      {/* Analytics & Trade Off */}
      <div className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col md:flex-row gap-6">
        
        {/* Chart */}
        <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[var(--input-bg)] rounded-lg">
                    <i className="fa-solid fa-chart-pie text-[var(--accent-primary)]"></i>
                </div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm">{t.dashboard.breakdown}</h3>
            </div>
            <div className="flex-1 min-h-[180px] relative">
                {subscriptions.length > 0 ? (
                    <canvas ref={chartRef}></canvas>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)] text-sm">
                        <p>{t.dashboard.noData}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Trade Off Controls */}
        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-[var(--glass-border)] pt-6 md:pt-0 md:pl-6 flex flex-col justify-center">
             <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <i className="fa-solid fa-scale-balanced text-[var(--accent-primary)]"></i>
                {t.dashboard.tradeOffLabel}
             </h4>
             <div className="space-y-2">
                 {TRADE_OFFS[language].map((item) => (
                     <button
                        key={item.id}
                        onClick={() => setTradeOffId(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${tradeOffId === item.id ? 'bg-[var(--input-bg)] border-[var(--accent-primary)] text-[var(--text-primary)] shadow-sm' : 'bg-transparent border-transparent hover:bg-[var(--input-bg)] text-[var(--text-secondary)]'}`}
                     >
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-lg">{item.icon}</span>
                     </button>
                 ))}
             </div>
        </div>

      </div>

    </div>
  );
};
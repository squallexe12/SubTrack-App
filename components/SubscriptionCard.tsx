import React from 'react';
import { Subscription, Language, TRANSLATIONS, TRADE_OFFS, CURRENCIES } from '../types';

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
  viewMode: 'monthly' | 'yearly';
  language: Language;
  tradeOffId: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  subscription, 
  onDelete, 
  viewMode,
  language,
  tradeOffId
}) => {
  const t = TRANSLATIONS[language];
  
  const calculateDaysRemaining = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(subscription.nextBillingDate);
  const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3;
  const isOverdue = daysRemaining < 0;

  // Display Cost logic
  let displayCost = subscription.cost;
  let suffix = language === 'tr' ? '/ay' : '/mo';

  if (viewMode === 'yearly') {
    if (subscription.cycle === 'monthly') displayCost *= 12;
    suffix = language === 'tr' ? '/yıl' : '/yr';
  } else {
    if (subscription.cycle === 'yearly') displayCost /= 12;
  }

  // Trade Off Calculation
  const tradeItem = TRADE_OFFS[language].find(i => i.id === tradeOffId);
  let tradeOffText = "";

  if (tradeItem) {
    const subCurrencyRate = CURRENCIES.find(c => c.code === subscription.currency)?.rateToUSD || 1;
    let subMonthlyCostUSD = subscription.cost * subCurrencyRate;
    if (subscription.cycle === 'yearly') subMonthlyCostUSD /= 12;

    const itemCurrencyRate = CURRENCIES.find(c => c.code === tradeItem.currency)?.rateToUSD || 1;
    const itemCostUSD = tradeItem.cost * itemCurrencyRate;

    const ratio = subMonthlyCostUSD / itemCostUSD;
    const count = ratio < 1 ? ratio.toFixed(1) : Math.round(ratio);
    
    tradeOffText = `${t.list.equals} ${count} ${tradeItem.name} ${tradeItem.icon}`;
  }

  // Styles
  const urgencyClass = isOverdue 
    ? "border-red-500/50" 
    : isDueSoon 
      ? "border-[var(--accent-primary)] animate-pulse" 
      : "border-[var(--glass-border)] hover:border-[var(--accent-primary)]";

  return (
    <div className={`glass-card relative rounded-2xl p-6 flex flex-col justify-between group ${urgencyClass}`}>
      
      {/* Urgency Badge */}
      {(isDueSoon || isOverdue) && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg ${isOverdue ? 'bg-red-600 text-white' : 'bg-[var(--accent-primary)] text-white'}`}>
           <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>
           {isOverdue ? t.list.overdue : t.list.dueSoon}
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-4">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner bg-[var(--input-bg)] text-[var(--text-primary)]`}>
             {subscription.name.charAt(0).toUpperCase()}
           </div>
           <div>
             <h3 className="font-bold text-[var(--text-primary)] leading-tight">{subscription.name}</h3>
             <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">{subscription.category}</span>
           </div>
        </div>
        
        <button 
          onClick={() => onDelete(subscription.id)}
          className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 transition-all duration-300"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>

      <div className="space-y-4">
         {/* Price Tag */}
         <div>
             <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-[var(--text-secondary)]">{subscription.currency}</span>
                <span className="text-3xl font-bold text-[var(--text-primary)]">{displayCost.toFixed(2)}</span>
                <span className="text-xs text-[var(--text-secondary)] font-medium">{suffix}</span>
             </div>
             {/* Trade Off Badge */}
             {tradeOffText && (
               <div className="inline-block mt-2 bg-[var(--input-bg)] px-2 py-0.5 rounded text-[10px] text-[var(--accent-secondary)] border border-[var(--glass-border)]">
                 {tradeOffText}
               </div>
             )}
         </div>

         {/* Progress Bar / Days */}
         <div className="pt-4 border-t border-[var(--glass-border)]">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-days"></i>
                {new Date(subscription.nextBillingDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
              </span>
              <span className={`font-bold ${isDueSoon ? 'text-[var(--accent-primary)]' : isOverdue ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                {isOverdue ? `${Math.abs(daysRemaining)} ${t.list.daysAgo}` : `${daysRemaining} ${t.list.daysLeft}`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isOverdue ? 'bg-red-600' : isDueSoon ? 'bg-[var(--accent-primary)]' : 'bg-gray-500'}`}
                style={{ width: isOverdue ? '100%' : `${Math.max(5, 100 - (daysRemaining * 3.3))}%` }}
              ></div>
            </div>
         </div>
      </div>
    </div>
  );
};
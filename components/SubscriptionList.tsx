import React from 'react';
import { Subscription, Language, TRANSLATIONS } from '../types';
import { SubscriptionCard } from './SubscriptionCard';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  viewMode: 'monthly' | 'yearly';
  language: Language;
  tradeOffId: string;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({ 
  subscriptions, 
  onDelete, 
  viewMode,
  language,
  tradeOffId
}) => {
  const t = TRANSLATIONS[language];

  if (subscriptions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-3xl border-dashed border-2 border-[var(--glass-border)]">
            <div className="bg-[var(--input-bg)] p-6 rounded-full mb-4">
                <div className="w-12 h-12 bg-[var(--glass-bg)] rounded-full flex items-center justify-center border border-[var(--glass-border)]">
                  <i className="fa-solid fa-plus text-[var(--accent-primary)] text-xl"></i>
                </div>
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-lg">{t.list.emptyTitle}</h3>
            <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs text-center">
              {t.list.emptyDesc}
            </p>
        </div>
    )
  }

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
     const dateA = new Date(a.nextBillingDate).getTime();
     const dateB = new Date(b.nextBillingDate).getTime();
     return dateA - dateB;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedSubscriptions.map((sub) => (
        <SubscriptionCard 
          key={sub.id} 
          subscription={sub} 
          onDelete={onDelete}
          viewMode={viewMode}
          language={language}
          tradeOffId={tradeOffId}
        />
      ))}
    </div>
  );
};
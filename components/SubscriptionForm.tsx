
import React, { useState } from 'react';
import { Subscription, CURRENCIES, DEFAULT_CURRENCY, Category, CATEGORIES, PRESETS, ServicePreset, Language, TRANSLATIONS } from '../types';

interface SubscriptionFormProps {
  onSubmit: (sub: Omit<Subscription, 'id'>) => void;
  onCancel: () => void;
  language: Language;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onSubmit, onCancel, language }) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [category, setCategory] = useState<Category>('Other');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  const applyPreset = (preset: ServicePreset) => {
    setName(preset.name);
    setCost(preset.defaultCost.toString());
    setCurrency(preset.currency);
    setCategory(preset.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Input Validation
    if (!name.trim() || !cost || parseFloat(cost) < 0 || !date) {
        alert(t.validation.error);
        return;
    }

    // 2. Smart Date Logic
    let calculatedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const gracePeriodThreshold = new Date(today);
    gracePeriodThreshold.setDate(today.getDate() - 3);

    while (calculatedDate < gracePeriodThreshold) {
        if (cycle === 'monthly') {
            calculatedDate.setMonth(calculatedDate.getMonth() + 1);
        } else {
            calculatedDate.setFullYear(calculatedDate.getFullYear() + 1);
        }
    }
    const formattedNextDate = calculatedDate.toISOString().split('T')[0];

    // 3. Success Feedback
    alert(t.validation.success);

    // 4. Submit & Reset
    onSubmit({
      name,
      cost: parseFloat(cost),
      currency,
      nextBillingDate: formattedNextDate,
      category,
      cycle
    });

    // Reset fields (though component will likely unmount)
    setName('');
    setCost('');
    setDate('');
  };

  return (
    <div className="w-full h-full bg-[var(--glass-bg)] backdrop-blur-xl border-l border-[var(--glass-border)] shadow-2xl flex flex-col animate-slide-in-up sm:animate-slide-in-right rounded-t-3xl sm:rounded-none overflow-hidden">
      
      {/* Header */}
      <div className="flex-none p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-[var(--bg-primary)]/50">
         <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{t.form.title}</h2>
            <p className="text-xs text-[var(--text-secondary)]">Manage your recurring expenses</p>
         </div>
         <button onClick={onCancel} className="w-8 h-8 rounded-full bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <i className="fa-solid fa-xmark"></i>
         </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Quick Presets */}
        <section>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t.form.quickAdd}</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="flex-none flex flex-col items-center justify-center w-20 h-20 rounded-2xl border border-[var(--glass-border)] bg-[var(--input-bg)] hover:bg-[var(--accent-primary)] hover:border-transparent group transition-all"
                    >
                        <i className={`${preset.iconClass} text-2xl text-[var(--text-secondary)] group-hover:text-white mb-2`}></i>
                        <span className="text-[10px] font-medium text-[var(--text-secondary)] group-hover:text-white truncate w-full px-1">{preset.name}</span>
                    </button>
                ))}
            </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
           
           {/* Service Name */}
           <div className="group">
              <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input w-full rounded-2xl px-4 pt-6 pb-2 text-[var(--text-primary)] font-semibold placeholder-transparent focus:outline-none peer"
                    placeholder="Name"
                    id="subName"
                    required
                  />
                  <label htmlFor="subName" className="absolute left-4 top-2 text-[10px] font-bold uppercase text-[var(--text-secondary)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[var(--accent-primary)]">
                     {t.form.nameLabel}
                  </label>
                  <i className="fa-solid fa-pen absolute right-4 top-4 text-[var(--text-secondary)] opacity-50"></i>
              </div>
           </div>

           {/* Cost Row */}
           <div className="flex gap-3">
              <div className="w-1/3 relative">
                 <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="glass-input w-full h-full rounded-2xl px-3 text-center font-bold text-[var(--text-primary)] appearance-none"
                 >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-[var(--bg-primary)]">{c.code}</option>)}
                 </select>
                 <i className="fa-solid fa-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] pointer-events-none"></i>
              </div>
              <div className="flex-1 relative">
                 <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="glass-input w-full rounded-2xl px-4 pt-6 pb-2 text-[var(--text-primary)] font-bold placeholder-transparent focus:outline-none peer"
                    placeholder="0.00"
                    id="subCost"
                    required
                    min="0"
                  />
                  <label htmlFor="subCost" className="absolute left-4 top-2 text-[10px] font-bold uppercase text-[var(--text-secondary)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[var(--accent-primary)]">
                     {t.form.costLabel}
                  </label>
              </div>
           </div>

           {/* Category Chips */}
           <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t.form.categoryLabel}</label>
              <div className="flex flex-wrap gap-2">
                 {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${category === cat ? 'bg-[var(--accent-primary)] text-white border-transparent shadow-lg shadow-blue-500/30' : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-[var(--accent-primary)]'}`}
                    >
                        {cat}
                    </button>
                 ))}
              </div>
           </div>

           {/* Date & Cycle */}
           <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                   <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input w-full rounded-2xl px-4 pt-6 pb-2 text-[var(--text-primary)] font-medium focus:outline-none [color-scheme:var(--color-scheme)]"
                    style={{ colorScheme: 'var(--color-scheme)' }}
                    required
                  />
                  <label className="absolute left-4 top-2 text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                     {t.form.dateLabel}
                  </label>
                  <i className="fa-regular fa-calendar absolute right-4 top-4 text-[var(--text-secondary)] pointer-events-none"></i>
              </div>

              <div className="bg-[var(--input-bg)] p-1 rounded-2xl flex border border-[var(--glass-border)]">
                 <button
                   type="button"
                   onClick={() => setCycle('monthly')}
                   className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${cycle === 'monthly' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                 >
                   {t.form.monthly}
                 </button>
                 <button
                   type="button"
                   onClick={() => setCycle('yearly')}
                   className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${cycle === 'yearly' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                 >
                   {t.form.yearly}
                 </button>
              </div>
           </div>

           {/* Actions */}
           <div className="pt-6">
             <button
               type="submit"
               className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--accent-primary)] hover:text-white rounded-2xl font-bold text-lg shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
             >
               <i className="fa-solid fa-check"></i>
               {t.form.save}
             </button>
           </div>

        </form>
      </div>
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEventData } from '@/hooks/useEventData';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AddExpenseClient({ eventId }: { eventId: string }) {
  const t = useTranslations('AddExpenseClient');
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [payerId, setPayerId] = useState('');
  const [involvedIds, setInvolvedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { event, participants } = useEventData(eventId);

  // Default currency to event base currency
  useEffect(() => {
    if (event?.baseCurrency && currency === 'USD') {
      const timeout = setTimeout(() => setCurrency(event.baseCurrency as string), 0);
      return () => clearTimeout(timeout);
    }
  }, [event, currency]);

  // Select all participants by default
  useEffect(() => {
    if (participants.length > 0 && involvedIds.length === 0) {
      const timeout = setTimeout(() => {
        setInvolvedIds(participants.map(p => p.id));
        if (!payerId) setPayerId(participants[0].id);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [participants, involvedIds.length, payerId]);

  const toggleInvolved = (id: string) => {
    setInvolvedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !payerId || involvedIds.length === 0) return;

    const sanitizedAmount = amount.replace(',', '.');
    const parsedAmount = Math.abs(parseFloat(sanitizedAmount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsLoading(true);
    await supabase.from('expenses').insert({
      id: uuidv4(),
      eventId,
      title,
      amount: parsedAmount,
      currency,
      payerId,
      involvedIds,
      date: new Date().toISOString()
    });

    router.push(`/event/${eventId}`);
  };

  if (event === undefined) return <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen text-zinc-500 animate-pulse">{t('loading')}</div>;
  if (event === null) return <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen text-red-500">{t('notFound')}</div>;

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{t('noParticipants')}</h3>
        <Button variant="secondary" onClick={() => router.back()}>{t('goBack')}</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto p-4 pb-24 relative min-h-[100dvh]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 flex-1">{t('title')}</h1>
        <LanguageSwitcher />
      </header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input 
              data-testid="expense-title-input"
              label={t('descriptionLabel')}
              placeholder={t('descriptionPlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  data-testid="expense-amount-input"
                  label={t('amountLabel')}
                  type="number" 
                  step="0.01"
                  min="0.01"
                  placeholder={t('amountPlaceholder')}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="w-full sm:w-1/3 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-500">{t('currencyLabel')}</label>
                <div className="relative">
                  <select 
                    className="w-full h-12 rounded-[16px] border border-transparent bg-zinc-50 px-4 py-2 pr-10 text-sm text-zinc-900 appearance-none transition-all focus:bg-white focus:border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="RUB">RUB</option>
                    <option value="BYN">BYN</option>
                    <option value="TRY">TRY</option>
                    <option value="THB">THB</option>
                    <option value="GEL">GEL</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-500">{t('payerLabel')}</label>
              <div className="relative">
                <select 
                  data-testid="expense-payer-select"
                  className="w-full h-12 rounded-[16px] border border-transparent bg-zinc-50 px-4 py-2 pr-10 text-sm text-zinc-900 appearance-none transition-all focus:bg-white focus:border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  required
                >
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-500">{t('involvedLabel')}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {participants.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleInvolved(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-sm font-medium transition-colors border ${
                      involvedIds.includes(p.id) 
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-900'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
                    }`}
                  >
                    {involvedIds.includes(p.id) && <Check className="w-3.5 h-3.5" />}
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <Button data-testid="expense-save-button" type="submit" size="lg" className="w-full mt-4" isLoading={isLoading} disabled={involvedIds.length === 0}>
              {t('saveButton')}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

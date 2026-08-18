'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { supabase, Event } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Wallet, Globe, Users, Trash2, Calendar, ArrowRight, ChevronDown } from 'lucide-react';

export default function Home() {
  const t = useTranslations('HomePage');
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);

  // Load events from Supabase based on IDs in localStorage
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const savedIds = JSON.parse(localStorage.getItem('fairshare_events') || '[]');
        if (savedIds.length === 0) return;

        const { data } = await supabase
          .from('events')
          .select('*')
          .in('id', savedIds)
          .order('createdAt', { ascending: false });

        if (data) {
          setSortedEvents(data);
        }
      } catch (err) {
        console.error('Failed to load events', err);
      }
    };
    fetchEvents();
  }, []);

  const saveEventIdToLocal = (id: string) => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('fairshare_events') || '[]');
      if (!savedIds.includes(id)) {
        localStorage.setItem('fairshare_events', JSON.stringify([id, ...savedIds]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeEventIdFromLocal = (id: string) => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('fairshare_events') || '[]');
      localStorage.setItem('fairshare_events', JSON.stringify(savedIds.filter((savedId: string) => savedId !== id)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsLoading(true);
    const newEventId = uuidv4();

    const { error } = await supabase.from('events').insert({
      id: newEventId,
      title,
      baseCurrency: currency,
      createdAt: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating event:', error);
      alert('Ошибка при создании события: ' + error.message);
      setIsLoading(false);
      return;
    }

    saveEventIdToLocal(newEventId);
    router.push(`/event/${newEventId}`);
  };

  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const handleDeleteEvent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent navigation
    setDeleteEventId(id);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteEventId) return;
    
    // Supabase 'on delete cascade' handles participants and expenses automatically
    await supabase.from('events').delete().eq('id', deleteEventId);
    
    removeEventIdFromLocal(deleteEventId);
    setSortedEvents(prev => prev.filter(ev => ev.id !== deleteEventId));
    setDeleteEventId(null);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-x-hidden min-h-[100dvh]">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10 flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-8 p-5 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        >
          <Wallet className="w-10 h-10 text-zinc-900" />
        </motion.div>

        <h1 className="text-3xl font-extrabold text-center mb-4 tracking-tight text-zinc-900">
          {t('titleLine1')} <br />
          <span className="text-zinc-400 font-medium">
            {t('titleLine2')}
          </span>
        </h1>

        <p className="text-center text-zinc-500 mb-8 max-w-sm text-sm">
          {t('subtitle')}
        </p>

        <Card className="w-full">
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
            <Input 
              data-testid="event-title-input"
              label={t('eventNameLabel')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('eventNamePlaceholder')}
              className="w-full text-lg h-14 bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 focus:ring-2 focus:ring-zinc-200 transition-all rounded-[16px]"
              maxLength={40}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-zinc-500">{t('baseCurrencyLabel')}</label>
              <div className="relative">
                <select
                  className="w-full h-12 rounded-[16px] border border-transparent bg-zinc-50 px-4 py-2 pr-10 text-sm text-zinc-900 appearance-none transition-all focus:bg-white focus:border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">{t('currencies.USD')}</option>
                  <option value="EUR">{t('currencies.EUR')}</option>
                  <option value="RUB">{t('currencies.RUB')}</option>
                  <option value="BYN">{t('currencies.BYN')}</option>
                  <option value="TRY">{t('currencies.TRY')}</option>
                  <option value="THB">{t('currencies.THB')}</option>
                  <option value="GEL">{t('currencies.GEL')}</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <Button 
              data-testid="create-event-button"
              type="submit" 
              size="lg" 
              className="w-full h-14 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all active:scale-[0.98] mt-2" 
              isLoading={isLoading}
              disabled={!title || isLoading}
            >
              {t('startEventButton')}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Features showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-white text-zinc-700 shadow-sm rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-zinc-500">{t('noRegistration')}</span>
        </div>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-white text-zinc-700 shadow-sm rounded-2xl">
            <Globe className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-zinc-500">{t('offlineMode')}</span>
        </div>
      </motion.div>

      {/* Events List */}
      {sortedEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 w-full max-w-md z-10 flex flex-col gap-4 pb-12"
        >
          <div className="flex items-center gap-2 mb-2 px-2">
            <Calendar className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-bold text-zinc-900">{t('myEvents')}</h2>
          </div>

          <div className="flex flex-col gap-3">
            {sortedEvents.map(ev => (
              <Card
                key={ev.id}
                className="!p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => {
                  router.push(`/event/${ev.id}`);
                }}
              >
                <div className="flex flex-col min-w-0 pr-4">
                  <h3 className="font-bold text-zinc-900 text-lg group-hover:text-black transition-colors truncate">{ev.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 truncate">
                    {new Date(ev.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })} • {t('currency')} {ev.baseCurrency || 'USD'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleDeleteEvent(e, ev.id)}
                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <ArrowRight className="w-5 h-5 text-zinc-300 hidden sm:block group-hover:text-zinc-600 transition-colors" />
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <ConfirmModal
        isOpen={deleteEventId !== null}
        onClose={() => setDeleteEventId(null)}
        onConfirm={confirmDeleteEvent}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
      />
    </main>
  );
}

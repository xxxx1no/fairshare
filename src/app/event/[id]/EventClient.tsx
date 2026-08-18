'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ArrowLeft, Plus, Users, Receipt, ArrowRightLeft, Check, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { calculateSettlements } from '@/lib/settlement';
import { useEventData } from '@/hooks/useEventData';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { EmptyState } from '@/components/ui/EmptyState';

export default function EventClient({ eventId }: { eventId: string }) {
  const t = useTranslations('EventClient');
  const router = useRouter();
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deleteParticipantData, setDeleteParticipantData] = useState<{id: string, name: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'participants'>('expenses');

  const { event, participants, expenses } = useEventData(eventId);

  if (event === undefined) return <div className="p-8 text-center animate-pulse">{t('loading')}</div>;
  if (event === null) return <div className="p-8 text-center text-red-500">{t('notFound')}</div>;

  const confirmDeleteParticipant = async () => {
    if (!deleteParticipantData) return;
    const participantId = deleteParticipantData.id;
    await db.transaction('rw', db.participants, db.expenses, async () => {
      const expensesToUpdate = await db.expenses.where({ eventId }).toArray();
      for (const exp of expensesToUpdate) {
        if (exp.payerId === participantId) {
          // Если он платил, удаляем всю трату
          await db.expenses.delete(exp.id);
        } else if (exp.involvedIds.includes(participantId)) {
          // Если он был вовлечен, убираем его из списка
          const newInvolved = exp.involvedIds.filter(id => id !== participantId);
          if (newInvolved.length === 0) {
            await db.expenses.delete(exp.id);
          } else {
            await db.expenses.update(exp.id, { involvedIds: newInvolved });
          }
        }
      }
      await db.participants.delete(participantId);
    });
    setDeleteParticipantData(null);
  };

  const confirmDeleteExpense = async () => {
    if (!deleteExpenseId) return;
    await db.expenses.delete(deleteExpenseId);
    setDeleteExpenseId(null);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto p-4 pb-24 lg:pb-32 relative min-h-[100dvh]">
      {/* Header */}
      <header className="flex items-start gap-4 py-4 mb-6">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-900 flex-shrink-0">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 break-words">{event.title}</h1>
            <LanguageSwitcher />
          </div>
          <p className="text-sm text-zinc-500 mt-1">{t('baseCurrency')}: {event.baseCurrency || 'USD'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t('totalSpent')}</p>
          <div className="flex flex-col items-end gap-1">
            {(() => {
              const regularExpenses = expenses.filter(e => !e.isPayment);
              if (regularExpenses.length === 0) return <span className="font-bold text-lg text-zinc-900">0 {event.baseCurrency || 'USD'}</span>;
              
              const totals = regularExpenses.reduce((acc, exp) => {
                acc[exp.currency] = (acc[exp.currency] || 0) + exp.amount;
                return acc;
              }, {} as Record<string, number>);
              
              return Object.entries(totals).map(([curr, amount]) => (
                <div key={curr} className="font-bold text-lg text-zinc-900">
                  {amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {curr}
                </div>
              ));
            })()}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white shadow-sm p-1.5 rounded-2xl">
        <button
          data-testid="tab-expenses"
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Receipt className="w-4 h-4" />
            {t('tabs.expenses')}
          </div>
        </button>
        <button
          data-testid="tab-balances"
          onClick={() => setActiveTab('balances')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'balances' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            {t('tabs.balances')}
          </div>
        </button>
        <button
          data-testid="tab-participants"
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'participants' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            {t('tabs.participants')}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'expenses' && (
            <motion.div 
              key="expenses" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {expenses.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title={t('expenses.noExpenses')}
                  description={participants.length === 0 ? t('expenses.noParticipantsHint') : t('expenses.noExpensesHint')}
                />
              ) : (
                <div className="space-y-4">
                  {expenses.filter(e => !e.isPayment).map(exp => (
                    <Card key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 !p-4 transition-all">
                      <div className="min-w-0 pr-4">
                        <h4 className="font-semibold text-zinc-900 break-words">{exp.title}</h4>
                        <div className="mt-2 inline-flex px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 truncate max-w-full">
                          {t('expenses.paidBy')} {participants.find(p => p.id === exp.payerId)?.name || t('expenses.unknown')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <div className="font-bold text-lg text-zinc-900">
                          {exp.amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-zinc-500 text-sm">{exp.currency}</span>
                        </div>
                        <button 
                          onClick={() => setDeleteExpenseId(exp.id)}
                          className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'balances' && (
            <motion.div 
              key="balances" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {expenses.length === 0 ? (
                <EmptyState
                  icon={ArrowRightLeft}
                  title={t('balances.title')}
                  description={t('balances.noBalancesHint')}
                />
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const settlements = calculateSettlements(participants, expenses);
                    const payments = expenses.filter(e => e.isPayment);
                    
                    return (
                      <>
                        {settlements.length === 0 ? (
                          <EmptyState
                            icon={Check}
                            iconBgColor="bg-green-100"
                            iconColor="text-green-500"
                            title={t('balances.allSettled')}
                            description={t('balances.nobodyOwes')}
                          />
                        ) : (
                          settlements.map((s, idx) => {
                            const fromUser = participants.find(p => p.id === s.from)?.name || t('balances.unknown');
                            const toUser = participants.find(p => p.id === s.to)?.name || t('balances.unknown');
                            return (
                              <Card key={idx} className="!p-4 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-zinc-900">{fromUser}</span>
                                    <ArrowRightLeft className="w-4 h-4 text-zinc-400" />
                                    <span className="font-medium text-zinc-900">{toUser}</span>
                                  </div>
                                  <div className="px-3 py-1.5 rounded-full bg-red-50 border border-red-100 font-bold text-sm text-red-600">
                                    {s.amount} {s.currency}
                                  </div>
                                </div>
                                <Button 
                                  variant="primary"
                                  className="w-full"
                                  onClick={async () => {
                                    await db.expenses.add({
                                      id: crypto.randomUUID(),
                                      eventId,
                                      title: t('balances.debtReturn'),
                                      amount: s.amount,
                                      currency: s.currency,
                                      payerId: s.from,
                                      involvedIds: [s.to],
                                      date: new Date(),
                                      isPayment: true
                                    });
                                  }}
                                >
                                  {t('balances.markAsPaid')}
                                </Button>
                              </Card>
                            );
                          })
                        )}

                        {payments.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-zinc-200">
                            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                              <Check className="w-5 h-5 text-green-500" />
                              {t('balances.closedPayments')}
                            </h3>
                            <div className="space-y-3">
                               {payments.map(p => {
                                 const fromUser = participants.find(u => u.id === p.payerId)?.name || t('balances.unknown');
                                 const toUser = participants.find(u => u.id === p.involvedIds[0])?.name || t('balances.unknown');
                                 return (
                                   <Card key={p.id} className="!p-4 opacity-75 shadow-none border border-zinc-100">
                                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-4">
                                       <div className="flex flex-col min-w-0">
                                         <div className="flex items-center gap-2 text-zinc-400 line-through text-sm flex-wrap">
                                           <span className="truncate max-w-[120px]">{fromUser}</span>
                                           <ArrowRightLeft className="w-3 h-3 flex-shrink-0" />
                                           <span className="truncate max-w-[120px]">{toUser}</span>
                                         </div>
                                         <div className="text-green-600 text-xs font-medium mt-1 uppercase tracking-wider">
                                           {t('balances.paid')}
                                         </div>
                                       </div>
                                       <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                         <div className="px-3 py-1.5 rounded-full bg-green-50 border border-green-100 font-bold text-sm text-green-600">
                                           {p.amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {p.currency}
                                         </div>
                                         <button 
                                           onClick={() => setDeleteExpenseId(p.id)}
                                           className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                         >
                                           <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                         </button>
                                       </div>
                                     </div>
                                   </Card>
                                 );
                               })}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'participants' && (
            <motion.div 
              key="participants" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="space-y-4">
                {participants.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={t('participants.noParticipants')}
                    description={t('participants.addHint')}
                  />
                ) : (
                  participants.map(p => (
                    <Card key={p.id} className="!p-4 flex items-center justify-between gap-3">
                      <div className="font-medium text-zinc-900 flex items-center gap-3 min-w-0 pr-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 flex-shrink-0">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{p.name}</span>
                      </div>
                      <button 
                        onClick={() => setDeleteParticipantData({ id: p.id, name: p.name })}
                        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </Card>
                  ))
                )}
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('name') as HTMLInputElement;
                    if (input.value.trim()) {
                      await db.participants.add({
                        id: crypto.randomUUID(),
                        eventId,
                        name: input.value.trim()
                      });
                      input.value = '';
                    }
                  }}
                  className="flex gap-2 mt-4"
                >
                  <input 
                    data-testid="participant-input"
                    name="name" 
                    placeholder={t('participants.participantName')}
                    className="flex-1 h-12 rounded-[16px] bg-zinc-50 border border-transparent px-4 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-200 focus:ring-2 focus:ring-zinc-200 transition-all"
                    required 
                  />
                  <Button data-testid="add-participant-button" type="submit" variant="primary">{t('participants.add')}</Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for Expenses */}
      {activeTab === 'expenses' && participants.length > 0 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6"
        >
          <Button 
            data-testid="fab-add-expense"
            className="w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] !p-0 bg-zinc-900 hover:bg-zinc-800"
            onClick={() => router.push(`/event/${eventId}/add-expense`)}
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </motion.div>
      )}

      <ConfirmModal 
        isOpen={deleteExpenseId !== null}
        onClose={() => setDeleteExpenseId(null)}
        onConfirm={confirmDeleteExpense}
        title={t('modals.deleteExpense.title')}
        description={t('modals.deleteExpense.description')}
      />

      <ConfirmModal 
        isOpen={deleteParticipantData !== null}
        onClose={() => setDeleteParticipantData(null)}
        onConfirm={confirmDeleteParticipant}
        title={t('modals.deleteParticipant.title', { name: deleteParticipantData?.name })}
        description={t('modals.deleteParticipant.description')}
      />
    </div>
  );
}

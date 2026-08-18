import { useState, useEffect } from 'react';
import { supabase, Event, Participant, Expense } from '@/lib/supabase';

export function useEventData(eventId: string) {
  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (!eventId) return;

    // Fetch initial data
    const fetchData = async () => {
      const [
        { data: eventData },
        { data: participantsData },
        { data: expensesData }
      ] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('participants').select('*').eq('eventId', eventId),
        supabase.from('expenses').select('*').eq('eventId', eventId).order('date', { ascending: false })
      ]);

      setEvent(eventData || null);
      setParticipants(participantsData || []);
      setExpenses(expensesData || []);
    };

    fetchData();

    // Subscribe to realtime changes
    const channel = supabase.channel(`event_${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `id=eq.${eventId}` }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setEvent(payload.new as Event);
        } else if (payload.eventType === 'DELETE') {
          setEvent(null);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `eventId=eq.${eventId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants(prev => [...prev, payload.new as Participant]);
        } else if (payload.eventType === 'UPDATE') {
          setParticipants(prev => prev.map(p => p.id === payload.new.id ? payload.new as Participant : p));
        } else if (payload.eventType === 'DELETE') {
          setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `eventId=eq.${eventId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setExpenses(prev => [payload.new as Expense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else if (payload.eventType === 'UPDATE') {
          setExpenses(prev => prev.map(e => e.id === payload.new.id ? payload.new as Expense : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else if (payload.eventType === 'DELETE') {
          setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return {
    event,
    participants,
    expenses
  };
}

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useEventData(eventId: string) {
  const event = useLiveQuery(() => db.events.get(eventId), [eventId]);
  
  const participantsQuery = useLiveQuery(
    () => db.participants.where({ eventId }).toArray(), 
    [eventId]
  );
  
  const expensesQuery = useLiveQuery(
    () => db.expenses.where({ eventId }).reverse().sortBy('createdAt'), 
    [eventId]
  );

  const participants = useMemo(() => participantsQuery || [], [participantsQuery]);
  const expenses = useMemo(() => expensesQuery || [], [expensesQuery]);

  return {
    event,
    participants,
    expenses
  };
}

import Dexie, { type EntityTable } from 'dexie';

export interface Participant {
  id: string;
  name: string;
  eventId: string;
}

export interface Expense {
  id: string;
  eventId: string;
  title: string;
  amount: number;
  currency: string;
  payerId: string;
  involvedIds: string[]; // array of participant ids
  date: Date;
  isPayment?: boolean;
}

export interface Event {
  id: string;
  title: string;
  createdAt: Date;
  baseCurrency?: string;
}

const db = new Dexie('ExpenseSplitterDB') as Dexie & {
  events: EntityTable<Event, 'id'>;
  participants: EntityTable<Participant, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
};

db.version(1).stores({
  events: 'id, title',
  participants: 'id, eventId',
  expenses: 'id, eventId, payerId'
});

export { db };

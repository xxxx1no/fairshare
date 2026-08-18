import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Event = {
  id: string;
  title: string;
  baseCurrency?: string;
  createdAt: string;
};

export type Participant = {
  id: string;
  eventId: string;
  name: string;
};

export type Expense = {
  id: string;
  eventId: string;
  title: string;
  amount: number;
  currency: string;
  payerId: string;
  involvedIds: string[];
  date: string;
  isPayment?: boolean;
};

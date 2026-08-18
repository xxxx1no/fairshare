import { Expense, Participant } from './db';

export interface SettlementTransaction {
  from: string; // participant id
  to: string; // participant id
  amount: number;
  currency: string;
}

export function calculateSettlements(
  participants: Participant[],
  expenses: Expense[]
): SettlementTransaction[] {
  const transactions: SettlementTransaction[] = [];
  
  // Group expenses by currency
  const expensesByCurrency = expenses.reduce((acc, exp) => {
    if (!acc[exp.currency]) acc[exp.currency] = [];
    acc[exp.currency].push(exp);
    return acc;
  }, {} as Record<string, Expense[]>);

  for (const currency of Object.keys(expensesByCurrency)) {
    const curExpenses = expensesByCurrency[currency];
    const balances: Record<string, number> = {};

    // Initialize balances
    participants.forEach(p => {
      balances[p.id] = 0;
    });

    // Calculate net balances for this currency
    curExpenses.forEach(exp => {
      // Payer gets positive balance (creditor)
      if (balances[exp.payerId] !== undefined) {
        balances[exp.payerId] += exp.amount;
      }

      // Involved participants get negative balance (debtors)
      const splitAmount = exp.amount / exp.involvedIds.length;
      exp.involvedIds.forEach(id => {
        if (balances[id] !== undefined) {
          balances[id] -= splitAmount;
        }
      });
    });

    // Separate into debtors and creditors
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.keys(balances).forEach(id => {
      const balance = Math.round(balances[id] * 100) / 100; // Round to 2 decimal places to avoid float issues
      if (balance < 0) {
        debtors.push({ id, amount: -balance });
      } else if (balance > 0) {
        creditors.push({ id, amount: balance });
      }
    });

    // Sort descending by amount to minimize transactions
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let d = 0;
    let c = 0;

    // Greedy matching
    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];

      const minAmount = Math.min(debtor.amount, creditor.amount);

      transactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(minAmount * 100) / 100,
        currency
      });

      debtor.amount -= minAmount;
      creditor.amount -= minAmount;

      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }
  }

  return transactions;
}

export default async function AddExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { default: AddExpenseClient } = await import('./AddExpenseClient');
  
  return <AddExpenseClient eventId={resolvedParams.id} />;
}

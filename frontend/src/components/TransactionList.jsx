import client from '../api/client';

export default function TransactionList({ transactions, onChanged }) {
  const handleDelete = async (id) => {
    await client.delete(`/transactions/${id}/`);
    onChanged();
  };

  if (transactions.length === 0) {
    return <p className="text-slate-400 text-sm py-8 text-center">No transactions yet — add your first one above.</p>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-3 group">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: t.category_kind === 'income' ? '#22c55e' : '#f97316' }}
            />
            <div>
              <p className="text-sm font-medium text-slate-800">
                {t.category_name}
                {t.note && <span className="text-slate-400 font-normal"> · {t.note}</span>}
              </p>
              <p className="text-xs text-slate-400">
                {t.date}
                {t.need_or_want !== 'na' && ` · ${t.need_or_want}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-semibold ${
                t.category_kind === 'income' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {t.category_kind === 'income' ? '+' : '-'}
              {t.currency} {parseFloat(t.amount).toFixed(2)}
            </span>
            <button
              onClick={() => handleDelete(t.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 text-xs transition-opacity"
              aria-label="Delete transaction"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

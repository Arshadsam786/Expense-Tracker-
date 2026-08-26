import { useState } from 'react';
import client from '../api/client';

const TODAY = new Date().toISOString().slice(0, 10);

export default function QuickAddForm({ categories, onAdded }) {
  const [kind, setKind] = useState('expense');
  const [form, setForm] = useState({
    category: '',
    amount: '',
    date: TODAY,
    note: '',
    need_or_want: 'na',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const filteredCategories = categories.filter((c) => c.kind === kind);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      setError('Pick a category.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await client.post('/transactions/', {
        ...form,
        category: Number(form.category),
        amount: form.amount,
      });
      setForm({ category: '', amount: '', date: TODAY, note: '', need_or_want: 'na' });
      onAdded();
    } catch (err) {
      setError('Could not save. Check the amount and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Quick add</h2>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 text-sm">
          <button
            type="button"
            onClick={() => setKind('expense')}
            className={`px-3 py-1 ${kind === 'expense' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600'}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setKind('income')}
            className={`px-3 py-1 ${kind === 'income' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          autoFocus
        />

        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Category…</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          max={TODAY}
          required
        />

        <input
          type="text"
          placeholder="Note (optional)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        {kind === 'expense' && (
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.need_or_want}
            onChange={(e) => setForm({ ...form, need_or_want: e.target.value })}
          >
            <option value="na">Need or want?</option>
            <option value="need">Need</option>
            <option value="want">Want</option>
          </select>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Add transaction'}
      </button>
    </form>
  );
}

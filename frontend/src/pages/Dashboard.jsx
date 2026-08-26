import { useCallback, useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import QuickAddForm from '../components/QuickAddForm';
import TransactionList from '../components/TransactionList';
import CategoryPieChart from '../components/CategoryPieChart';

const now = new Date();

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [catRes, txRes, summaryRes] = await Promise.all([
      client.get('/categories/'),
      client.get('/transactions/', { params: { page_size: 50 } }),
      client.get('/transactions/summary/', { params: { year, month } }),
    ]);
    setCategories(catRes.data.results ?? catRes.data);
    setTransactions(txRes.data.results ?? txRes.data);
    setSummary(summaryRes.data);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  }

  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-900">Expense Tracker</h1>
            <p className="text-xs text-slate-400">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Hi, {user?.username}</span>
            <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-700">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <SummaryCard label="Income" value={summary?.total_income} currency={user?.default_currency} tone="emerald" />
            <SummaryCard label="Expense" value={summary?.total_expense} currency={user?.default_currency} tone="rose" />
            <SummaryCard label="Net" value={summary?.net} currency={user?.default_currency} tone={summary?.net >= 0 ? 'emerald' : 'rose'} />
          </div>
          <QuickAddForm categories={categories} onAdded={loadAll} />
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-2">Where your money went</h2>
            <CategoryPieChart data={summary?.by_category} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-2">Recent transactions</h2>
            <TransactionList transactions={transactions} onChanged={loadAll} />
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, currency, tone }) {
  const toneClasses = {
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${toneClasses[tone] || 'text-slate-900'}`}>
        {currency} {Number(value ?? 0).toFixed(2)}
      </p>
    </div>
  );
}

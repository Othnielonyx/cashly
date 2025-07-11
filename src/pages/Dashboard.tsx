import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { User, onAuthStateChanged } from 'firebase/auth';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
);

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [sortType, setSortType] = useState<'date' | 'amount' | 'type' | 'none'>('none');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate('/');
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleAddTransaction = async () => {
    if (!description || !amount) return;

    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    const newTransaction = {
      type,
      description,
      amount: type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount),
      date: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
    setTransactions((prev) => [{ id: docRef.id, ...newTransaction }, ...prev]);
    setDescription('');
    setAmount('');
    setType('income');
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(collection(db, 'transactions'), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      const data: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...(doc.data() as Omit<Transaction, 'id'>) });
      });
      setTransactions(data);
    };

    fetchTransactions();
  }, []);

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortType === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortType === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
    if (sortType === 'type') return a.type.localeCompare(b.type);
    return 0;
  });

  const incomeTotal = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  const balance = incomeTotal + expenseTotal;

  const pieData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [incomeTotal, Math.abs(expenseTotal)],
      backgroundColor: ['#16a34a', '#dc2626'],
    }],
  };

  let trendData = [];
  let cumulative = 0;
  for (let tx of transactions) {
    cumulative += tx.amount;
    trendData.push(cumulative);
  }

  const lineData = {
    labels: transactions.map((t, index) => index + 1),
    datasets: [
      {
        label: 'Financial Trend',
        data: trendData,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f670',
        fill: true,
      },
    ],
  };

  const formatAmount = (value: number) =>
    value.toLocaleString('en-NG', { minimumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cashly Dashboard</h1>
          {user && (
            <div className="flex items-center gap-2 mt-1">
              <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full" />
              <span className="text-sm">{user.displayName || user.email}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="text-gray-600">Total Income</h4>
          <p className="text-lg text-green-600 font-bold">₦{formatAmount(incomeTotal)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="text-gray-600">Total Expenses</h4>
          <p className="text-lg text-red-600 font-bold">₦{formatAmount(Math.abs(expenseTotal))}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="text-gray-600">Current Balance</h4>
          <p className="text-lg font-bold">₦{formatAmount(balance)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="border px-3 py-2 rounded w-full sm:w-40"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => {
              const value = e.target.value.replace(/,/g, '');
              if (!isNaN(Number(value))) {
                const formatted = Number(value).toLocaleString();
                setAmount(formatted);
              } else {
                setAmount('');
              }
            }}
            className="border px-3 py-2 rounded w-full sm:w-40"
          />
          <button
            onClick={handleAddTransaction}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-4 flex-wrap">
        <label className="font-medium">Sort By:</label>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as any)}
          className="border px-3 py-2 rounded"
        >
          <option value="none">None</option>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="type">Type</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6 overflow-auto max-h-[300px]">
        <h3 className="text-lg font-semibold mb-2">Transactions</h3>
        <ul className="space-y-2">
          {sortedTransactions.map((t) => (
            <li key={t.id} className="border-b pb-2">
              <span className={`font-semibold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                [{t.type}]
              </span>{' '}
              {t.description} — ₦{formatAmount(Math.abs(t.amount))} on {new Date(t.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Income vs Expenses</h3>
          <Pie data={pieData} />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Financial Trend</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

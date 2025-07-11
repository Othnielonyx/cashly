import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

interface Transaction {
  id: string;
  text: string;
  amount: number;
  createdAt: any;
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const transactionQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(transactionQuery);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      setTransactions(data);
    };

    fetchTransactions();
  }, []);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            <strong>{transaction.text}</strong>: {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;

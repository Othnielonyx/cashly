import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const TransactionForm: React.FC = () => {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || amount === '') {
      alert('Please enter both a description and amount.');
      return;
    }

    const newTransaction = {
      text,
      amount: +amount,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, 'transactions'), newTransaction);
      console.log("✅ Transaction added:", newTransaction);
    } catch (error) {
      console.error("❌ Error adding transaction:", error);
    }

    setText('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Transaction</h2>

      <div>
        <label>Description</label><br />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Salary, Groceries"
        />
      </div>

      <div>
        <label>Amount (use negative for expenses)</label><br />
        <input
          type="number"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === '' ? '' : Number(e.target.value))
          }
        />
      </div>

      <button type="submit">Add</button>
    </form>
  );
};

export default TransactionForm;

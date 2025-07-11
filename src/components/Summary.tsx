import React, {useEffect, useState} from "react";
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

interface Transaction {
  id: string;
  text: string;
  amount: number;
  createdAt: any;
}
const Summary: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);

    useEffect(() => {
      const fetchTransactions = async () => {
        const summaryQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(summaryQuery);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];

        let totalIncome = 0;
        let totalExpenses = 0; 

        data.forEach(transaction => {
          if (transaction.amount > 0) {
            totalIncome += transaction.amount;
          } else {
            totalExpenses += Math.abs(transaction.amount);
          }
        });
        setBalance(totalIncome - totalExpenses);
        setIncome(totalIncome);
        setExpenses(totalExpenses);
    };
      fetchTransactions();
    }, []);

    return (
        <div>
            <h2>Summary</h2>
            <div>
                <h3>Balance: ${balance}</h3>
                <p>Income: ${income}</p>
                <p>Expenses: ${expenses}</p>
            </div>
        </div>
    );
};

export default Summary;
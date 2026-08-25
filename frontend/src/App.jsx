import { useState, useEffect, useCallback } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import { getExpenses, addExpense, deleteExpense, convertAmount } from "./api";
import "./App.css";

// supported currencies must match with ALLOWED_CURRENCIES of backend
const CURRENCIES = ["USD", "NPR", "EUR", "INR", "GBP", "AUD", "JPY", "CNY"];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [homeCurrency, setHomeCurrency] = useState("INR");
  const [convertedExpenses, setConvertedExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [converting, setConverting] = useState(false);

  // Fetch all expenses from backend 
  async function loadExpenses() {
    setLoadingExpenses(true);
    setLoadError(null);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoadingExpenses(false);
    }
  }

  // Convert expenses to selected home currency using /convert endpoint
  const convertAllExpenses = useCallback(async () => {
    if (expenses.length === 0) {
      setConvertedExpenses([]);
      return;
    }

    setConverting(true);

    const results = [];
    for (const expense of expenses) {
      // Skip API call if expense is already in home currency
      if (expense.currency === homeCurrency) {
        results.push({
          ...expense,
          convertedAmount: expense.amount,
          conversionError: null,
        });
        continue;
      }
      try {
        const result = await convertAmount(
          expense.currency,
          homeCurrency,
          expense.amount
        );
        results.push({
          ...expense,
          convertedAmount: result.convertedAmount,
          conversionError: null,
        });
      } catch (err) {
        results.push({
          ...expense,
          convertedAmount: null,
          conversionError: err.message,
        });
      }
    }

    setConvertedExpenses(results);
    setConverting(false);
  }, [expenses, homeCurrency]);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    convertAllExpenses();
  }, [expenses, homeCurrency, convertAllExpenses]);

  // Calculate total and count failed conversions
  let total = 0;
  let anyConversionFailed = false;
  let failedCount = 0;
  for (const expense of convertedExpenses) {
    if (expense.convertedAmount !== null) {
      total += expense.convertedAmount;
    } else {
      anyConversionFailed = true;
      failedCount++;
    }
  }

  // add new expense to backend and then refresh list
  async function handleAdd(expenseInput) {
    const newExpense = await addExpense(expenseInput);
    setExpenses([...expenses, newExpense]);
  }

  // delete expense
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((exp) => exp.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  }

  // retry conversion for a single expense
  async function retryConvert(expense) {
    setConverting(true);
    try {
      const result = await convertAmount(expense.currency, homeCurrency, expense.amount);
      setConvertedExpenses(prev =>
        prev.map(e => e.id === expense.id
          ? { ...e, convertedAmount: result.convertedAmount, conversionError: null }
          : e
        )
      );
    } catch (err) {
      setConvertedExpenses(prev =>
        prev.map(e => e.id === expense.id
          ? { ...e, convertedAmount: null, conversionError: err.message }
          : e
        )
      );
    }
    setConverting(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Currency & Expense Snapshot</h1>
        <div className="home-currency-select">
          <label htmlFor="home-currency">Home currency</label>
          <select
            id="home-currency"
            value={homeCurrency}
            onChange={(e) => setHomeCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </header>

      <ExpenseForm onAdd={handleAdd} />

      {loadingExpenses && <p>Loading expenses.....</p>}
      {loadError && (
        <p className="form-error">Failed to load expenses: {loadError}</p>
      )}

      {!loadingExpenses && !loadError && (
        <ExpenseList
          expenses={convertedExpenses}
          converting={converting}
          homeCurrency={homeCurrency}
          onDelete={handleDelete}
          onRetry={retryConvert}
          total={total}
          anyConversionFailed={anyConversionFailed}
          failedCount={failedCount}
        />
      )}
    </div>
  );
}

export default App;
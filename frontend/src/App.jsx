import { useState, useEffect, useCallback } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import { getExpenses, addExpense, deleteExpense, convertAmount } from "./api";
import "./App.css";

// supported currencies must match with ALLOWED_CURRENCIES of backend
const CURRENCIES = ["USD", "NPR", "EUR", "INR", "GBP"];

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

  // Calculate total 
  let total = 0;
  let anyConversionFailed = false;
  for (const expense of convertedExpenses) {
    if (expense.convertedAmount !== null) {
      total += expense.convertedAmount;
    } else {
      anyConversionFailed = true;
    }
  }

  // add new expense to backend and then refresh list
  async function handleAdd(expenseInput) {
    const newExpense = await addExpense(expenseInput);
    setExpenses([...expenses, newExpense]);
  }

  // delete expense 
  async function handleDelete(id) {
    await deleteExpense(id);
    setExpenses(expenses.filter((exp) => exp.id !== id));
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
          total={total}
          anyConversionFailed={anyConversionFailed}
        />
      )}
    </div>
  );
}

export default App;
import { useState } from "react";

const CURRENCIES = ["USD", "NPR", "EUR", "INR", "GBP", "AUD", "JPY", "CNY"];

export default function ExpenseForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Validate inputs POST to /expenses and reset form on success
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !amount) {
      setError("Please fill in both title and amount.");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        amount: Number(amount),
        currency,
      });
      setTitle("");
      setAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          placeholder="Expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="1"
          disabled={submitting}
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          disabled={submitting}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Expense"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
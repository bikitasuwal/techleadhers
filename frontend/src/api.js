// All API calls go through Vite proxy to Express backend
export async function getExpenses() {
  const res = await fetch("/expenses");
  if (!res.ok) throw new Error("Failed to load expenses");
  return res.json();
}

export async function addExpense(expense) {
  const res = await fetch("/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data.details ? data.details.join(", ") : data.error;
    throw new Error(message || "Failed to add expense");
  }
  return data;
}

export async function deleteExpense(id) {
  const res = await fetch(`/expenses/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete expense");
  }
}

// Calls /convert?from=X&to=Y&amount=Z — server fetches rate from frankfurter.dev v2
export async function convertAmount(from, to, amount) {
  const res = await fetch(
    `/convert?from=${from}&to=${to}&amount=${amount}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Conversion failed");
  }
  return data;
}

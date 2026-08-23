// Backend base URL — all API calls go through Express server
const BASE_URL = "http://localhost:5000";

export async function getExpenses() {
  const res = await fetch(`${BASE_URL}/expenses`);
  if (!res.ok) throw new Error("Failed to load expenses");
  return res.json();
}

export async function addExpense(expense) {
  const res = await fetch(`${BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  const data = await res.json();
  if (!res.ok) {
    // Backend returns error details if validation fails
    const message = data.details ? data.details.join(", ") : data.error;
    throw new Error(message || "Failed to add expense");
  }
  return data;
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/expenses/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete expense");
  }
}

// Calls /convert?from=X&to=Y&amount=Z — server proxies to frankfurter.app
export async function convertAmount(from, to, amount) {
  const res = await fetch(
    `${BASE_URL}/convert?from=${from}&to=${to}&amount=${amount}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Conversion failed");
  }
  return data; 
}
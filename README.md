# Currency & Expense Snapshot

A small full-stack app where users can log expenses in different currencies and see them converted into a single "home currency," with a running total.

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React (Vite)
- **Storage:** In-memory (no database)
- **Exchange Rate API:** [frankfurter.dev](https://frankfurter.dev) v2 (no API key required)

## Setup & Run

### Backend

```bash
cd backend
npm install
npm start        # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # runs on http://localhost:5173
```

The frontend uses Vite's dev server — API calls to `/expenses` and `/convert` are forwarded to `localhost:5000` via Vite proxy.

## API Reference

### Expenses (CRUD)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/expenses` | Return all expenses |
| `POST` | `/expenses` | Add a new expense |
| `DELETE` | `/expenses/:id` | Delete an expense by id |

**POST /expenses — Request Body:**

```json
{
  "title": "Lunch",
  "amount": 12.50,
  "currency": "USD"
}
```

**Supported currencies:** USD, NPR, EUR, INR, GBP, AUD, JPY, CNY

**Validation:** Returns `400` with error details if title is empty, amount is missing/non-positive, or currency is invalid.

### Currency Conversion

```
GET /convert?from=USD&to=INR&amount=100
```

**Response:**

```json
{
  "from": "USD",
  "to": "INR",
  "amount": 100,
  "convertedAmount": 9574.3,
  "rate": 95.743
}
```

## Exchange Rate API

Uses the [Frankfurter v2 API](https://frankfurter.dev) (`api.frankfurter.dev`), which provides exchange rates from 84 central banks covering 201 currencies. No API key is required.

The backend fetches the rate from the API and performs the conversion server-side. The frontend never calls the external API directly.

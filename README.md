# Currency & Expense Snapshot

A full-stack expense tracker that converts and totals expenses across multiple currencies into one home currency.

## Features

- Add and delete expenses in 8 currencies (USD, NPR, EUR, INR, GBP, AUD, JPY, CNY)
- Real-time conversion to a selected home currency with running total
- Delete confirmation dialog before removing expenses
- Retry button to reattempt failed conversions
- 5-hour exchange rate cache which reduces API calls and provides offline fallback
- Responsive design, works on mobile and desktop

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
  "title": "dinner",
  "amount": 25,
  "currency": "USD"
}
```

### Currency Conversion

```
GET /convert?from=USD&to=NPR&amount=100
```

**Response:**

```json
{
  "from": "USD",
  "to": "NPR",
  "amount": 100,
  "convertedAmount": 15312,
  "rate": 153.12
}
```

### Rate Caching

Exchange rates are cached in memory for 5 hours after each successful API call. This means:

- Subsequent conversions for the same currency pair use the cached rate instantly
- If the external API is temporarily unavailable, the app falls back to the most recently cached rate
- Rates refresh automatically after the cache expires

## Limitations

- **Data not persistent** - expenses are stored in memory and lost when the server restarts
- **Limited currencies** - only 8 currencies supported 
- **External API dependency** - exchange rates depend on Frankfurter API which may be slow or temporarily unavailable

## Assumptions

- 8 currencies (USD, NPR, EUR, INR, GBP, AUD, JPY, CNY) cover the main use cases for this project
- In-memory storage is fine since the assignment says data doesn't need to survive a restart
- No auth needed as it is a single-user app running on localhost

## Improvements with More Time

- Save expenses to a database so they don't disappear on server restart
- Show proper currency symbols instead of just codes
- Add tests for the API routes and frontend components
- Add search/filter to find expenses by currency or date
- Add date picker (calender) to select specific date

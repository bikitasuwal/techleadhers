# Currency & Expense Snapshot

A small full-stack app where users can log expenses in different currencies and see them converted into a single "home currency," with a running total.

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React (Vite)
- **Storage:** In-memory (no database)
- **Exchange Rate API:** [frankfurter.app](https://frankfurter.app) (no API key required)

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
  "amount": 20,
  "currency": "USD"
}
```

**Supported currencies:** USD, NPR, EUR, INR, GBP


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
  "convertedAmount": 8350.5,
  "rate": 83.505
}
```


const express = require("express");
const crypto = require("crypto");
const router = express.Router();

// No database so this array resets on every server restart
let expenses = [];

// supported set for validation
const ALLOWED_CURRENCIES = ["USD", "NPR", "EUR", "INR", "GBP", "AUD", "JPY", "CNY"];

function validateExpenseInput(body) {
  const errors = [];
  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    errors.push("title is required and must be a non-empty string");
  }

  if (
    body.amount === undefined ||
    body.amount === null ||
    typeof body.amount !== "number" ||
    isNaN(body.amount) ||
    body.amount <= 0
  ) {
    errors.push("amount is required and must be a positive number");
  }

  if (
    !body.currency ||
    typeof body.currency !== "string" ||
    !ALLOWED_CURRENCIES.includes(body.currency.toUpperCase())
  ) {
    errors.push(
      `currency is required and must be one of: ${ALLOWED_CURRENCIES.join(", ")}`
    );
  }

  return errors;
}

// GET /expenses which return all expenses
router.get("/", (req, res) => {
  res.json(expenses);
});

// POST /expenses which add a new expense
router.post("/", (req, res) => {
  const errors = validateExpenseInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const newExpense = {
    id: crypto.randomUUID(),
    title: req.body.title.trim(),
    amount: req.body.amount,
    currency: req.body.currency.toUpperCase(),
    date: req.body.date ? new Date(req.body.date).toISOString() : new Date().toISOString(),
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

// DELETE /expenses/id which remove an expense by id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const existingLength = expenses.length;

  expenses = expenses.filter((expense) => expense.id !== id);

  if (expenses.length === existingLength) {
    return res.status(404).json({ error: `No expense found with id ${id}` });
  }

  res.status(204).send();
});

module.exports = router;
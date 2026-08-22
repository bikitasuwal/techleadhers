const express = require("express");
const cors = require("cors");

const expensesRouter = require("./routes/expenses");
const convertRouter = require("./routes/convert");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Expense tracker API is running" });
});

// /expenses and convert route
app.use("/expenses", expensesRouter);
app.use("/convert", convertRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
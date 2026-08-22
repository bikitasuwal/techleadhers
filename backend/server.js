const express = require("express");
const cors = require("cors");

const expensesRouter = require("./routes/expenses");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Expense tracker API is running" });
});

// /expense endpoint
app.use("/expenses", expensesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
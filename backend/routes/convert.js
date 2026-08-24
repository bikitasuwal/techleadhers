const express = require("express");
const router = express.Router();

const ALLOWED_CURRENCIES = ["USD", "NPR", "EUR", "INR", "GBP", "AUD", "JPY", "CNY"];

router.get("/", async (req, res) => {
  const { from, to, amount } = req.query;
  // Validate query params before calling the api
  if (!from || !to || amount === undefined) {
    return res.status(400).json({
      error: "Missing required query params: from, to, amount", 
    });
  }

  const fromCurrency = from.toUpperCase();
  const toCurrency = to.toUpperCase();
  const parsedAmount = Number(amount);

  if (!ALLOWED_CURRENCIES.includes(fromCurrency) || !ALLOWED_CURRENCIES.includes(toCurrency)) {
    return res.status(400).json({
      error: `from/to must be one of: ${ALLOWED_CURRENCIES.join(", ")}`,
    });
  }

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  // Same currency — no API call needed
  if (fromCurrency === toCurrency) {
    return res.json({
      from: fromCurrency,
      to: toCurrency,
      amount: parsedAmount,
      convertedAmount: parsedAmount,
      rate: 1,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); 

  try {
    // v2 API: get the rate, then multiply by amount ourselves
    const url = `https://api.frankfurter.dev/v2/rate/${fromCurrency}/${toCurrency}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(502).json({
        error: "Currency conversion service returned an error. Please try again.",
      });
    }

    const data = await response.json();
    const rate = data.rate;

    if (rate === undefined) {
      return res.status(502).json({
        error: "Currency conversion service returned an unexpected response.",
      });
    }

    const convertedAmount = parsedAmount * rate;

    return res.json({
      from: fromCurrency,
      to: toCurrency,
      amount: parsedAmount,
      convertedAmount,
      rate,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Conversion API error:", err.message);
    return res.status(503).json({
      error: "Currency conversion service is currently unavailable. Please try again later.",
    });
  }
});

module.exports = router;

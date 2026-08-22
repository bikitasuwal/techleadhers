const express = require("express");
const router = express.Router();

const ALLOWED_CURRENCIES = ["USD", "NPR", "EUR", "INR", "GBP"];

// clear error message instead of a generic one
const NOT_SUPPORTED_BY_PROVIDER = ["NPR"];

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

  // Catching known provider gaps before calling the external api
  if (
    NOT_SUPPORTED_BY_PROVIDER.includes(fromCurrency) ||
    NOT_SUPPORTED_BY_PROVIDER.includes(toCurrency)
  ) {
    const unsupported = NOT_SUPPORTED_BY_PROVIDER.includes(fromCurrency)
      ? fromCurrency
      : toCurrency;
    return res.status(422).json({
      error: `${unsupported} is not supported by our exchange rate provider (frankfurter.app uses ECB reference rates).`,
    });
  }

  // Frankfurter doesn't support converting a currency to itself in some cases
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
    const url = `https://api.frankfurter.app/latest?amount=${parsedAmount}&from=${fromCurrency}&to=${toCurrency}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Frankfurter responds but with error status
      return res.status(502).json({
        error: "Currency conversion service returned an error. Please try again.",
      });
    }

    const data = await response.json();
    const convertedAmount = data.rates[toCurrency];

    if (convertedAmount === undefined) {
      return res.status(502).json({
        error: "Currency conversion service returned an unexpected response.",
      });
    }

    return res.json({
      from: fromCurrency,
      to: toCurrency,
      amount: parsedAmount,
      convertedAmount,
      rate: convertedAmount / parsedAmount,
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
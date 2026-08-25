const express = require("express");
const router = express.Router();

const ALLOWED_CURRENCIES = ["USD", "NPR", "EUR", "INR", "GBP", "AUD", "JPY", "CNY"];

// Cache stores rates keyed by "FROM_TO" e.g. "USD_INR"
const rateCache = {};
const CACHE_TTL_MS = 5 * 60 * 60 * 1000; // 5 hours

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

  const cacheKey = `${fromCurrency}_${toCurrency}`;
  const cached = rateCache[cacheKey];
  const cacheFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL_MS);

  // Use cached rate if fresh
  if (cacheFresh) {
    return res.json({
      from: fromCurrency,
      to: toCurrency,
      amount: parsedAmount,
      convertedAmount: parsedAmount * cached.rate,
      rate: cached.rate,
      cached: true,
    });
  }

  // Fetch fresh rate from API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.frankfurter.dev/v2/rate/${fromCurrency}/${toCurrency}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("API returned error");
    }

    const data = await response.json();
    const rate = data.rate;

    if (rate === undefined) {
      throw new Error("Unexpected response");
    }

    // Save to cache
    rateCache[cacheKey] = { rate, timestamp: Date.now() };

    return res.json({
      from: fromCurrency,
      to: toCurrency,
      amount: parsedAmount,
      convertedAmount: parsedAmount * rate,
      rate,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Conversion API error:", err.message);

    // Fallback: use stale cache if API fails
    if (cached) {
      return res.json({
        from: fromCurrency,
        to: toCurrency,
        amount: parsedAmount,
        convertedAmount: parsedAmount * cached.rate,
        rate: cached.rate,
        cached: true,
      });
    }

    return res.status(503).json({
      error: "Currency conversion service is currently unavailable. Please try again later.",
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

let stripe = null;
let stripeError = null;

try {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && typeof stripeKey === 'string' && stripeKey.trim()) {
    const trimmedKey = stripeKey.trim();
    if (trimmedKey.startsWith('sk_test_') || trimmedKey.startsWith('sk_live_')) {
      stripe = new Stripe(trimmedKey, {
        apiVersion: '2024-12-18.acacia',
      });
      console.log("✅ Stripe initialized successfully");
    } else {
      stripeError = "Invalid STRIPE_SECRET_KEY format. Must start with sk_test_ or sk_live_";
      console.error(`❌ ${stripeError}`);
    }
  } else {
    stripeError = "STRIPE_SECRET_KEY not set";
    console.warn(`⚠️ ${stripeError} - Stripe payment will not work`);
  }
} catch (err) {
  stripeError = err.message || "Failed to initialize Stripe";
  console.error(`❌ ${stripeError}`);
  console.error("Error stack:", err.stack);
}

router.post("/create-intent", async (req, res) => {
  try {
    if (!stripe) {
      const errorMsg = stripeError || "Stripe is not configured";
      console.error(`❌ ${errorMsg}`);
      return res.status(503).json({ 
        message: "Payment service is temporarily unavailable",
        error: process.env.NODE_ENV === 'development' ? errorMsg : undefined
      });
    }

    const { amount, currency } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Missing or invalid amount" });
    }

    const stripeCurrency = currency === "vnd" ? "usd" : (currency || "usd");
    const stripeAmount = currency === "vnd" 
      ? Math.round(Number(amount) / 25000 * 100) 
      : Math.round(Number(amount) * 100);

    if (stripeAmount < 50) {
      return res.status(400).json({ message: "Amount too small. Minimum is 50 cents" });
    }

    console.log(`Creating payment intent: ${stripeAmount} ${stripeCurrency}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: stripeCurrency,
      payment_method_types: ['card'],
    });

    console.log(`✅ Payment intent created: ${paymentIntent.id}`);

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (err) {
    console.error("❌ Stripe create-intent error:", err.message);
    console.error("Error type:", err.type);
    console.error("Error code:", err.code);
    console.error("Error stack:", err.stack);
    
    const errorMessage = err.message || "Failed to create payment intent";
    return res.status(500).json({ 
      message: "Payment processing error",
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Missing paymentIntentId" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.json({
      success: paymentIntent.status === "succeeded",
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      message: paymentIntent.status === "succeeded" 
        ? "Payment verified successfully" 
        : `Payment status: ${paymentIntent.status}`,
    });
  } catch (err) {
    return res.status(500).json({ message: "Stripe verify error", error: err.message });
  }
});

module.exports = router;

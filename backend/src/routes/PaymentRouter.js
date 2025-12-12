const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

let stripe = null;

try {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && stripeKey.trim()) {
    if (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_')) {
      stripe = new Stripe(stripeKey.trim());
      console.log("✅ Stripe initialized successfully");
    } else {
      console.error("❌ Invalid STRIPE_SECRET_KEY format. Must start with sk_test_ or sk_live_");
    }
  } else {
    console.warn("⚠️ STRIPE_SECRET_KEY not set - Stripe payment will not work");
  }
} catch (err) {
  console.error("❌ Failed to initialize Stripe:", err.message);
}

router.post("/create-intent", async (req, res) => {
  try {
    if (!stripe) {
      console.error("❌ Stripe is not configured - STRIPE_SECRET_KEY missing or invalid");
      return res.status(503).json({ 
        message: "Payment service is temporarily unavailable. Please try again later." 
      });
    }

    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Missing amount" });
    }

    const stripeCurrency = currency === "vnd" ? "usd" : (currency || "usd");
    const stripeAmount = currency === "vnd" 
      ? Math.round(amount / 25000 * 100) 
      : Math.round(amount * 100);

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
    console.error("Error details:", err);
    return res.status(500).json({ 
      message: "Stripe error", 
      error: err.message 
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

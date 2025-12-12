const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

router.post("/create-intent", async (req, res) => {
  try {
    if (!stripe) {
      console.error("❌ Stripe is not configured - STRIPE_SECRET_KEY missing");
      return res.status(500).json({ message: "Stripe is not configured" });
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

import express from "express";
import {
  createOrderController,
  razorpayWebhookController,
  verifyPaymentController,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Create Razorpay Order
router.post("/create-order", createOrderController);

// Verify Payment Signature
router.post("/verify-payment", verifyPaymentController);

// Razorpay Webhook
router.post(
  "/webhook",
  razorpayWebhookController,
);

export default router;

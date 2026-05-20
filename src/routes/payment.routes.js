import express from "express";
import {
  createOrderController,
  verifyPaymentController,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Create Razorpay Order
router.post("/create-order", createOrderController);

// Verify Payment Signature
router.post("/verify-payment", verifyPaymentController);

export default router;

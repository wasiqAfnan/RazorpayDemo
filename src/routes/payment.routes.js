import express from "express";
import {
  createOrderController,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Create Razorpay Order
router.post("/create-order", createOrderController);

export default router;

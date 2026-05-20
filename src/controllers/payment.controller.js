import { createRazorpayOrder } from "../services/payment.service.js";
import crypto from "crypto";

// Create Razorpay Order
export const createOrderController = async (req, res) => {
  try {
    const { amount } = req.body;

    // Check if amount is present
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    // Check if amount is a number
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Create Razorpay Order
    const order = await createRazorpayOrder({
      amount: numericAmount * 100, // Convert amount to 100 for Razorpay
      currency: "INR",
    });

    // Sucess Response
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};
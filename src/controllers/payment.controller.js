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

export const verifyPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "All payment fields are required",
      });
    }

    // Generate Signature
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    // Compare generated signature with the one received from Razorpay
    const isAuthentic = generatedSignature === razorpay_signature;

    // handle invalid signature
    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    /*
        TODO:Store successful payment in DB
    */
    // Example:
    // payment_id
    // order_id
    // payment status
    // user info

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        razorpay_order_id,
        razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

export const razorpayWebhookController = async (req, res) => {
  try {
    // Get Razorpay Signature from headers
    const razorpaySignature = req.headers["x-razorpay-signature"];

    // Generate Expected Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    // Verify Webhook Signature
    const isAuthentic = generatedSignature === razorpaySignature;

    // Handle Invalid Signature
    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // Convert Raw Buffer to JSON
    const payload = JSON.parse(req.body.toString());

    console.log("Webhook Event:", payload.event);

    // Handle Events
    switch (payload.event) {
      // Payment Captured
      case "payment.captured": {
        console.log("Payment Captured Successfully");

        // TODO: Store successful payment in DB

        // Example Fields Available
        console.log("Payment ID: ", payload.payload.payment.entity.id);
        console.log("Payment Amount: ", payload.payload.payment.entity.amount);

        break;
      }

      // Payment Failed
      case "payment.failed": {
        console.log("Payment Failed");
        break;
      }

      default:
        console.log("Unhandled Event");
    }

    // Success Response
    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
    });
  } catch (error) {
    console.error("Webhook Error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};
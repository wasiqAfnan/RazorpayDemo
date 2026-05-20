import express from "express";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

/*
 * NOTE:
 * We are using express.json() globally for normal APIs.
 *
 * BUT:
 * Razorpay webhook route will later require express.raw()
 * because webhook signature verification depends on raw body.
 *
 */


app.use(express.json());
app.use(express.static("public"));


// Health Check Route
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Payment Demo API is running",
    });
});

// Routes
app.use("/api/v1/payments", paymentRoutes);

export default app;
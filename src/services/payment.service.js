import razorpayInstance from "../config/razorpay.config.js";

// Create Razorpay Order Service
export const createRazorpayOrder = async ({ amount, currency }) => {
    // Create receipt
    const receipt = `rcpt_${Date.now()}`;

    // Create razorpay order options
    const options = {
        amount,
        currency,
        receipt,
    };

    // Create razorpay order
    const order = await razorpayInstance.orders.create(options);

    /*
        TODO:
        Store order details in DB later
    */
    // Example:
    // order.id
    // order.amount
    // order.currency
    // order.receipt

    return order;
};


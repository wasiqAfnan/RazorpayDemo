# Razorpay Payment Demo (Webhook Enabled)

This is a small Node.js demo showing how to integrate Razorpay payments and use webhooks to handle asynchronous payment events. The project demonstrates both the normal client-side checkout flow and a webhook-based approach for reliable server-side processing and verification.

## Project Structure

- public/index.html - Simple frontend that creates an order and opens Razorpay Checkout.
- src/config/razorpay.config.js - Razorpay SDK configuration using environment variables.
- src/controllers/payment.controller.js - Controllers for creating orders, verifying payments, and handling webhooks.
- src/routes/payment.routes.js - Payment-related API routes.
- src/services/payment.service.js - Service to create Razorpay orders.
- src/app.js - Express app configuration (note: webhook route uses `express.raw`).
- src/server.js - Server entrypoint.

## Overview

There are two main parts to handling payments:

1. Normal Checkout Flow (Client-driven)
   - Frontend creates an order on the backend (`POST /api/v1/payments/create-order`).
   - Razorpay Checkout opens in the browser and the user completes payment.
   - On success, the checkout handler receives `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` and can send them to the backend for verification (`/api/v1/payments/verify-payment`).

2. Webhook-enabled Flow (Server-driven, recommended for reliability)
   - Razorpay sends asynchronous event notifications (webhooks) to your server for important events such as `payment.captured` or `payment.failed`.
   - Your server verifies the webhook signature using a webhook secret and processes the event (e.g., store payment in DB, update order status).
   - This flow is more reliable because it does not depend on the client returning to your site or the browser successfully posting the verification data.

## How This Project Differs From the “Normal” Flow

- Normal flow relies on the client (browser) to send verification details after a successful checkout. If the client crashes, the network fails, or the user closes the browser, the server may never receive the verification.
- Webhooks are server-to-server events sent by Razorpay; they arrive even if the client never reports back. This ensures your backend reliably knows about captured payments, refunds, or failed payments.
- Webhook verification uses a separate `RAZORPAY_WEBHOOK_SECRET` and HMAC verification against the raw request body.

## Webhook Endpoint Details

- Endpoint: POST /api/v1/payments/webhook
- The app config mounts `express.raw({ type: "application/json" })` for the webhook route so signature verification can be performed on the raw body.
- The controller reads the header `x-razorpay-signature` and verifies it using HMAC SHA256 with `RAZORPAY_WEBHOOK_SECRET`.
- Example events handled in the demo: `payment.captured`, `payment.failed`.

Important: Do NOT use `express.json()` before the webhook route because it will consume and parse the body, preventing correct signature verification. This project configures the webhook route with `express.raw()` specifically for that reason.

## Signature Verification (Webhook)

In `src/controllers/payment.controller.js` the webhook verification logic:

- Read `x-razorpay-signature` header.
- Compute HMAC SHA256 of the raw body using `RAZORPAY_WEBHOOK_SECRET`.
- Compare the computed signature to the header value. Process the payload only if they match.

Sample pseudo-check (already implemented in project):

```js
// inside webhook controller
const razorpaySignature = req.headers['x-razorpay-signature'];
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(req.body)
  .digest('hex');

if (generatedSignature !== razorpaySignature) {
  return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
}

const payload = JSON.parse(req.body.toString());
// handle payload.event
```

## Environment Variables

Create a `.env` file in the project root with the following keys:

```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
PORT=5000
```

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are used by the server to create orders via the Razorpay SDK.
- `RAZORPAY_WEBHOOK_SECRET` is configured in the Razorpay Dashboard when you create a webhook endpoint. It is used to verify webhook signatures.

## Running Locally

1. Install dependencies

```bash
npm install
```

2. Start the server

```bash
npm run dev
# or
npm start
```

3. Open the demo frontend at http://localhost:5000

## Testing Webhooks Locally

Razorpay needs a public URL to send webhooks. Use a tunneling tool such as ngrok:

```bash
ngrok http 5000
```

Then add the ngrok URL (e.g., `https://abcd1234.ngrok.io`) as your webhook endpoint in the Razorpay Dashboard, e.g.:

`https://abcd1234.ngrok.io/api/v1/payments/webhook`

Set the webhook secret in the Dashboard to match `RAZORPAY_WEBHOOK_SECRET` in your `.env`.

You can simulate webhooks from the Razorpay dashboard or by sending a POST request to the webhook endpoint with a correctly computed `x-razorpay-signature` header.

### Example: Generate signature locally (Node.js)

```js
// generate-signature.js
import crypto from 'crypto';

const body = JSON.stringify({ /* payload as Razorpay would send */ });
const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
console.log(signature);
```

Then send the request with the computed signature in `x-razorpay-signature` header.

## Notes & Next Steps

- Persist orders and payments to a database for production use.
- Un-comment and use the `/verify-payment` endpoint if you want the client to explicitly request verification after successful checkout.
- Handle more webhook events (e.g., refunds, subscription events) as needed.
- Consider replay protection, logging, and idempotency for webhook processing.

## License

MIT

# Veriscan / API

Serverless payment processing API built for Vercel, handling Pix and Card transactions with webhook support for event-driven payment flows.

## 📁 Repository Structure

The project is divided into two primary surfaces: the serverless API backend (`/API`) and the static frontend checkout pages at the root.

### API Endpoints (`/API`)
- **`apijs`** — Base API entrypoint / health check.
- **`criar-pixjs`** — Generates Pix charges (QR Code payload / copy-paste code).
- **`aprovar-pixjs`** — Simulates or confirms Pix payment approval.
- **`webhook-cartaojs`** — Webhook receiver for Card transactions.
- **`webhook-checkoutjs`** — Webhook receiver for checkout session events.
- **`webhooksjs`** — Generic webhook router / handler.

### Frontend (`/`)
- `index.html` — Main landing / storefront page.
- `checkout.html` — Unified checkout page.
- `cta.html` — Call-to-action page.
- `feed.html` — Feed / dynamic content page.
- `admin.html` — Administrative dashboard.

## ⚙️ Configuration & Deployment

This project is deployed via **Vercel**. Configuration is managed in `vercel.json`, and dependencies are defined in `package.json`.

### Environment Variables
To run this project, you will need to add the following environment variables in your Vercel project settings:

```env
# Payment Gateway Configuration
GATEWAY_CLIENT_ID=your_client_id
GATEWAY_CLIENT_SECRET=your_client_secret
GATEWAY_WEBHOOK_SECRET=your_webhook_secret

# Database / Session Configuration
DATABASE_URL=your_database_connection_string

# Security
JWT_SECRET=your_jwt_secret

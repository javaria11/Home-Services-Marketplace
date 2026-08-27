# HomeEase — AI-Powered Home Services Marketplace

A production-oriented, multi-vendor marketplace connecting customers with verified home service professionals — painters, plumbers, and electricians — enhanced with an AI assistant for natural-language provider matching and instant price estimation.

[![Live Application](https://img.shields.io/badge/Live%20App-Vercel-000000?logo=vercel)](https://home-services-marketplace-lime.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Railway-0B0D0E?logo=railway)](https://home-services-marketplace-production-3310.up.railway.app/)
[![License](https://img.shields.io/badge/License-Portfolio%20Use-blue)]()

**Live Application:** https://home-services-marketplace-lime.vercel.app/
**Backend API:** https://home-services-marketplace-production-3310.up.railway.app/

---

## Overview

HomeEase demonstrates a complete, deployable multi-service architecture: a customer-facing React application, a Node.js/Express API gateway handling authentication and business logic, and an independent FastAPI microservice powering a Retrieval-Augmented Generation (RAG) chatbot and pricing engine. The system is designed to reflect real-world separation of concerns between application logic and AI services.

---

## Core Features

**Customer Experience**
- Search and filter service providers by category, distance, rating, and price
- Step-by-step booking flow with real-time status tracking
- AI chat assistant for natural-language provider discovery (e.g. *"I need a painter for a 3-bedroom house under $300"*)
- Instant, parameter-based price and duration estimation

**Provider Experience**
- Dashboard to accept or decline job requests
- Calendar-based availability management
- Earnings tracking

**Platform Administration**
- Provider verification and document review workflow
- Category-level commission configuration
- Platform activity monitoring

**Platform Foundations**
- Role-based JWT authentication (customer / provider / admin)
- Full booking lifecycle: `requested → accepted → in_progress → completed`
- Post-completion review and rating system

---

## Architecture

```
┌────────────────────┐        ┌──────────────────────────────┐        ┌──────────────────┐
│   React Frontend     │ ─────► │   Node.js / Express Gateway    │ ─────► │   PostgreSQL       │
│   (Vercel)             │        │   Auth · Bookings · Reviews    │        │   (Neon)            │
└────────────────────┘        └──────────────────────────────┘        └──────────────────┘
           │
           │  AI Chat & Price Estimation
           ▼
┌──────────────────────────────┐        ┌────────────────────┐
│   FastAPI AI Microservice      │ ─────► │   ChromaDB            │
│   RAG Chatbot · Pricing Engine │        │   Vector Search        │
│   (Railway)                     │        │                        │
└──────────────────────────────┘        └────────────────────┘
```

The frontend and API gateway are decoupled from the AI service by design, allowing each to be developed, scaled, and deployed independently.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| API Gateway | Node.js, Express |
| Authentication | JWT, bcrypt |
| AI & Data Services | FastAPI, Google Gemini 2.5 Flash |
| Database | PostgreSQL |
| Vector Search | ChromaDB |
| Deployment | Vercel (frontend) · Railway (API gateway & AI service) |

---

## Project Structure

```
Home-Services-Marketplace/
├── frontend/                 React application (Vite)
│   └── src/
│       ├── api/                 API clients (backend + AI service)
│       ├── pages/                Route-level views and components
│       └── context/              Authentication context
├── backend/                   Node.js / Express API gateway
│   ├── routes/                    auth, bookings, providers, reviews, admin
│   ├── middleware/                JWT authentication middleware
│   └── db/                        PostgreSQL connection pool
└── README.md
```

> The AI microservice (RAG chatbot, price estimator, ChromaDB indexing) is maintained in a separate repository and deployed independently.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL instance (e.g. [Neon](https://neon.tech))

### 1. Clone the repository
```bash
git clone https://github.com/javaria11/Home-Services-Marketplace.git
cd Home-Services-Marketplace
```

### 2. Configure and run the backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
JWT_SECRET=your_secret_here
DATABASE_URL=your_postgres_connection_string
PG_SSL=true
CORS_ORIGIN=http://localhost:5173
```

Apply the database schema, then start the server:
```bash
npm run dev
```

### 3. Configure and run the frontend
```bash
cd ../frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `JWT_SECRET` | Secret key used to sign authentication tokens |
| `DATABASE_URL` | PostgreSQL connection string |
| `PG_SSL` | Set to `true` for hosted database providers (e.g. Neon) |
| `CORS_ORIGIN` | Allowed origin for cross-origin frontend requests |

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main`; includes SPA rewrite config for client-side routing |
| API Gateway | Railway | Root directory set to `backend`; environment variables configured per service |
| AI Microservice | Railway | Independent FastAPI service, connected to shared PostgreSQL instance and ChromaDB |

---

## Team

| Contributor | Responsibility |
|---|---|
| **Javaria** | Frontend application, Node.js/Express API gateway, authentication, deployment |
| **Tanzila Abid** | AI RAG chatbot, price estimation engine, ChromaDB integration, PostgreSQL schema design |

---

## License

This project is developed for portfolio and demonstration purposes.
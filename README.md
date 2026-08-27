# Home Services Marketplace

A full-stack platform designed to connect customers with trusted home-service professionals through provider discovery, intelligent matching, booking management, and customer reviews.

The application provides a centralized marketplace where users can find suitable service providers based on service requirements, availability, pricing, and ratings.

---

## Project Links

| Resource              | Link                                                              |
| --------------------- | ----------------------------------------------------------------- |
| **Live Application**  | https://home-services-marketplace-lime.vercel.app/                |
| **Backend API**       | https://home-services-marketplace-production-3310.up.railway.app/ |
| **GitHub Repository** | https://github.com/javaria11/Home-Services-Marketplace            |

---

## Key Features

### Authentication & Authorization

* User registration and login
* JWT-based authentication
* Protected routes
* Role-based access control

### Service Provider Discovery

* Browse available service providers
* Search and filter providers
* View provider profiles
* Check ratings and reviews
* View provider availability and pricing

### Booking Management

* Create service bookings
* View booking details
* Track booking status
* Provider-side booking management

### Reviews & Ratings

* Submit reviews after completed services
* Rating system
* Display provider reviews and ratings
* Booking-based review validation

### AI-Powered Provider Matching

* Natural-language service requests
* AI-assisted provider discovery
* Matching based on customer requirements
* Integration with the provider database

### Administrative Management

* User management
* Provider management
* Booking management
* Platform administration

---

## System Architecture

```text
                         ┌───────────────────┐
                         │      User         │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  React + Vite     │
                         │  Vercel Frontend  │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
          ┌───────────────────┐        ┌───────────────────┐
          │ Node.js + Express │        │   AI Service      │
          │ Railway Backend   │        │     Railway       │
          └─────────┬─────────┘        └─────────┬─────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   ▼
                         ┌───────────────────┐
                         │    PostgreSQL     │
                         │     Database      │
                         └───────────────────┘
```

---

## Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* Axios
* React Router
* CSS

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT
* RESTful APIs

### AI Service

* Python
* FastAPI
* AI-based provider matching
* Provider data integration

### Deployment

* Vercel — Frontend
* Railway — Main Backend
* Railway — AI Service
* PostgreSQL — Database

---

## Local Development

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL
* Git

### Clone the Repository

```bash
git clone https://github.com/javaria11/Home-Services-Marketplace.git

cd Home-Services-Marketplace
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

### Backend

Open a separate terminal:

```bash
cd backend
npm install
npm start
```

---

### Production

Production environment variables should be configured through the hosting platform.

**Never commit secrets, database credentials, API keys, or tokens to GitHub.**

---

## API Overview

The backend exposes REST APIs under the `/api` prefix.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Providers

```text
GET /api/providers
```

### Bookings

```text
/api/bookings
```

### Reviews

```text
GET  /api/reviews
POST /api/reviews
```

### Administration

```text
/api/admin
```

---

## Production Deployment

### Frontend

The React/Vite application is deployed on **Vercel**.

**Live:**
https://home-services-marketplace-lime.vercel.app/

### Main Backend

The Node.js/Express API is deployed on **Railway**.

**Live:**
https://home-services-marketplace-production-3310.up.railway.app/

### AI Service

The AI provider-matching service is deployed separately on Railway and is consumed by the frontend for intelligent provider matching.

---

## Security

The application implements:

* JWT-based authentication
* Protected API endpoints
* Role-based authorization
* CORS configuration
* Environment-based secret management
* Server-side request validation

Sensitive configuration values are maintained outside the source repository.

---

## Application Testing

The production application has been tested for:

* User registration
* User authentication
* Provider discovery
* Provider filtering
* Booking workflows
* Reviews and ratings
* Dashboard functionality
* API integration
* Frontend/backend communication
* Production deployment

---

## Team Project

**Home Services Marketplace** was developed as a collaborative team project.

The project involved contributions across:

* Frontend development
* Backend/API development
* Database integration
* AI provider matching
* Application integration
* Testing
* Deployment

---

## Project Status

**Frontend:** Deployed
**Main Backend:** Deployed
**Database:** Integrated
**Authentication:** Functional
**Provider Discovery:** Functional
**Booking System:** Functional
**Reviews & Ratings:** Functional
**AI Matching:** Integrated
**Production Integration:** Functional with a known AI price-matching issue


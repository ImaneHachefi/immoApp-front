# LuxImmo - Luxury Real Estate Platform

LuxImmo is a comprehensive full-stack luxury real estate platform built for the Moroccan market. It provides role-based dashboards, a public property catalog, support ticketing (SAV), and an AI-powered property recommendation chatbot.

## 🚀 Key Features

- **Public Catalog**: Browse high-end luxury properties available for sale and rent.
- **Role-based Dashboards**: Dedicated interfaces for `CLIENT`, `ADMIN`, `AGENT_COMMERCIAL`, and `AGENT_SAV`.
- **AI Chatbot Integration**: A Python-based microservice that interacts with clients to provide personalized property recommendations.
- **Ticketing System (SAV)**: Agent SAV interface for managing client support requests.
- **Dark/Light Mode**: Full theme support utilizing CSS variables and Tailwind CSS v4 design tokens.
- **Fully Responsive**: Mobile-first design principles ensure the application looks perfect on all devices.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.2.3, React 19, Tailwind CSS v4, Lucide React
- **Backend**: Spring Boot 3, Java 17, Maven
- **Database**: PostgreSQL 16
- **AI Microservice**: Python 3.14, FastAPI, Uvicorn

---

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: v20 or higher
- **Java**: JDK 17 (Strictly required; newer versions like Java 25 will fail due to MapStruct/Lombok incompatibilities)
- **Python**: v3.14 (Virtual environment required)
- **Database**: PostgreSQL (Running locally on port 5432)

---

## 🏁 Getting Started

To get the application running locally, you must start all three services in separate terminal windows.

### 1. Database Setup
Create a PostgreSQL database named `immoApp`.
Ensure your local PostgreSQL user is `postgres` with the password `neo`.

### 2. Frontend (Next.js)

```bash
cd immoApp-front
npm install
npm run dev
```
The frontend will be accessible at [http://localhost:3000](http://localhost:3000).

### 3. Backend (Spring Boot)

*Note: You must use Java 17.*

```powershell
cd ImmoApp-Project-Backend\ImmoApp
# Set JAVA_HOME if necessary, for example:
# $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
.\mvnw.cmd spring-boot:run
```
The backend API will be accessible at [http://localhost:8080](http://localhost:8080).

### 4. AI Microservice (Python)

```powershell
cd ImmoApp-Project-Backend\immoapp_ia
# Activate your virtual environment
.\.venv\Scripts\activate
# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
The AI microservice will be accessible at [http://localhost:8000](http://localhost:8000).

---

## 🔑 Test Accounts

You can log in to the application using the following test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | admin@immoapp.com | password123 |
| **Agent Commercial** | commercial@immoapp.com | password123 |
| **Agent SAV** | sav@immoapp.com | password123 |
| **Client** | client@immoapp.com | password123 |

---

## 🏗️ Architecture Overview

### Directory Structure

```text
├── ImmoApp-Project-Backend/
│   ├── ImmoApp/          # Spring Boot Java Backend
│   └── immoapp_ia/       # Python FastAPI AI Microservice
├── immoApp-front/        # Next.js Frontend App
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # Reusable React components (Navbar, Sidebar, ThemeToggle)
│   └── lib/              # API clients and authentication logic
└── .agent/               # Antigravity Skills & AI agent config (Ignored in Git)
```

### Request Lifecycle
1. **Frontend**: Next.js App Router manages routing and Server/Client components. API calls are sent via Axios (`lib/api.ts`).
2. **Backend API**: The Spring Boot app processes business logic, verifies authentication, and queries the PostgreSQL database.
3. **AI Chatbot**: The `immoapp_ia` FastAPI service is queried via the backend (or frontend directly) to generate AI-driven responses.

---

## 🔄 Recent Changes & Changelog

### UI/UX Overhaul (Current Version)
- **Theme Standardization**: Eliminated all hardcoded hex colors (`#0d1117`, `#161b22`) across the application. Implemented a strict Tailwind CSS token system (`bg-surface`, `text-foreground`, `border-surface-border`).
- **Light/Dark Mode Fixes**: 
  - Fixed visibility issues where text was blending into backgrounds in Light Mode. 
  - The main Navbar now intelligently adapts its opacity and text color based on the scroll position and the current route (transparent on the home page, solid on other pages).
  - Added a `FloatingThemeToggle` to authentication pages (`/login`, `/register`).
- **Iconography**: Migrated from outdated emoji-based UI elements to professional `lucide-react` SVGs.
- **Mobile Responsiveness**: Reworked grid layouts across all dashboards (Client Chatbot, Agent SAV Tickets) to default to `grid-cols-1` on mobile, ensuring components do not overflow or disappear.
- **Localization**: Updated default addresses, phone numbers (`+212`), and currency (`DH`) for the Moroccan luxury real estate market.

---

## 🚨 Troubleshooting

### Turbopack Not Supported
If you encounter Next.js Turbopack errors, it is usually caused by corrupted `node_modules` (often due to running out of disk space). Delete the `node_modules` folder and the `.next` cache, free up at least 3GB of disk space, and run `npm install` again.

### Java Version Incompatibilities
If the Spring Boot application fails to compile, ensure you are strictly using **Java 17**. Newer versions like Java 25 conflict with Lombok and MapStruct annotations in this project.

### Database Connection Refused
Ensure PostgreSQL is running as a background service on port `5432` and that the password in `application.properties` matches your local instance.

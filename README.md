# etherWatch – Backend

The core backend service for **etherWatch**. This service provides real-time Ethereum network data through a robust REST API and live WebSocket events.

The full API documentation is available via Swagger UI:
- **Local:** [http://localhost:5005/api-docs](http://localhost:5005/api-docs)

---

## Features

- **Hybrid Communication:** REST and WebSocket server powered by Express and Socket.IO.
- **Real-time Streams:** Live pending transaction streaming directly from the Ethereum network.
- **Web3 Auth:** Integrated MetaMask login flow.
- **Ethereum Utilities:**
  - Retrieve granular transaction details.
  - Access key blockchain data (Balances, ENS profiles, Block data, etc.).
- **Type Safety:** Strict data validation using **Zod**.
- **DevOps Ready:** Fully Dockerized for seamless deployment.

## Technologies

- **Runtime:** Node.js + TypeScript
- **Web Framework:** Express
- **Real-time:** Socket.IO
- **Validation:** Zod
- **Infrastructure:** Docker & Docker Compose

---

## Getting Started

### Prerequisites
Ensure you have the following installed on your machine:
* **Docker & Docker Compose**
* **Ethereum Node Provider Key** (Infura, Alchemy, etc.)
* *(Optional)* **Node.js v20+** (if running locally without Docker)

### Configuration
1. **Clone the repository:**
   ```bash
   git clone <url>
   cd etherWatch-backend 
   ```
---

## Running the Application

### Option 1: Using Docker (Recommended)
The fastest way to get the environment up and running.

```bash 
docker compose up --build
docker compose up -d
```
The server will be available at: http://localhost:5005

### Option 2: Local Development

```bash
1. npm install
2. npm run dev
```

# etherWatch – Backend

Backend service for the etherWatch application. Provides real-time Ethereum network data via REST APIs and WebSocket events.

## Features

- REST and WebSocket server using Express and Socket.IO
- Real-time pending transaction streaming
- Flow of MetaMask login
- Ethereum utilities:
  - Retrieve specific transaction details
  - Access key blockchain information (e.g., balances, ENS profiles, Block, Bio)
- Data validation using Zod
- Docker-ready for easy deployment

## Technologies

- Node.js + TypeScript
- Express
- Socket.IO
- Zod
- Docker

## Running with Docker

```bash
docker compose up --build
The server will be available at http://localhost:5005

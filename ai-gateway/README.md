# AI Services API Gateway

This is a Node.js and TypeScript API Gateway acting as middleware between the frontend application and the backend Python AI Engine. 

## Responsibilities
- **Authentication**: JWT-based security securing downstream AI services.
- **API Routing**: Clean routing to internal controllers and external services.
- **Logging**: Request and error logging via Winston and Morgan.
- **Rate Limiting**: Protection against DDoS and abuse.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Testing**: Jest & Supertest

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install

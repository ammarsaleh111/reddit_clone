# Community Platform

Initial project setup for a Reddit-inspired community platform.

## Requirements

- Node.js 22+
- npm
- MongoDB Community Server

## Setup

1. Install dependencies:

   ```powershell
   cd frontend
   npm install
   cd ..\backend
   npm install
   ```

2. Copy `backend\.env.example` to `backend\.env`. The default URI uses the
   local MongoDB database `community_platform`.

3. Start the local MongoDB service and ensure it is listening on
   `mongodb://localhost:27017`.

## Run

In separate terminals:

```powershell
cd frontend
npm run dev
```

```powershell
cd backend
npm run dev
```

The backend exposes only its minimal startup process at this stage. No
application feature routes or business logic are included.

## Build

```powershell
cd frontend
npm run build

cd ..\backend
npm run build
```

# Collaborative Lobby To-Do List

This project is a MERN-stack application that provides real-time, collaborative to-do lists within customizable "lobbies" or rooms.

## Architecture & Stack
- **Frontend**: React 18, Vite, React Router v6, Axios, Socket.IO Client.
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, Socket.IO Server.
- **Theme**: Black & Neon Blue, with dynamic neon color assignment per user.

## Features
1. **User Authentication**: JWT-based auth. Users get assigned a random neon color upon registration.
2. **Friends System**: Fuzzy search for users, send/accept/reject friend requests.
3. **Room / Lobby System**: Create rooms, invite friends directly, or share a 6-character room code to join.
4. **Real-time Collaboration**: WebSocket integration ensures immediate updates when a user joins/leaves a room or when a task is created/toggled/deleted.
5. **Cross-Room Actions**: When adding or deleting a task, you can select which of your active rooms the action applies to.
6. **Progress Tracking**: Real-time SVG progress circles display the ratio of completed vs. total tasks for each member in a room.

## Directory Structure
```
.
├── client                  # Vite + React frontend
│   ├── src
│   │   ├── components      # Modular UI components
│   │   ├── context         # Auth & Socket contexts
│   │   ├── hooks           # Custom hooks (e.g., useClock)
│   │   ├── pages           # Route-level components
│   │   ├── services        # Axios API services
│   │   └── utils           # Helpers (date formatters)
│   ├── package.json
│   └── vite.config.js
│
└── server                  # Express + Node.js backend
    ├── config              # MongoDB connection
    ├── controllers         # Route logic
    ├── middleware          # JWT auth guards
    ├── models              # Mongoose schemas
    ├── routes              # API endpoints
    ├── socket              # Socket.IO handlers
    ├── package.json
    └── server.js           # Entry point
```

## Setup Instructions
Since this project was generated via an automated workflow without running `npm` locally, you will need to install the dependencies before running the apps:

### 1. Server Setup
1. Open a terminal in the `server` directory.
2. Run `npm install`
3. Create a `.env` file inside `server/` with the following variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for signing JWTs
   - `PORT`: (Optional, defaults to 10000)
   - `CLIENT_URL`: `http://localhost:5173` (for local dev CORS)
4. Run `npm start` (or `npm run dev` if you added a nodemon script).

### 2. Client Setup
1. Open a terminal in the `client` directory.
2. Run `npm install`
3. Create a `.env` file inside `client/` with:
   - `VITE_API_URL`: `http://localhost:10000`
4. Run `npm run dev` to start Vite.

---

## Deployment (Vercel + Render)

### Backend (Render)
1. Push this repository to GitHub.
2. Log into Render, click **New > Web Service**, and connect your GitHub repo.
3. Set the Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add your Environment Variables (`MONGO_URI`, `JWT_SECRET`, and set `CLIENT_URL` to your future Vercel URL).

### Frontend (Vercel)
1. Log into Vercel, click **Add New > Project**, and select your GitHub repo.
2. Edit the Root Directory and set it to `client`.
3. Vercel will automatically detect Vite and configure the build commands.
4. Add the Environment Variable `VITE_API_URL` and set it to your Render backend URL (e.g., `https://my-todo-backend.onrender.com`).
5. Deploy.

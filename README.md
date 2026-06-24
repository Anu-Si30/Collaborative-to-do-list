# Collaborative Lobby To-Do List

A full-stack MERN application that provides real-time, collaborative to-do lists within customizable "lobbies" or rooms. 

## Features
- **Real-time Synchronization**: Powered by Socket.IO, see exactly when friends join, leave, or complete tasks in a room.
- **Neon Design System**: Premium black and neon blue theme. Each user is assigned a unique neon color (cyan, magenta, green, etc.) out of a 12-color pool that outlines their cards and checkmarks.
- **Multi-room Actions**: Add or delete tasks across multiple rooms simultaneously.
- **Progress Tracking**: Circular SVG progress bars natively calculate the ratio of your checked-off items versus total items.
- **Friends System**: Search for users by name, send friend requests, and seamlessly invite them to new rooms.

## Getting Started

> **Note**: This project requires Node.js and NPM. If you do not have them installed, please download Node.js from [nodejs.org](https://nodejs.org/).

### Backend
1. `cd server`
2. `npm install`
3. Create `.env` file and add `MONGO_URI` (your MongoDB Atlas connection string), `JWT_SECRET`, and `CLIENT_URL` (`http://localhost:5173`).
4. `npm run dev` (starts on port 10000)

### Frontend
1. `cd client`
2. `npm install`
3. Create `.env` file and add `VITE_API_URL=http://localhost:10000`.
4. `npm run dev`

## Documentation
For detailed architecture, schema designs, and deployment instructions for Render and Vercel, please see `DOCUMENTATION.md`.

# README.md

## Collaborative Canvas — Real-Time Multi-User Drawing

A lightweight, real-time collaborative drawing app built using **Vanilla JavaScript**, **HTML5 Canvas**, and **Node.js (WebSocket)**. This project allows multiple users to draw simultaneously on the same canvas with live synchronization, cursor tracking, and a shared undo/redo system.

---

## 🚀 Features

### ✏️ Drawing Tools

* Brush tool with adjustable color and stroke width
* Eraser tool (acts as transparent paint)
* Smooth line drawing with point interpolation

### 🌐 Real-Time Collaboration

* Instant sync of drawing actions across all connected clients
* Live cursor position indicators for all users
* Conflict-free synchronization via server sequencing

### 🧠 Advanced Features

* **Global Undo/Redo** — shared history across users
* **User Management** — list of connected users with assigned colors
* **Room System** — support for multiple independent drawing sessions
* **Optional Persistence** — server can store canvas snapshots for new joiners

---

## 🧩 Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html            # Frontend UI
│   ├── style.css             # Basic layout and toolbar styles
│   ├── canvas.ts             # Canvas drawing logic
│   ├── websocket.ts          # Client-side WebSocket connection handler
│   ├── history.ts            # Local undo/redo helper (mirrors global state)
│   └── main.ts               # Initialization and event wiring
├── server/
│   ├── server.ts             # Express + WebSocket (Socket.io) backend
│   ├── rooms.ts              # Room and user management
│   └── drawing-state.ts      # Global operation history + undo/redo logic
├── package.json
├── tsconfig.json
├── README.md
└── ARCHITECTURE.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd collaborative-canvas
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start the Server

```bash
npm start
```

Server will start at: **[http://localhost:3000](http://localhost:3000)**

---

## 💻 Testing Multi-User Collaboration

1. Run the server (`npm start`).
2. Open two browser windows/tabs at `http://localhost:3000`.
3. Draw in one window — the strokes will appear live in the other.
4. Change color or brush width to test multi-user differentiation.
5. Try the **Undo/Redo** buttons — updates apply globally.


## 🧠 Undo/Redo Overview

Undo/Redo operations work **globally**. Each drawing stroke is stored as an operation in the global sequence. When any user issues an undo, the latest operation is reversed for all connected users, keeping the canvas synchronized.

---


## 🔍 Known Limitations

* Global undo may feel unintuitive when many users draw simultaneously.
* No authentication (anonymous sessions only).
* History size grows with each operation; needs periodic pruning for long sessions.
* Eraser operations behave as transparent paint (not vector undo).


---

## 🧰 Technical Highlights

* **Canvas Efficiency**: Draws only affected segments using compositing.
* **Latency Handling**: Client-side prediction + server reconciliation.
* **Scalable Design**: Room-based architecture supports distributed deployments.
* **Optimized Networking**: Batches pointer events (~50ms interval) for reduced network load.

---

## 🧑‍💻 Development Notes

* Written in **TypeScript** for type safety.
* Follows clean separation of concerns between canvas logic and networking.
* Uses **Socket.io** for simplified event-based communication.
* Global operation history managed on the server for consistent state across clients.

---

## 🧠 Time Spent

* 4 Days

---

**Author:** **Jyothi Sai Swaroop Mareedu**

**Demo:** *<Add deployment link here>*


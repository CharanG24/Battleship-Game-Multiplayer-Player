# 🚢 Multiplayer Battleship Game

A web-based version of the classic **Battleship** game reimagined for two players on the same computer — now with real-time multiplayer support using **WebSockets**!

---

## 🎮 About the Game

This project transforms the traditional single-player Battleship into a **multiplayer** experience. Two players can battle each other in real-time using a shared computer interface and a synchronized backend powered by **WebSockets**.

---

## 🧩 Features

- 🔁 Real-time two-player interaction
- 🧠 Ship dragging and placement with smart grid snapping
- 🎯 Fire tracking and hit/miss logic
- 📡 WebSocket-based communication between players
- ⏱️ Auto-disconnect inactive players after 10 minutes
- 📊 Dynamic UI updates based on actions

---

## ⚙️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Client-side logic in `app.js`)
- **Backend**: Node.js, Express, WebSockets (`server.js`)
- **WebSocket Library**: `ws`

---

## 🗂️ File Structure

multiplayer-battleship/
├── node_modules/           # Project dependencies
├── public/
│   ├── index.html          # Main game interface
│   ├── styles.css          # Styling
│   └── app.js              # Client-side game logic
├── server.js               # WebSocket server logic
├── package.json            # Project metadata and scripts
├── package-lock.json       # Dependency lock file
└── README.md               # Project overview and instructions





# Midnight Mafia

A small real-time Mafia game built with Node.js, Express, Socket.IO, and vanilla browser JavaScript. The Mafia prototype runs independently from the existing application entry point.

## Run locally

```sh
npm install
npm start
```

Open `http://localhost:3000` in a browser. Set `PORT` to use a different port. Open another tab or browser to join the room; at least four connected players are required to start.

## How it works

- `src/mafiaServer.js` serves the Mafia pages and attaches Socket.IO to an HTTP server.
- `src/mafia/roomManager.js` owns in-memory rooms, players, and server-issued reconnect tokens. Room codes are short and generated on the server.
- `src/mafia/gameManager.js` assigns roles and validates votes, eliminations, and win conditions.
- `src/mafia/socketHandlers.js` validates client requests, sends only a player's own role, and broadcasts public game updates.
- `public/mafia/` contains the landing page, lobby, game UI, styles, and browser event handlers.

Refreshing a page reconnects the player using a random session token stored in that browser. Rooms and sessions are intentionally in memory and are lost when the server restarts.

## Next steps

Add end-to-end Socket.IO/browser tests, reconnect/disconnect handling during a game, room cleanup, and configurable game rules. Authentication and persistent storage are intentionally out of scope for this prototype.

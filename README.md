# EventHub

Find local events, RSVP, get reminders, and invite friends with trackable share links.
MERN stack: MongoDB, Express, React 18 (Vite), Node, plus Socket.IO for live updates.

## Prerequisites
- Node.js 20+ (includes npm)
- MongoDB running locally, or a MongoDB Atlas connection string.
  If MongoDB can't be reached, the server starts a temporary in-memory database
  (it downloads a MongoDB binary the first time, and the data resets on restart).

## Setup
```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
cd ../client
npm install
```

Edit `server/.env` if needed:

| Variable | Meaning |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `TICKETMASTER_API_KEY` | Leave blank to use about 40 built-in demo events |
| `DEFAULT_CITY` | City used when none is given |
| `PORT` | API port (default 4000) |
| `CLIENT_URL` | Frontend URL, used for CORS and invite links |

### Getting a free Ticketmaster key
1. Sign up at https://developer.ticketmaster.com/
2. Open **My Apps**. The "Consumer Key" is your API key.
3. Put it in `TICKETMASTER_API_KEY` and restart the server.

## Run
Use two terminals:
```bash
cd server && npm run dev     # API + Socket.IO on http://localhost:4000
cd client && npm run dev     # app on http://localhost:5173
```
Optional demo data (3 users with RSVPs and share links): `cd server && npm run seed`.
Sign in with `alice@demo.eventhub`, `ben@demo.eventhub` or `chloe@demo.eventhub`.

## Architecture
```
 Browser (React + Vite :5173)
   │  fetch /api/*  (x-user-id header)       socket.io (rooms: user:{id})
   ▼                                          ▲
 Vite dev proxy ──────────────────────────────┘
   ▼
 Express API (:4000) ── Socket.IO server ── reminder job (every 30 s)
   │            │
   │            └── events service ── Ticketmaster Discovery API v2
   │                 (5-min cache, falls back to demo events on no key, errors or 429)
   ▼
 MongoDB: users · rsvps (with event snapshot + reminder) · sharelinks (clicks, visitors, conversions)
```

"Friends attending" for an event is the number of unique visitors across all share links for
that event. It is computed with one aggregation per event list and pushed live as `friends:update`.

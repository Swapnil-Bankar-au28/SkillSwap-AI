# SkillSwap AI 🔄

A full-stack skill-bartering marketplace where users exchange skills instead of money. Built as a college final-year project.

## Features

- **AI Matchmaker** — Describe your skills in plain English; Claude AI extracts structured data and finds matches
- **Graph-Based Matching** — Directed graph with DFS cycle detection for 2-party and 3+ party chain matches
- **Negotiation Assistant** — Claude helps users agree on sessions, format, and schedule; drafts a barter agreement
- **Trust System** — Ratings, badges (First Swap, 5 Swaps, Chain Match Pioneer), and a reporting system
- **Full Auth** — JWT authentication with bcrypt password hashing

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React + Vite + Tailwind CSS |
| Backend    | Node.js + Express |
| Database   | MongoDB + Mongoose |
| Auth       | JWT + bcrypt |
| AI         | Anthropic Claude 3.5 Haiku |

## Prerequisites

- Node.js 18+
- MongoDB (local) running on port 27017, OR a MongoDB Atlas free-tier connection string
- An Anthropic API key ([get one here](https://console.anthropic.com/))

## Setup

### 1. Clone / navigate to the project
```bash
cd e:/projets
```

### 2. Configure the backend
```bash
cd server
```
Edit `.env` and fill in your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...your key...
```
If using MongoDB Atlas instead of local, replace:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillswap
```

### 3. Start the backend
```bash
cd server
npm run dev    # starts on http://localhost:5000
```

### 4. Start the frontend (new terminal)
```bash
cd client
npm run dev    # starts on http://localhost:5173
```

### 5. Open your browser
Navigate to [http://localhost:5173](http://localhost:5173)

## Demo Script (for the Viva)

1. **Register** two accounts (e.g., Alex and Maya)
2. **Add skills** to both:
   - Alex: Offers "Guitar" (Expert), Wants "Logo Design" (High urgency)
   - Maya: Offers "Logo Design" (Expert), Wants "Guitar" (Medium urgency)
3. **Run matching** on the Dashboard → a Direct Match appears
4. **Open AI Chat** → type "I can teach guitar and want to learn design" → AI extracts skills and confirms
5. **Propose a match** from the Dashboard candidate results
6. **Log in as Maya** → Accept the match
7. **Negotiate** in the Match Detail page — ask the AI to help agree on 3 sessions, online format
8. **Mark as Complete** → both users rate each other
9. **Check badges** appear on the Dashboard (First Swap badge)

## Matching Algorithm (for the Report)

### Overview
The matching algorithm uses a **directed graph** where:
- Each **user** is a node
- An **edge A → B** exists if User A offers at least one skill that User B wants

### Direct Matches (2-party)
A direct match is a **2-cycle**: A → B AND B → A simultaneously.
Both users can fulfill each other's needs.

### Chain Matches (3+ party)
Chain matches use **Depth-First Search (DFS)** to find longer cycles:
- Example 3-cycle: A → B → C → A
- Meaning: A teaches B something, B teaches C something, C teaches A something
- Maximum cycle length is capped at 4 participants (configurable in `matchingEngine.js`)

### Scoring
Each match is scored by:
- Proficiency of the offer (Beginner=1, Intermediate=2, Expert=3)
- Urgency of the want (Low=1, Medium=2, High=3)
- Higher total score = better fit = appears first

See `server/services/matchingEngine.js` for the full commented implementation.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/users/me` | Get your profile |
| PUT | `/api/users/me` | Update your profile |
| POST | `/api/users/me/skills/offered` | Add an offered skill |
| POST | `/api/users/me/skills/wanted` | Add a wanted skill |
| DELETE | `/api/users/me/skills/offered/:id` | Remove an offered skill |
| DELETE | `/api/users/me/skills/wanted/:id` | Remove a wanted skill |
| POST | `/api/chat/message` | Send a message to Claude AI |
| POST | `/api/chat/confirm-skills` | Save AI-extracted skills to profile |
| GET | `/api/chat/history` | Get chat history |
| GET | `/api/matches/find` | Run the matching algorithm |
| GET | `/api/matches` | Get all your matches |
| GET | `/api/matches/:id` | Get a specific match |
| POST | `/api/matches/propose` | Propose a new match |
| POST | `/api/matches/:id/respond` | Accept or decline a match |
| POST | `/api/matches/:id/complete` | Mark a match as completed |
| POST | `/api/matches/:id/rate` | Rate a participant |
| POST | `/api/reports` | Submit a report |

## Project Structure

```
projets/
├── client/                   # React + Vite frontend
│   └── src/
│       ├── api/axios.js      # Axios with JWT interceptor
│       ├── context/          # AuthContext (global auth state)
│       ├── components/       # Navbar, SkillCard, MatchCard, ProtectedRoute
│       └── pages/            # Landing, Login, Register, Dashboard, Profile, Chat, MatchDetail
└── server/                   # Express backend
    ├── config/db.js          # MongoDB connection
    ├── models/               # Mongoose schemas (User, BarterMatch, ChatMessage, Report)
    ├── middleware/           # JWT auth middleware
    ├── routes/               # Express route handlers
    └── services/
        ├── matchingEngine.js # Graph + DFS matching algorithm
        └── aiService.js      # Claude API wrapper + system prompt
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ANTHROPIC_API_KEY` | Your Anthropic Claude API key |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |

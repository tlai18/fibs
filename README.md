# Guess Who's The Liar!

A fast-paced social deduction party game built with Next.js, Socket.io, and PostgreSQL.

## Features

- **Real-time multiplayer gameplay** with Socket.io
- **Mobile-first responsive design** with Tailwind CSS v4
- **Persistent scoring and leaderboards**
- **Multiple game phases**: Lobby → Answer → Reveal → Vote → Results
- **Smart prompt system** with difficulty weighting
- **Host controls** for game management
- **Reconnection support** for dropped connections

## Game Rules

1. One player is secretly chosen as the Liar
2. Truth-tellers receive the real prompt, the Liar gets a related decoy
3. Everyone submits an answer to their prompt
4. Players vote on who they think is the Liar
5. **Scoring**: Catch the Liar = Truth-tellers get +1 point, Liar escapes = Liar gets +2 points

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Node.js, Express, Socket.io with Redis adapter
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io for WebSocket communication

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis server

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd fibs
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database and Redis credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/fibs?schema=public"
   REDIS_URL="redis://localhost:6379"
   PORT=3001
   NEXT_PUBLIC_SERVER_URL="http://localhost:3001"
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with initial prompts
   npm run db:seed
   ```

4. **Start the development servers**:
   ```bash
   # Terminal 1: Start the backend server
   npm run server:dev
   
   # Terminal 2: Start the frontend
   npm run dev
   ```

5. **Open the game**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:3001](http://localhost:3001)

## Project Structure

```
fibs/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── page.tsx        # Home page (create/join party)
│   │   └── game/           # Game page with all phases
│   └── components/         # React components
│       ├── GameProvider.tsx # Game context
│       ├── Lobby.tsx       # Party lobby
│       ├── AnswerPhase.tsx # Answer submission
│       ├── RevealPhase.tsx # Answer reveal
│       ├── VotePhase.tsx   # Voting interface
│       └── ResultsPhase.tsx # Round results
├── server/
│   ├── src/
│   │   ├── server.ts       # Express server setup
│   │   ├── socket.ts       # Socket.io handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── src/seed.ts         # Database seeding
├── prisma/
│   └── schema.prisma       # Database schema
└── package.json
```

## Game Flow

1. **Home**: Players enter nickname and create/join party
2. **Lobby**: Host can start game when 2+ players join
3. **Answer**: Players receive prompts and submit answers
4. **Reveal**: All answers shown, discussion time
5. **Vote**: Players vote on who they think is the Liar
6. **Results**: Reveal the Liar, update scores, show leaderboard
7. **Repeat**: Host can start next round

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run server:dev` - Start backend development server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with prompts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

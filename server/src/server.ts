import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import cors from 'cors';
import { PrismaClient } from '../../src/generated/prisma';

import { setupSocketHandlers } from './socket';
import { generatePartyCode } from './utils/partyCode';
import { GameService } from './services/GameService';
import { PromptService } from './services/PromptService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://fibs-r0g58osqo-thomas-projects-3bd907c1.vercel.app",
      "https://guess-whos-lying.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

// Initialize services
export const prisma = new PrismaClient();
export const gameService = new GameService(prisma);
export const promptService = new PromptService(prisma);

// Redis setup for scaling (optional for development)
let redisClient: any = null;
let redisSubscriber: any = null;

try {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisSubscriber = redisClient.duplicate();

  Promise.all([
    redisClient.connect(),
    redisSubscriber.connect()
  ]).then(() => {
    io.adapter(createAdapter(redisClient, redisSubscriber));
    console.log('Redis adapter connected');
  }).catch((error) => {
    console.log('Redis not available, continuing without adapter:', error.message);
  });
} catch (error) {
  console.log('Redis not available, continuing without adapter:', (error as Error).message);
}

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://fibs-r0g58osqo-thomas-projects-3bd907c1.vercel.app",
    "https://guess-whos-lying.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/party/:code', async (req, res) => {
  try {
    const party = await prisma.party.findUnique({
      where: { code: req.params.code },
      include: {
        players: true,
        rounds: {
          include: { summary: true },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });

    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }

    res.json(party);
  } catch (error) {
    console.error('Error fetching party:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io setup
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  if (redisClient) {
    await redisClient.disconnect();
  }
  if (redisSubscriber) {
    await redisSubscriber.disconnect();
  }
  process.exit(0);
});

// Environment Configuration Example
// Copy this file to config/environment.js and update with your values

module.exports = {
  // Node Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/fibs_dev',
  
  // Socket.IO Configuration
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001',
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
  
  // Site Configuration
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || "Guess Who's Lying",
  
  // Analytics (Optional)
  GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  
  // Error Tracking (Optional)
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Security
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Production Database Examples:
  // Railway: postgresql://postgres:password@containers-us-west-xyz.railway.app:5432/railway
  // Supabase: postgresql://postgres:password@db.xyz.supabase.co:5432/postgres
  // Neon: postgresql://username:password@host.neon.tech/database
  // PlanetScale: mysql://username:password@host/database?sslaccept=strict
};

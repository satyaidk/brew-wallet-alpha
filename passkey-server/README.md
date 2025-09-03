# Brewit Passkey Server

A simple WebAuthn/Passkey server for Brewit Wallet authentication.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd passkey-server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Update your .env.local:**
   ```env
   NEXT_PUBLIC_PASSKEY_SERVER_URL=http://localhost:4000
   ```

4. **Restart your Next.js app:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /register/options` - Generate registration challenge
- `POST /register/verify` - Verify registration
- `POST /login/options` - Generate login challenge  
- `POST /login/verify` - Verify login
- `GET /health` - Health check
- `GET /users` - List all users (debug)

## Configuration

The server is configured for localhost development. For production:

1. Update `rpID` to your domain
2. Update `origin` to your frontend URL
3. Add proper CORS configuration
4. Replace in-memory storage with a database
5. Add proper error handling and logging

## Testing

Visit `http://localhost:3000/health` to verify the server is running.

## Production Deployment

For production, deploy this server to a platform like:
- Vercel
- Railway
- Heroku
- DigitalOcean
- AWS

Then update your `NEXT_PUBLIC_PASSKEY_SERVER_URL` to point to your deployed server.

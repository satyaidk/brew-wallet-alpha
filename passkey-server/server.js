const express = require('express');
const cors = require('cors');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Configuration
const rpName = 'Brewit Wallet';
const rpID = 'localhost';
const origin = `http://${rpID}:3000`;

// In-memory storage (replace with database in production)
const users = new Map();
const challenges = new Map();

// Helper function to generate user ID
function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}

// Registration endpoints
app.post('/register/options', (req, res) => {
  try {
    const { userName } = req.body;
    
    if (!userName) {
      return res.status(400).json({ error: 'userName is required' });
    }

    const userId = generateUserId();
    const userDisplayName = userName;

    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
      userName: userName,
      userDisplayName: userDisplayName,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    // Store challenge for verification
    challenges.set(userId, options.challenge);

    res.json({
      ...options,
      userId, // Return userId for frontend to store
    });
  } catch (error) {
    console.error('Registration options error:', error);
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
});

app.post('/register/verify', (req, res) => {
  try {
    const { userId, credential } = req.body;

    if (!userId || !credential) {
      return res.status(400).json({ error: 'userId and credential are required' });
    }

    const expectedChallenge = challenges.get(userId);
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    const verification = verifyRegistrationResponse({
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      response: credential,
    });

    if (verification.verified) {
      // Store user and credential
      users.set(userId, {
        id: userId,
        name: credential.response.user.name,
        displayName: credential.response.user.displayName,
        credential: {
          id: credential.id,
          publicKey: credential.response.publicKey,
          counter: credential.response.counter,
        }
      });

      // Clean up challenge
      challenges.delete(userId);

      res.json({
        verified: true,
        userId,
        message: 'Registration successful'
      });
    } else {
      res.status(400).json({
        verified: false,
        error: 'Registration verification failed'
      });
    }
  } catch (error) {
    console.error('Registration verify error:', error);
    res.status(500).json({ error: 'Failed to verify registration' });
  }
});

// Authentication endpoints
app.post('/login/options', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const options = generateAuthenticationOptions({
      rpID,
      allowCredentials: [{
        id: user.credential.id,
        type: 'public-key',
        transports: ['internal'],
      }],
      userVerification: 'preferred',
    });

    // Store challenge for verification
    challenges.set(userId, options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Login options error:', error);
    res.status(500).json({ error: 'Failed to generate login options' });
  }
});

app.post('/login/verify', (req, res) => {
  try {
    const { userId, credential } = req.body;

    if (!userId || !credential) {
      return res.status(400).json({ error: 'userId and credential are required' });
    }

    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expectedChallenge = challenges.get(userId);
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    const verification = verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: user.credential.id,
        credentialPublicKey: user.credential.publicKey,
        counter: user.credential.counter,
      },
    });

    if (verification.verified) {
      // Update counter
      user.credential.counter = verification.authenticationInfo.newCounter;

      // Clean up challenge
      challenges.delete(userId);

      res.json({
        verified: true,
        userId,
        message: 'Login successful'
      });
    } else {
      res.status(400).json({
        verified: false,
        error: 'Login verification failed'
      });
    }
  } catch (error) {
    console.error('Login verify error:', error);
    res.status(500).json({ error: 'Failed to verify login' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Passkey server is running',
    users: users.size,
    challenges: challenges.size
  });
});

// Get all users (for debugging)
app.get('/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    id: user.id,
    name: user.name,
    displayName: user.displayName,
  }));
  res.json(userList);
});

app.listen(PORT, () => {
  console.log(`🔐 Passkey server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users endpoint: http://localhost:${PORT}/users`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`  POST /register/options - Generate registration challenge`);
  console.log(`  POST /register/verify - Verify registration`);
  console.log(`  POST /login/options - Generate login challenge`);
  console.log(`  POST /login/verify - Verify login`);
});

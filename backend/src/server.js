require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const setupWebSocket = require('./ws');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const server = http.createServer(app);

// Initialize WebSocket server
setupWebSocket(server);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', agent: 'Running' });
});

const db = require('./db');

// Profile API Routes
app.get('/api/profile', async (req, res) => {
  try {
    const includeFaces = req.query.includeFaces === 'true';
    const profile = await db.getUserProfile(includeFaces);
    res.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const userId = await db.saveUserProfile(req.body);
    res.json({ success: true, userId });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

app.delete('/api/profile', async (req, res) => {
  try {
    await db.deleteUserProfile();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Google AntiGravity Agent Backend running on port ${PORT}`);
});

const { google } = require('googleapis');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// ✅ Change this to your frontend URL
const REDIRECT_URI =
  process.env.NODE_ENV === 'production'
    ? 'https://medi-bot-theta.vercel.app' // Vercel frontend
    : 'http://localhost:5173'; // Local frontend

exports.oauth2client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

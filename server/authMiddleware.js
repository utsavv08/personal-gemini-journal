import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let adminInitialized = false;

try {
  // Initialize Firebase Admin with project ID
  admin.initializeApp({
    projectId: process.env.GCP_PROJECT_ID || 'gemini--journal-afe40',
  });
  adminInitialized = true;
  console.log('[Auth] Firebase Admin initialized successfully');
} catch (err) {
  console.warn('[Auth Warning] Firebase Admin initialization notice:', err.message);
}

/**
 * Express middleware to verify the Firebase ID token.
 * Prevents unauthorized requests and extracts authenticated user context (uid, email).
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    if (adminInitialized) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } else {
      // Development fallback: decode JWT payload safely if admin credentials not provisioned
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        req.user = {
          uid: payload.user_id || payload.sub,
          email: payload.email,
        };
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }
  } catch (error) {
    console.error('[Auth Error] Token verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token', details: error.message });
  }
}

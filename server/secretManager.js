import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import dotenv from 'dotenv';
dotenv.config();

let cachedSecret = null;

/**
 * Resolves the Gemini API Key securely.
 * Priority:
 * 1. Google Cloud Secret Manager (for production enterprise security)
 * 2. Secure server-side environment variable (for local development fallback)
 * Never sends this key to the client.
 */
export async function getGeminiApiKey() {
  if (cachedSecret) {
    return cachedSecret;
  }

  // Attempt Google Cloud Secret Manager retrieval if configured
  const projectId = process.env.GCP_PROJECT_ID;
  const secretName = process.env.GCP_SECRET_NAME || 'GEMINI_API_KEY';

  if (projectId && process.env.USE_GCP_SECRET_MANAGER === 'true') {
    try {
      console.log(`[Security] Fetching secret ${secretName} from GCP Secret Manager...`);
      const client = new SecretManagerServiceClient();
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      cachedSecret = version.payload?.data?.toString();
      if (cachedSecret) {
        console.log('[Security] Successfully retrieved Gemini API key from Secret Manager');
        return cachedSecret;
      }
    } catch (err) {
      console.warn('[Security Warning] Failed to fetch from GCP Secret Manager, using server environment fallback:', err.message);
    }
  }

  // Local development / server-side environment fallback
  if (process.env.GEMINI_API_KEY) {
    cachedSecret = process.env.GEMINI_API_KEY;
    console.log('[Security] Using server-side protected GEMINI_API_KEY');
    return cachedSecret;
  }

  throw new Error('GEMINI_API_KEY is not configured in GCP Secret Manager or server environment.');
}

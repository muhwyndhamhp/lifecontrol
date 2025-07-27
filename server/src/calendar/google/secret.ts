import { Client, createClient } from '@libsql/client';
import { Oauth2Token } from '@openauthjs/openauth/provider/oauth2';
import { Env } from '../../env';

let turso: Client;

const ALGORITHM = 'AES-GCM';

export async function getTursoClient(env: Env) {
  const { url, secret } = JSON.parse(await env.AUTH_DB_CREDS.get());
  if (!turso) {
    turso = createClient({
      url: url,
      authToken: secret,
    });
  }

  return turso;
}

interface EncryptedTokenData {
  iv: string;
  encrypted: string;
}

async function getMasterKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(secret);
  const derivedKey = await crypto.subtle.digest('SHA-256', keyMaterial);

  return crypto.subtle.importKey(
    'raw',
    derivedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function getSecret(
  env: Env,
  userId: string,
  provider: string
): Promise<Oauth2Token | null> {
  const masterSecret = await env.MASTER_SECRET_KEY.get();
  const db = await getTursoClient(env);
  const result = await db.execute({
    sql: `
    SELECT session_data FROM session_history 
    WHERE user_id = ? 
      AND provider = ? 
      ORDER BY created_at DESC LIMIT 1`,
    args: [userId, provider],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const sessionData = JSON.parse(result.rows[0]['session_data'] as string);
  const encryptedSet: EncryptedTokenData = {
    iv: sessionData.iv,
    encrypted: sessionData.encrypted,
  };

  const masterKey = await getMasterKey(masterSecret);
  const iv = Buffer.from(encryptedSet.iv, 'base64');
  const encrypted = Buffer.from(encryptedSet.encrypted, 'base64');

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      masterKey,
      encrypted
    );

    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded) as Oauth2Token;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

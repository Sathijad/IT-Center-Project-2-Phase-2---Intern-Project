import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import logger from './logger';

const region = process.env.COGNITO_REGION || 'ap-southeast-2';
const userPoolId = process.env.COGNITO_USER_POOL_ID || '';
const audience = process.env.COGNITO_AUDIENCE || '';
const issuer = process.env.COGNITO_ISSUER || `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
const jwksUrl = `${issuer}/.well-known/jwks.json`;
const jwksCacheTtl = parseInt(process.env.JWKS_CACHE_TTL || '600') * 1000;

let cachedJwksClient: jwksClient.JwksClient | null = null;

export const getJwksClient = (): jwksClient.JwksClient => {
  if (cachedJwksClient) {
    return cachedJwksClient;
  }

  cachedJwksClient = jwksClient({
    jwksUri: jwksUrl,
    cache: true,
    cacheMaxAge: jwksCacheTtl,
    requestHeaders: {},
    timeout: 30000,
  });

  logger.info('JWKS client initialized', { jwksUrl });

  return cachedJwksClient;
};

export const getSigningKey = async (kid: string): Promise<string> => {
  const client = getJwksClient();
  try {
    const key = await client.getSigningKey(kid);
    return key.getPublicKey();
  } catch (error) {
    logger.error('Failed to get signing key', { kid, error });
    throw error;
  }
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const decoded = jwt.decode(token, { complete: true }) as jwt.Jwt;

  if (!decoded || !decoded.header.kid) {
    throw new Error('Invalid token format');
  }

  const signingKey = await getSigningKey(decoded.header.kid);

  return jwt.verify(token, signingKey, {
    issuer,
    audience,
    clockTolerance: 300, // 5 minutes clock skew
  }) as JwtPayload;
};

export const isJwksReachable = async (): Promise<boolean> => {
  try {
    const client = getJwksClient();
    // Try to get a dummy kid to verify connectivity
    await client.getSigningKey('test');
    return true;
  } catch (error: any) {
    // Expected to fail, but should not timeout
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return false;
    }
    return true; // Any other error means connectivity is fine
  }
};

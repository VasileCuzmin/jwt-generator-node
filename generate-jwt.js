import * as jose from 'jose';
import { loadPrivateJwk } from './create-keys.js';
import dotenv from 'dotenv';
dotenv.config();

const privateJwk = await loadPrivateJwk();
const key = await jose.importJWK(privateJwk, 'ES256');

const token = await new jose.SignJWT({})
    .setProtectedHeader({ typ: 'JWT', alg: 'ES256', kid: privateJwk.kid })
      .setIssuer(process.env.ISSUER)
      .setAudience(process.env.CLIENT_ID)
      .setSubject(process.env.SUB)
    .setExpirationTime(process.env.EXPIRATION_TIME)
    .setIssuedAt()
    .sign(key);

console.log(token);
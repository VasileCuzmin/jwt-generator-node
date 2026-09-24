import * as jose from 'jose';
import readline from 'readline';
import { loadPublicJwk } from './create-keys.js';
import dotenv from 'dotenv';
dotenv.config();

const publicJwk = await loadPublicJwk();
const key = await jose.importJWK(publicJwk, 'ES256');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', async (token) => {
    try {
        const { payload } = await jose.jwtVerify(token, key, {
            issuer: process.env.ISSUER,
            audience: process.env.CLIENT_ID
        });
        console.log('JWT is valid:', payload);
    } catch (error) {
        console.error('JWT validation failed:', error);
    }
});

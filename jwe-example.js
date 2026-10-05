import * as jose from 'jose';
import {
    loadEncryptionPrivateJwk,
    loadEncryptionPublicJwk
} from './create-keys.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Issuer: encrypt sensitive claims using the receiver's public encryption key.
const receiverPublicJwk = await loadEncryptionPublicJwk();
const receiverEncryptionKey = await jose.importJWK(receiverPublicJwk, 'RSA-OAEP-256');
const sensitiveClaims = {
    subject: 'user@example.com',
    accountNumber: '12345678',
    scope: ['payments:read']
};

// Create the JWE using the receiver's public encryption key.
const jwe = await new jose.CompactEncrypt(encoder.encode(JSON.stringify(sensitiveClaims)))
    .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: receiverPublicJwk.kid
    })
    .encrypt(receiverEncryptionKey);

console.log('Issuer sends JWE:', jwe);

// Receiver: decrypt with its private encryption key before reading the claims.
const receiverPrivateJwk = await loadEncryptionPrivateJwk();
const receiverDecryptionKey = await jose.importJWK(receiverPrivateJwk, 'RSA-OAEP-256');
const { plaintext, protectedHeader } = await jose.compactDecrypt(jwe, receiverDecryptionKey);

console.log('Receiver decrypted header:', protectedHeader);
console.log('Receiver read claims:', JSON.parse(decoder.decode(plaintext)));
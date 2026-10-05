import * as jose from 'jose';
import {
    loadEncryptionPrivateJwk,
    loadEncryptionPublicJwk,
    loadPrivateJwk,
    loadPublicJwk
} from './create-keys.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const claims = {
    subject: 'user@example.com',
    scope: ['payments:read'],
    transactionId: 'txn_123'
};

// Issuer: sign claims into a JWS with the issuer's private signing key.
const issuerPrivateJwk = await loadPrivateJwk();
const issuerSigningKey = await jose.importJWK(issuerPrivateJwk, 'ES256');
const signedJws = await new jose.CompactSign(encoder.encode(JSON.stringify(claims)))
    .setProtectedHeader({ alg: 'ES256', kid: issuerPrivateJwk.kid, typ: 'JWT' })
    .sign(issuerSigningKey);

// Issuer: encrypt that complete JWS using the receiver's public encryption key.
const receiverPublicJwk = await loadEncryptionPublicJwk();
const receiverEncryptionKey = await jose.importJWK(receiverPublicJwk, 'RSA-OAEP-256');
const nestedJwe = await new jose.CompactEncrypt(encoder.encode(signedJws))
    .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: receiverPublicJwk.kid,
        cty: 'JWS'
    })
    .encrypt(receiverEncryptionKey);

console.log('Issuer sends nested JWE:', nestedJwe);

// Receiver: decrypt the outer JWE to recover the original signed JWS.
const receiverPrivateJwk = await loadEncryptionPrivateJwk();
const receiverDecryptionKey = await jose.importJWK(receiverPrivateJwk, 'RSA-OAEP-256');
const { plaintext, protectedHeader: jweHeader } = await jose.compactDecrypt(nestedJwe, receiverDecryptionKey);
const recoveredJws = decoder.decode(plaintext);

// Receiver: verify the recovered JWS before trusting its claims.
const issuerPublicJwk = await loadPublicJwk();
const issuerVerificationKey = await jose.importJWK(issuerPublicJwk, 'ES256');
const { payload, protectedHeader: jwsHeader } = await jose.compactVerify(recoveredJws, issuerVerificationKey);

console.log('Receiver decrypted JWE header:', jweHeader);
console.log('Receiver verified JWS header:', jwsHeader);
console.log('Receiver accepted claims:', JSON.parse(decoder.decode(payload)));
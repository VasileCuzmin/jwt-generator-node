import * as jose from 'jose';
import { loadPrivateJwk, loadPublicJwk } from './create-keys.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Issuer: sign arbitrary JSON content with the issuer's private signing key.
const issuerPrivateJwk = await loadPrivateJwk();
const issuerSigningKey = await jose.importJWK(issuerPrivateJwk, 'ES256');
const message = {
    event: 'payment.approved',
    paymentId: 'pay_123',
    amount: 2500,
    currency: 'USD'
};

const jws = await new jose.CompactSign(encoder.encode(JSON.stringify(message)))
    .setProtectedHeader({ alg: 'ES256', kid: issuerPrivateJwk.kid })
    .sign(issuerSigningKey);

console.log('Issuer sends JWS:', jws);

// Receiver: verify before processing the decoded content.
const issuerPublicJwk = await loadPublicJwk();
const issuerVerificationKey = await jose.importJWK(issuerPublicJwk, 'ES256');
const { payload, protectedHeader } = await jose.compactVerify(jws, issuerVerificationKey);

console.log('Receiver verified header:', protectedHeader);
console.log('Receiver accepted message:', JSON.parse(decoder.decode(payload)));
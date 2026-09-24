import * as jose from 'jose';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';


// JSON Web Key (JWK) for an EC P-256 key used for signing. This is a private key which should be kept secure.
// This key is used by the authorization server to sign JSON Web Tokens (JWTs).
//Let's explain each property in the JWK:
// "crv": The elliptic curve used by the key (P-256 in this case).
// "d": The private key value.
// "key_ops": The operations for which the key is intended (signing in this case).
// "kty": The key type (EC for elliptic curve).
// "x" and "y": The public key coordinates.
// "alg": The algorithm intended for use with the key (ES256 in this case).
// "use": The intended use of the key (signature).
// "kid": The key ID, a unique identifier for the key.

//What is the d value?
// The "d" property in the JWK represents the private key value for the elliptic curve key. 
// It is crucial for signing operations and must be kept secure. Can I share it publicly?
// No, the "d" value is the private key and should never be shared publicly. 
// Sharing it would compromise the security of the key. 
//Can I see the value behind it?
// No, the "d" value is private and should not be exposed.
//How is it generated?
// The "d" value is generated as part of the elliptic curve key pair creation process. 
// It is derived using cryptographic algorithms to ensure it is secure and unique.
//How x and y are used?
// The "x" and "y" properties represent the public key coordinates on the elliptic curve. 
// They are used to verify signatures created with the corresponding private key ("d").
// In other words, "x" and "y" form the public key that others can use to check the authenticity 
// of a message signed with the private key.


//Why the use is "sig" for the public key?
// The "use" property in the JWK indicates the intended use of the key. 
// For the public key, "sig" means it is intended for verifying signatures created with the corresponding private key.
// Shouldn't both the private and public keys have the same "use" value?
// Yes, both keys have "use": "sig" because the private key is used for signing and the public key 
// is used for verifying those signatures.


const projectDirectory = dirname(fileURLToPath(import.meta.url));
const keysDirectory = resolve(projectDirectory, 'keys');
const privateKeyPath = resolve(keysDirectory, 'private.jwk.json');
const publicKeyPath = resolve(keysDirectory, 'public.jwk.json');

export async function createKeys() {
    const { privateKey, publicKey } = await jose.generateKeyPair('ES256', { extractable: true });
    const privateJwk = await jose.exportJWK(privateKey);
    const publicJwk = await jose.exportJWK(publicKey);
    const kid = randomUUID();

    privateJwk.alg = 'ES256';
    privateJwk.use = 'sig';
    privateJwk.kid = kid;

    publicJwk.alg = 'ES256';
    publicJwk.use = 'sig';
    publicJwk.kid = kid;

    await mkdir(keysDirectory, { recursive: true });
    await Promise.all([
        writeFile(privateKeyPath, `${JSON.stringify(privateJwk, null, 2)}\n`, 'utf8'),
        writeFile(publicKeyPath, `${JSON.stringify(publicJwk, null, 2)}\n`, 'utf8')
    ]);

    return { privateJwk, publicJwk };
}

async function loadJwk(path) {
    try {
        return JSON.parse(await readFile(path, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error('Key files not found. Run `node .\\create-keys.js` first.');
        }

        throw error;
    }
}

export function loadPrivateJwk() {
    return loadJwk(privateKeyPath);
}

export function loadPublicJwk() {
    return loadJwk(publicKeyPath);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    await createKeys();
    console.log(`Created JWK files in ${keysDirectory}`);
}
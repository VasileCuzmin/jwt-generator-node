
import * as jose from 'jose';

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

let jwk = `{
  "crv": "P-256",
  "d": "xuSq6qgl4g6SzJC4g572gfvZJxzmP1IpPPDh5BYn9TU",
  "key_ops": [
    "sign"
  ],
  "kty": "EC",
  "x": "Ex7xduXhL1JAZaFIbELtoj0WqbIq9FzxqJxHg0WKaRg",
  "y": "jBVYmm3BmzevWO1ThV_y0AVJg8owbxhEXdTMG6iMDdo",
  "alg": "ES256",
  "use": "sig",
  "kid": "51750b264c29167ef85eec09b529fb60"
}`

let parsed = JSON.parse(jwk);


jose.importJWK(parsed).then(key => {
    return new jose.SignJWT({})
        .setProtectedHeader({ typ: 'JWT', alg: 'ES256', kid: parsed.kid })
        .setIssuer('https://idp.example.com')
        .setAudience('https://api.example1.com')
        .setSubject('user@example.com')
        .setExpirationTime('6m')
        .setIssuedAt()
        .sign(key)
        .then(token => {
            console.log(token);
        });
});


//What is a public key of this one?
// The public key consists of the "crv", "kty", "x", "y", "alg", "use", and "kid" properties from the JWK.
// It does not include the "d" property, which is the private key.
// Here is the public key corresponding to the private key above:
let publicJwk = {
    "crv": "P-256",
    "kty": "EC",
    "x": "Ex7xduXhL1JAZaFIbELtoj0WqbIq9FzxqJxHg0WKaRg",
    "y": "jBVYmm3BmzevWO1ThV_y0AVJg8owbxhEXdTMG6iMDdo",
    "alg": "ES256",
    "use": "sig",
    "key_ops": ["verify"],
    "kid": "51750b264c29167ef85eec09b529fb60"
};

//Why the use is "sig" for the public key?
// The "use" property in the JWK indicates the intended use of the key. 
// For the public key, "sig" means it is intended for verifying signatures created with the corresponding private key.
// Shouldn't both the private and public keys have the same "use" value?
// Yes, both keys have "use": "sig" because the private key is used for signing and the public key 
// is used for verifying those signatures.
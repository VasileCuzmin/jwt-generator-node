import * as jose from 'jose';

import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let publicJwk = `{
    "crv": "P-256",
    "kty": "EC",
    "x": "Ex7xduXhL1JAZaFIbELtoj0WqbIq9FzxqJxHg0WKaRg",
    "y": "jBVYmm3BmzevWO1ThV_y0AVJg8owbxhEXdTMG6iMDdo",
    "alg": "ES256",
    "use": "sig",
    "key_ops": ["verify"],
    "kid": "51750b264c29167ef85eec09b529fb60"
}`;

let parsedPublicJwk = JSON.parse(publicJwk);

rl.on('line', (token) => {

    jose.importJWK(parsedPublicJwk).then(key => {
        return jose.jwtVerify(token, key, {
            issuer: 'https://idp.example.com',
            audience: 'https://api.example.com'
        }).then(({ payload }) => {
            console.log('JWT is valid:', payload);
        }).catch(err => {
            console.error('JWT validation failed:', err);
        });
    });
});

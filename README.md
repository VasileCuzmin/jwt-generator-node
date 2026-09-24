# JWT Creator

A small Node.js example that creates and validates ES256 JSON Web Tokens (JWTs) with the [`jose`](https://www.npmjs.com/package/jose) library.

## Prerequisites

- Node.js 18 or later
- npm

## Install

```powershell
npm install
```

## Generate a token

```powershell
node .\generate-jwt.js
```

The command writes a signed JWT to standard output. Generated tokens include these claims:

- Issuer: `https://idp.example.com`
- Audience: `https://api.example1.com`
- Subject: `user@example.com`
- Expiration: six minutes after creation

## Validate a token

Start the validator and paste a token followed by Enter:

```powershell
node .\validate-jwt.js
```

The validator checks the token signature, issuer, and audience, then prints the decoded payload when valid.

## Audience configuration

The generator currently sets the audience to `https://api.example1.com`, but the validator expects `https://api.example.com`. A generated token will therefore fail validation until both scripts use the same audience value.

## Security

`generate-jwt.js` contains an embedded private JWK solely as an example. Do not use it in production or commit real private keys to source control. Store signing keys in a secrets manager or another protected runtime configuration mechanism, and distribute only the matching public JWK to token consumers.
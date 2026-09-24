# JWT Creator

A small Node.js example that creates and validates ES256 JSON Web Tokens (JWTs) with the [`jose`](https://www.npmjs.com/package/jose) library.

## Prerequisites

- Node.js 18 or later
- npm

## Install

```powershell
npm install
```

## Create keys

Generate a local ES256 key pair before generating or validating tokens:

```powershell
node .\create-keys.js
```

This writes `keys/private.jwk.json` and `keys/public.jwk.json`. The JWT scripts load those files, so they use the same key pair even when run in separate processes.

### Why two keys?

ES256 uses asymmetric cryptography: the private JWK signs tokens and must remain secret, while the matching public JWK verifies signatures and can be distributed to token consumers. This lets a consumer trust tokens issued by this application without also gaining the ability to create valid tokens.

A JWK is only a JSON representation of cryptographic key material. Although JWK files can be created directly, their values must form a valid related key pair. Generating the pair with a cryptographic library and exporting each key as a JWK safely creates that relationship; manually choosing fields such as the EC public coordinates `x` and `y` is not secure or practical.

## Generate a token

```powershell
node .\generate-jwt.js
```

The command writes a signed JWT to standard output. Generated tokens include these claims:

- Issuer: `https://idp.example.com`
- Audience: `https://api.example.com`
- Subject: `user@example.com`
- Expiration: six minutes after creation

## Validate a token

Start the validator and paste a token followed by Enter:

```powershell
node .\validate-jwt.js
```

The validator checks the token signature, issuer, and audience, then prints the decoded payload when valid.

## Security

Do not use the generated local keys in production or commit real private keys to source control. The private JWK includes `d`; never commit or share it. The public JWK has `crv`, `kty`, `x`, `y`, `alg`, `use`, and `kid`, but no `d`. Store signing keys in a secrets manager or another protected runtime configuration mechanism, and distribute only the matching public JWK to token consumers.
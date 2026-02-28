# Decap CMS GitHub OAuth — Netlify Functions

Minimal OAuth provider for Decap CMS. No dependencies, pure Node.js.

## Deploy

1. Fork this repo
2. Link it to your Netlify site
3. Set environment variables in Netlify:
   - `OAUTH_CLIENT_ID`
   - `OAUTH_CLIENT_SECRET`
4. Redeploy

## GitHub OAuth App settings

- Callback URL: `https://YOUR-APP.netlify.app/callback`

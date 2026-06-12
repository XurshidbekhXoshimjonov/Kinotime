# KinoTime beta deployment

Target domain: `https://beta.kinotime.net`

This project is a single Node/Express app, not a Next.js app. It serves `index.html`, `app.js`, `styles.css`, `/api/*`, and uploaded poster assets from the same service.

## Required environment variables

Set these on the hosting provider. Do not commit real values.

```env
NEXT_PUBLIC_SITE_URL=https://beta.kinotime.net
NEXT_PUBLIC_API_URL=https://beta.kinotime.net/api
BETA_NOINDEX=true

MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/kinotime?retryWrites=true&w=majority
MONGODB_DB=kinotime
MONGODB_MOVIES_COLLECTION=movies
MONGODB_SERIES_COLLECTION=series
MONGODB_ASSETS_COLLECTION=assets

JWT_SECRET=use-a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-password
NODE_ENV=production
```

`MONGODB_URI`, `JWT_SECRET`, and `ADMIN_PASSWORD` are server-only. They are not returned by `/api/config.js` and must not use a `NEXT_PUBLIC_` prefix.

## Build and start

```bash
npm install
npm run build
npm start
```

The app listens on `process.env.PORT || 3000`, which works locally and on Node hosts that inject `PORT`.

## MongoDB Atlas

Use the Atlas `mongodb+srv://...` connection string in `MONGODB_URI`. The server refuses catalog writes when MongoDB is not configured, and uploaded posters are stored in the MongoDB `assets` collection, then served from `/uploads/posters/:filename`.

For Atlas Network Access, allow the deployment provider's outbound IPs if they are stable. If the provider does not give stable outbound IPs, use Atlas' appropriate access-list option for that environment and keep database credentials strong.

## Render

1. Create a Render Web Service from the repository.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add every variable from the Required environment variables section.
5. Add `beta.kinotime.net` as a custom domain in Render.
6. Create the DNS record Render shows for that custom domain.
7. After DNS verifies, test:
   - `https://beta.kinotime.net/api/health`
   - `https://beta.kinotime.net/robots.txt`
   - admin login, create/edit/delete movie, create/edit/delete series, and poster upload.

## Railway

1. Create a Railway service from the repository.
2. Set variables from the Required environment variables section.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add `beta.kinotime.net` as a custom domain for the service.
6. Create the DNS record Railway shows and wait for TLS to become active.

## Vercel

This repository is not currently a Next.js app, so Render or Railway is the cleaner deployment target.

If the project is later converted to Next.js, deploy it on Vercel with the same environment variables, add `beta.kinotime.net` in Vercel Domains, and keep `MONGODB_URI`, `JWT_SECRET`, and `ADMIN_PASSWORD` as server-only variables. Do not store uploaded posters on Vercel's local filesystem; keep the current MongoDB-backed asset route or move assets to object storage.

## DNS

For a subdomain, create only the record required by the hosting provider:

- Usually a `CNAME` record: `beta` -> provider target such as `your-app.onrender.com` or Railway's generated target.
- If the provider gives an `A` record instead, use that exact value.

Do not create conflicting `A` and `CNAME` records for `beta` at the same time.

## Beta indexing protection

With `BETA_NOINDEX=true` or the host `beta.kinotime.net`, the server:

- injects `<meta name="robots" content="noindex, nofollow">` into HTML,
- sends `X-Robots-Tag: noindex, nofollow`,
- returns `Disallow: /` from `/robots.txt`.

## Provider references

- Render Node/Express deployment: https://render.com/docs/deploy-node-express-app
- Render custom domains: https://render.com/docs/custom-domains
- Railway Node/Express deployment: https://docs.railway.com/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel custom domains: https://vercel.com/docs/domains/working-with-domains/add-a-domain
- MongoDB Atlas connection strings: https://www.mongodb.com/docs/manual/reference/connection-string/

# WanderLust

WanderLust is an Express, MongoDB, EJS, Passport, and Cloudinary stay-listing app.

## Setup

1. Install Node.js `20.15.1`.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in the values:

```env
ATLASDB=
SECRET=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
ADMIN_EMAIL=dipanshuadmin@wanderlust.org
ADMIN_USERNAME=dipanshuadmin
ADMIN_PASSWORD=
PORT=8080
NODE_ENV=development
```

4. Start the app:

```bash
npm run dev
```

## Scripts

```bash
npm start
npm run dev
npm run check
npm run security:audit
npm run admin:ensure
```

## Admin

The admin area is available at `/admin` for users with `isAdmin: true`.

To promote or create the default admin account:

```bash
npm run admin:ensure
```

By default this targets `dipanshuadmin@wanderlust.org`. If that email already exists, the script promotes it to admin. If it does not exist yet, set `ADMIN_PASSWORD` first so the script can create the account.

## Production Notes

- Use a long random `SECRET` and rotate it if it is ever exposed.
- Keep `.env` out of git.
- Run `npm audit --audit-level=moderate` before deploys.
- Deploy behind HTTPS so secure cookies work correctly in production.
- Keep MongoDB Atlas network access restricted to trusted environments.
- Use Cloudinary credentials with the minimum required permissions.
- Monitor rate-limit events, server errors, authentication failures, and upload failures.
- Add database backups and alerting before handling real customer traffic.

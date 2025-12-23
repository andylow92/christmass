# Christmas Wishlist

A family Christmas wishlist app where family members can add gift ideas, mark items as purchased, and coordinate gift-giving without spoiling surprises.

## Features

- Create and manage your Christmas wishlist
- See family members' wishlists
- Mark gifts as purchased (hidden from the gift owner)
- Google OAuth and email/password authentication
- Email whitelist to restrict access to family members only

## Quick Deploy to Vercel

### Step 1: Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Click **New Project** and give it a name (e.g., "christmas-wishlist")
3. Copy the **Connection string** (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb`)
4. In the Neon dashboard, go to **SQL Editor** and run this to create the tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE gifts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  item TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Deploy to Vercel

1. Click the button below to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andylow92/christmass)

2. Connect your GitHub account and create the repository
3. **Before clicking Deploy**, add the environment variables (see Step 3)

### Step 3: Add Environment Variables

In the Vercel deployment screen, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `NEXTAUTH_SECRET` | Any random string (e.g., `my-super-secret-key-123`) |
| `NEXTAUTH_URL` | Leave empty for now, update after deploy |
| `ALLOWED_EMAILS` | Comma-separated family emails (see below) |

**For `ALLOWED_EMAILS`**, list everyone who should have access:
```
mom@gmail.com,dad@gmail.com,sister@gmail.com,brother@outlook.com
```

Only these emails can sign up. Anyone else gets blocked.

### Step 4: Update NEXTAUTH_URL (After Deploy)

1. After Vercel finishes deploying, copy your app URL (e.g., `https://christmas-wishlist-xyz.vercel.app`)
2. Go to your Vercel project → **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` and set it to your app URL
4. Go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

### Step 5 (Optional): Add Google Sign-In

If you want "Sign in with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. Choose **Web application**
5. Add to **Authorized JavaScript origins**: `https://your-app.vercel.app`
6. Add to **Authorized redirect URIs**: `https://your-app.vercel.app/api/auth/callback/google`
7. Copy the Client ID and Client Secret
8. Add these to your Vercel environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
9. Redeploy your app

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for session encryption |
| `NEXTAUTH_URL` | Yes | Your app's full URL |
| `ALLOWED_EMAILS` | No | Comma-separated whitelist of emails. If not set, anyone can sign up |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth sign-in |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth sign-in |

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/andylow92/christmass.git
   cd christmass
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your variables:
   ```
   DATABASE_URL=your_neon_connection_string
   NEXTAUTH_SECRET=any-random-secret
   NEXTAUTH_URL=http://localhost:3000
   ALLOWED_EMAILS=your@email.com
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 14
- PostgreSQL (Neon)
- Drizzle ORM
- NextAuth v5
- Tailwind CSS

## License

MIT

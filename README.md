# Christmas Wishlist

A family Christmas wishlist app where family members can add gift ideas, mark items as purchased, and coordinate gift-giving without spoiling surprises.

## Features

- Create and manage your Christmas wishlist
- See family members' wishlists
- Mark gifts as purchased (hidden from the gift owner)
- Google OAuth and email/password authentication
- Email whitelist to restrict access to family members only

## Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS

## Deployment

### 1. Set up the Database

Create a free PostgreSQL database at [Neon](https://neon.tech):

1. Create a new project
2. Copy the connection string

### 2. Set up Google OAuth (Optional)

If you want Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth credentials (Web application)
5. Add your domain to authorized origins and redirect URIs

### 3. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andylow92/christmass)

### 4. Configure Environment Variables

Add these environment variables in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | `your-random-secret-here` |
| `NEXTAUTH_URL` | Your app URL | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `ALLOWED_EMAILS` | Comma-separated list of allowed emails | `mom@gmail.com,dad@gmail.com` |

### 5. Restrict Access to Your Family

Set the `ALLOWED_EMAILS` environment variable with your family members' emails:

```
ALLOWED_EMAILS=mom@gmail.com,dad@gmail.com,sister@gmail.com,brother@outlook.com
```

Only these emails will be able to sign up. Anyone else will see an error message.

If `ALLOWED_EMAILS` is not set, anyone can sign up (open registration).

### 6. Run Database Migrations

After deploying, run the database migrations:

```bash
npm run db:push
```

Or connect to your Neon database and run the SQL schema manually.

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

3. Create a `.env` file:
   ```
   DATABASE_URL=your_neon_connection_string
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ALLOWED_EMAILS=your@email.com,family@email.com
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## License

MIT

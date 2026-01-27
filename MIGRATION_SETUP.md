# Orphan Bars - Post-Replit Migration Setup

## Issues Fixed

1. **✅ Vite Configuration** - Removed Replit-specific plugins and fixed async/await issue in `vite.config.ts`
2. **✅ Environment Variables** - Created `.env` file with necessary configuration

## Next Steps to Get Running

### 1. Database Setup
You need a PostgreSQL database. Choose one:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
sudo apt-get install postgresql postgresql-contrib

# Start the service
sudo service postgresql start

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE orphanbars;"
sudo -u postgres psql -c "CREATE USER orphanbars WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "ALTER ROLE orphanbars WITH CREATEDB;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE orphanbars TO orphanbars;"
```

**Option B: Cloud Database**
- Use a service like Neon, Supabase, or ElephantSQL
- Get your connection string

**Option C: Docker PostgreSQL**
```bash
docker run --name orphanbars-db -e POSTGRES_PASSWORD=password -e POSTGRES_USER=orphanbars -e POSTGRES_DB=orphanbars -p 5432:5432 -d postgres
```

### 2. Update `.env` File
Edit `/workspaces/Orphan-bars/.env` and fill in:
- `DATABASE_URL` - Your PostgreSQL connection string
- `RESEND_API_KEY` - Get from https://resend.com

### 3. Run Migrations
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

This starts both:
- Backend server on `http://localhost:5000`
- Frontend client on `http://localhost:5000`

### 5. (Optional) Set Up External Services
For full functionality, you'll need:
- **Email**: Resend API key (sign up at https://resend.com)
- **Storage**: Google Cloud Storage bucket (for image uploads)
- **AI**: OpenAI API key (if using AI features)

Add these to `.env` when ready.

## Troubleshooting

**Database connection error?**
- Verify `DATABASE_URL` is correct in `.env`
- Make sure PostgreSQL is running: `sudo service postgresql status`
- Test connection: `psql $DATABASE_URL`

**Port already in use?**
- Change `PORT` in `.env` to another port (e.g., 3000, 8000)
- Or kill the process: `lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill`

**Missing modules?**
```bash
npm install
```

**Clear cache and rebuild:**
```bash
rm -rf dist node_modules/.vite
npm run build
```

## Architecture

- **Backend**: Express.js server in `/server` running on port 5000
- **Frontend**: React + Vite client in `/client` served from same port
- **Database**: PostgreSQL with Drizzle ORM
- **Database Schema**: `/shared/schema.ts`

See `replit.md` for more original project information.

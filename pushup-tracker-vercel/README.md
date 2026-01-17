# OnlyPushups

A beautiful, modern push-up tracking app with a purple theme.

## Features

- 📊 Daily tracking with quick +25, +50, +75, +100 buttons
- 🎯 Yearly goal tracking (default: 20,000)
- 📅 Calendar view showing activity intensity
- ⏰ Backlog feature to log past workouts
- 🔥 Streak tracking
- 📈 Progress stats and daily averages
- 💾 Data persists in browser localStorage

## Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Create a new GitHub repository
2. Push this code to the repository
3. Go to [vercel.com](https://vercel.com) and sign up/log in
4. Click "Add New Project"
5. Import your GitHub repository
6. Click "Deploy" - Vercel auto-detects the Vite config
7. Your app is live!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# In this project folder, run:
vercel

# Follow the prompts
```

## Connect Your GoDaddy Domain

1. In Vercel Dashboard, go to your project → Settings → Domains
2. Add your domain (e.g., `pushups.yourdomain.com`)
3. Vercel will show you DNS records to add
4. In GoDaddy:
   - Go to DNS Management for your domain
   - Add a CNAME record:
     - Name: `pushups` (or `@` for root domain)
     - Value: `cname.vercel-dns.com`
   - Or add an A record pointing to Vercel's IP (shown in Vercel dashboard)
5. Wait 5-10 minutes for DNS to propagate
6. Your custom domain is live!

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons

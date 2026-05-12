# Debatra

> A turn-based debate platform that enforces evidence-backed arguments, clear progression, and well-defined victory conditions.

<img width="1864" height="1010" alt="image" src="https://github.com/user-attachments/assets/0823d105-ceca-46f4-8a03-6be15567b806" />

🌐 **[Live Demo](https://debatra.vercel.app/)**

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend + Backend | Next.js 15, React 19, TypeScript, Tailwind |
| Database & ORM | PostgreSQL, Prisma |
| Authentication | NextAuth.js |
| Email | Resend |
| Background Jobs | Vercel Cron, GitHub Actions |
| Rich Text Editor | Tiptap |
| Forms & Validation | React Hook Form, Zod |
| UI Components | shadcn/ui, Lucide Icons |
| Deployment & Hosting | Vercel, Supabase, GitHub |

---

## 🚀 Local Development (Requires Node 20+ and Podman or Docker) 

### 1. Start PostgreSQL container

```bash
podman run -d \
  --name debatra-postgres \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=debatra_dev \
  -p 5432:5432 \
  postgres:16
```

### 2. Clone and install

```bash
# Clone the repository
git clone https://github.com/JavierCaz/Debatra.git

# Navigate to project
cd Debatra

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your keys

# Push schema and seed
npx prisma db push
npm run seed

# Run development server
npm run dev
```

## 🔐 Environment Variables

| Variable | Description / Source |
|----------|----------------------|
| `DATABASE_URL` | PostgreSQL connection string: `postgresql://user:pass@localhost:5432/debate_platform?schema=public` |
| `NEXTAUTH_URL` | App URL: `http://localhost:3000` (dev) or your Vercel URL (prod) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in terminal |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 Client IDs |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `GITHUB_CLIENT_ID` | [GitHub OAuth Apps](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | Same as above |
| `RESEND_API_KEY` | [Resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Sender email: `noreply@yourdomain.com` |
| `NODE_ENV` | `development` (local) or `production` (Vercel auto-sets this) |
| `CRON_SECRET` | Any random string (e.g., `your_cron_secret_key`) |

> Copy `.env.example` to `.env` and fill in your values. Never commit `.env` to git — it's in `.gitignore`.

## 🚢 Deployment
Auto-deploys to Vercel on main branch push.

## 🧪 Test cron job locally
```bash
watch -n 15 'curl -s -X GET http://localhost:3000/api/cron/check-timeouts -H "Authorization: Bearer $CRON_SECRET"'
```

## 📦 Useful Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:turbo` | Start dev server with Turbopack (faster) |
| `npm run build` | Create production build |
| `npm run start` | Run production build locally |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Check code with Biome |
| `npm run format` | Auto-format code with Biome |
| `npm run type-check` | Run TypeScript type checker |

### Database (Prisma)

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply migration |
| `npm run prisma:push` | Push schema changes (no migration file) |
| `npm run prisma:studio` | Open database GUI |
| `npm run prisma:seed` | Run seed script |
| `npm run db:reset` | Reset database (destroys data) |

### Utilities

| Command | Description |
|---------|-------------|
| `npm run structure` | Generate project tree → `STRUCTURE.md` |

## 📖 Project Structure

```
app/                    # Next.js App Router
├── actions/            # Server actions (debates, definitions, notifications)
├── api/                # API routes (auth, arguments, definitions, profile)
├── debates/            # Debate pages (browse, detail, create)
├── auth/               # Authentication pages
└── profile/            # User profile pages

components/             # React components by domain
├── debate/             # Core debate UI (arguments, definitions, details, creation)
├── notification/       # Notification bell & list
├── profile/            # Profile editing, stats, settings
├── auth/               # User nav & protected routes
├── providers/          # React context (session, theme, language)
└── ui/                 # shadcn/ui primitives

lib/                    # Business logic & services
├── auth/               # NextAuth config & token cleanup
├── email/              # Resend email service & React Email templates
├── jobs/               # Cron job: debate timeout resolution
├── rate-limit/         # Rate limiter (memory-based)
└── prisma/             # Database client singleton

prisma/                 # Schema, migrations, seed data
hooks/                  # Custom hooks (useAuth, useDebateSubmission, useAccordionItems)
types/                  # TypeScript definitions (debate, definitions, notifications)
.github/workflows/      # CI pipeline + cron workflow
```

> Full tree available in [`STRUCTURE.md`](./STRUCTURE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run linting and type checks (`npm run lint && npm run type-check`)
5. Commit with a descriptive message
6. Push and open a pull request

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.


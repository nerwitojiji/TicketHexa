# TicketHexa – Developer Requirements

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| [Node.js](https://nodejs.org/) | 20.x |
| npm | 10.x |

> You can verify your versions with `node -v` and `npm -v`.

---

## Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd tickethexa

# 2. Install all dependencies (production + dev)
npm install
```

All packages are declared in `package.json` and will be installed automatically. No additional package manager is required.

---

## Environment Variables

Create a `.env` file in the project root (same folder as `package.json`) with the following variable:

```env
DATABASE_URL=your_neon_postgresql_connection_string_here
```

You can use the `.env.example` file included in the repository as a template:

```bash
cp .env.example .env
```

Then replace the placeholder with your real connection string from the [Neon dashboard](https://neon.tech).

> **Important:** Never commit the `.env` file to version control. It contains sensitive credentials.

---

## Database Setup

This project uses [Drizzle ORM](https://orm.drizzle.team/) with a [Neon](https://neon.tech) PostgreSQL database.

After configuring your `.env`, push the schema to your database:

```bash
npx drizzle-kit push
```

To open the Drizzle visual editor (optional):

```bash
npx drizzle-kit studio
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development server | `npm run dev` | Starts Next.js in development mode at `http://localhost:3000` |
| Production build | `npm run build` | Compiles and bundles the app for production |
| Production server | `npm run start` | Starts the compiled production build |
| Lint | `npm run lint` | Runs ESLint across the project |

---

## Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.x | React framework (routing, SSR, API routes) |
| [React](https://react.dev/) | 19.x | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Static typing |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.45.x | Type-safe SQL ORM |
| [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) | 0.31.x | Drizzle migrations & schema push CLI |
| [@neondatabase/serverless](https://neon.tech/docs/serverless/serverless-driver) | 1.x | Neon PostgreSQL serverless driver |
| [Radix UI](https://www.radix-ui.com/) | 1.x | Headless accessible UI primitives |
| [shadcn/ui](https://ui.shadcn.com/) | 4.x | Pre-built component system (uses Radix + CVA) |
| [class-variance-authority](https://cva.style/) | 0.7.x | Variant-based className utilities |
| [Lucide React](https://lucide.dev/) | 0.577.x | Icon library |
| [dotenv](https://github.com/motdotla/dotenv) | 17.x | Loads `.env` variables at runtime |

---

## Project Structure

```
tickethexa/
├── app/              # Next.js App Router (pages, layouts, global styles)
├── components/       # Reusable UI components (shadcn/ui)
├── db/
│   ├── index.ts      # Drizzle client instance
│   └── schema.ts     # Database schema definitions
├── lib/
│   └── utils.ts      # Shared utility functions
├── drizzle.config.ts # Drizzle Kit configuration
├── next.config.ts    # Next.js configuration
├── .env              # Environment variables (DO NOT COMMIT)
└── .env.example      # Template for environment variables
```

---

## Verification

After completing the steps above, run:

```bash
npm run dev
```

The app should be accessible at `http://localhost:3000` with no errors.

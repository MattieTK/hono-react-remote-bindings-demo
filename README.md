# D1 Remote Binding Test

A minimal app to test **Cloudflare D1 remote bindings** during local development using the Cloudflare Vite plugin and Hono.

## What This Tests

This app demonstrates connecting to a **remote D1 database** from local development. Instead of using a local SQLite file, the app connects directly to your production D1 database on Cloudflare's network while running `npm run dev`.

### The Stack

- **React** - Frontend UI
- **Vite** + **@cloudflare/vite-plugin** - Dev server with Workers runtime emulation
- **Hono** - Lightweight API framework running on Workers
- **Cloudflare D1** - Serverless SQL database with remote binding

## How It Works

### Remote Binding Configuration

The key configuration is in `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DATABASE",
    "database_name": "my-hono-db-test",
    "database_id": "9a34f1ed-3add-489f-86c5-7b3b225242c9",
    "remote": true  // <-- This enables remote binding
  }
]
```

Setting `"remote": true` tells the Cloudflare Vite plugin to connect to the actual D1 database instead of creating a local SQLite file.

### Vite Plugin Integration

The `@cloudflare/vite-plugin` in `vite.config.ts` reads the wrangler config and provides the D1 binding to your Worker during development:

```ts
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
});
```

### Database Schema

The counter table is defined in `migrations/0001_create_counter.sql`:

```sql
CREATE TABLE IF NOT EXISTS counter (
    id INTEGER PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0);
```

### API Endpoints

The Hono worker (`src/worker/index.ts`) exposes three endpoints:

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/api/counter`           | Fetch current counter value    |
| POST   | `/api/counter/increment` | Increment and return new value |
| POST   | `/api/counter/decrement` | Decrement and return new value |

Each endpoint queries the D1 database directly, so changes persist across page reloads and are shared across all clients.

## Local Setup

### Prerequisites

- Node.js 18+
- A Cloudflare account
- Wrangler CLI authenticated (`npx wrangler login`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a D1 Database

```bash
npx wrangler d1 create my-hono-db-test
```

Copy the returned `database_id` and update `wrangler.jsonc`.

### 3. Apply the Migration

Apply to the remote database:

```bash
npx wrangler d1 execute my-hono-db-test --remote --file=migrations/0001_create_counter.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The counter will load from and save to your remote D1 database.

## Deployment

```bash
npm run build && npm run deploy
```

## Switching Between Local and Remote

To use a **local** SQLite database instead (for offline development), remove or set `"remote": false` in `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DATABASE",
    "database_name": "my-hono-db-test",
    "database_id": "9a34f1ed-3add-489f-86c5-7b3b225242c9"
    // No "remote" key = local SQLite
  }
]
```

Then apply the migration locally:

```bash
npx wrangler d1 execute my-hono-db-test --local --file=migrations/0001_create_counter.sql
```

## Resources

- [D1 Remote Bindings Docs](https://developers.cloudflare.com/d1/build-with-d1/local-development/#develop-locally-with-remote-resources)
- [Cloudflare Vite Plugin](https://developers.cloudflare.com/workers/frameworks/framework-guides/vite/)
- [Hono Documentation](https://hono.dev/)

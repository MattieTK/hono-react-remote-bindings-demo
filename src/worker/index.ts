import { Hono } from "hono";

const app = new Hono<{ Bindings: Env & { DATABASE: D1Database } }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

// Get current counter value
app.get("/api/counter", async (c) => {
	const db = c.env.DATABASE;
	const result = await db.prepare("SELECT value FROM counter WHERE id = 1").first<{ value: number }>();
	return c.json({ value: result?.value ?? 0 });
});

// Increment counter
app.post("/api/counter/increment", async (c) => {
	const db = c.env.DATABASE;
	await db.prepare("UPDATE counter SET value = value + 1 WHERE id = 1").run();
	const result = await db.prepare("SELECT value FROM counter WHERE id = 1").first<{ value: number }>();
	return c.json({ value: result?.value ?? 0 });
});

// Decrement counter
app.post("/api/counter/decrement", async (c) => {
	const db = c.env.DATABASE;
	await db.prepare("UPDATE counter SET value = value - 1 WHERE id = 1").run();
	const result = await db.prepare("SELECT value FROM counter WHERE id = 1").first<{ value: number }>();
	return c.json({ value: result?.value ?? 0 });
});

export default app;

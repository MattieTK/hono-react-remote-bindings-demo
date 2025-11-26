import { useState, useEffect } from "react";
import cloudflareLogo from "./assets/Cloudflare_Logo.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch initial counter value on mount
	useEffect(() => {
		fetch("/api/counter")
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<{ value: number }>;
			})
			.then((data) => {
				setCount(data.value);
				setError(null);
			})
			.catch((e) => setError(e.message));
	}, []);

	const handleIncrement = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/counter/increment", { method: "POST" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json() as { value: number };
			setCount(data.value);
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	const handleDecrement = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/counter/decrement", { method: "POST" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json() as { value: number };
			setCount(data.value);
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="app">
			<header>
				<img src={cloudflareLogo} className="logo" alt="Cloudflare logo" />
				<h1>D1 Remote Binding Test</h1>
				<p className="subtitle">Testing Cloudflare D1 database with remote binding</p>
			</header>

			<main className="counter-card">
				<h2>Counter</h2>
				<div className="counter-container">
					<button
						onClick={handleDecrement}
						disabled={loading || count === null || error !== null}
						aria-label="decrement"
						className="counter-btn decrement"
					>
						−
					</button>
					<span className="counter-value">
						{error ? "!" : count === null ? "..." : count}
					</span>
					<button
						onClick={handleIncrement}
						disabled={loading || count === null || error !== null}
						aria-label="increment"
						className="counter-btn increment"
					>
						+
					</button>
				</div>
				{error && <p className="error">Error: {error}</p>}
				{!error && <p className="status">Synced with remote D1 database</p>}
			</main>

			<footer>
				<p>Each click updates the database in real-time</p>
			</footer>
		</div>
	);
}

export default App;

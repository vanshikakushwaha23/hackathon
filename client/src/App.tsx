import { useEffect, useState } from 'react';
import './App.css';

type HealthResponse = {
  status: string;
};

function App() {
  const [apiStatus, setApiStatus] = useState<string>('checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function checkHealth() {
      try {
        const response = await fetch('/api/health', { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: HealthResponse = await response.json();
        setApiStatus(data.status);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
        setApiStatus('offline');
      }
    }

    void checkHealth();

    return () => controller.abort();
  }, []);

  return (
    <main className="app">
      <section className="intro">
        <h1>React + Node Starter</h1>
        <p>
          This project pairs a Vite/React frontend with an Express backend. Use it as a jumping off
          point for full-stack features.
        </p>
      </section>

      <section className="status">
        <h2>API Status</h2>
        {error ? (
          <p className="error">Failed to reach API: {error}</p>
        ) : (
          <p className="success">Backend reports: {apiStatus}</p>
        )}
        <p className="hint">
          The frontend proxies <code>/api</code> requests to the Node server during development.
        </p>
      </section>
    </main>
  );
}

export default App;

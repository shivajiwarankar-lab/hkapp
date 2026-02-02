'use client';

import { useState } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, name }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            setStatus({
                type: 'success',
                message: `Build triggered! Check the "Releases" tab in your GitHub repo in a few minutes.`
            });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h1>Web to App</h1>
                <p className="subtitle">Convert any website into a Windows .exe & Android APK</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="url">Website URL</label>
                        <input
                            id="url"
                            type="url"
                            className="glass-input"
                            placeholder="https://example.com"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">App Name</label>
                        <input
                            id="name"
                            type="text"
                            className="glass-input"
                            placeholder="My App"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="glass-button" disabled={loading}>
                        {loading ? 'Starting Build...' : 'Generate App'}
                    </button>
                </form>

                {status && (
                    <div className={`status-box ${status.type === 'success' ? 'status-success' : 'status-error'} active`}>
                        {status.message}
                    </div>
                )}
            </div>
        </main>
    );
}

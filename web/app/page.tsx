'use client';

import { useState, useEffect } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [releases, setReleases] = useState<any[]>([]);

    // Fetch builds on load
    useEffect(() => {
        fetch('/api/releases').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setReleases(data);
        }).catch(err => console.error(err));
    }, []);

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

                {/* Downloads Section */}
                {releases.length > 0 && (
                    <div style={{ marginTop: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Recent Builds</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {releases.slice(0, 5).map((release: any) => (
                                <div key={release.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{release.name || release.tag_name}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(release.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {release.assets.map((asset: any) => (
                                            <a
                                                key={asset.id}
                                                href={asset.browser_download_url}
                                                target="_blank"
                                                className="glass-button"
                                                style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none', textAlign: 'center', width: 'auto' }}
                                            >
                                                Download {asset.name.endsWith('.apk') ? 'Android APK' : 'Windows App'}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

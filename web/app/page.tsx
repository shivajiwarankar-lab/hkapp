'use client';

import { useState, useEffect } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [buildWindows, setBuildWindows] = useState(true);
    const [buildAndroid, setBuildAndroid] = useState(true);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [releases, setReleases] = useState<any[]>([]);

    // Fetch builds
    const fetchReleases = () => {
        fetch('/api/releases').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setReleases(data);
        }).catch(err => console.error(err));
    };

    useEffect(() => {
        fetchReleases();
        const interval = setInterval(fetchReleases, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const platforms = [];
            if (buildWindows) platforms.push('windows');
            if (buildAndroid) platforms.push('android');

            const res = await fetch('/api/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, name, platforms }),
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

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this release?')) return;

        try {
            const res = await fetch('/api/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Failed to delete');

            // Refresh list
            fetchReleases();
        } catch (err) {
            alert('Error deleting release');
            console.error(err);
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

                    <div className="form-group">
                        <label style={{ marginBottom: '0.5rem', display: 'block' }}>Platforms</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                                <input
                                    type="checkbox"
                                    checked={buildWindows}
                                    onChange={(e) => setBuildWindows(e.target.checked)}
                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                />
                                Windows
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                                <input
                                    type="checkbox"
                                    checked={buildAndroid}
                                    onChange={(e) => setBuildAndroid(e.target.checked)}
                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                />
                                Android
                            </label>
                        </div>
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
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Recent Builds</h2>
                            <button
                                onClick={fetchReleases}
                                className="glass-button"
                                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                                ↻ Refresh
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {releases.slice(0, 5).map((release: any) => (
                                <div key={release.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{release.name || release.tag_name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(release.created_at).toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(release.id)}
                                            style={{
                                                background: 'transparent', border: '1px solid #ef4444',
                                                color: '#ef4444', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer'
                                            }}
                                            title="Delete Release"
                                        >
                                            🗑 Delete
                                        </button>
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

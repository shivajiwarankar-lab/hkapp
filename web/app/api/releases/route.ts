import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const githubToken = process.env.GITHUB_PAT;
        const repo = process.env.GITHUB_REPOSITORY; // format: owner/repo

        if (!repo) {
            return NextResponse.json({ error: 'Server configuration error: GITHUB_REPOSITORY missing' }, { status: 500 });
        }

        // Note: GITHUB_PAT is optional for publicrepos, but good for rate limits
        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
        };
        if (githubToken) {
            headers['Authorization'] = `Bearer ${githubToken}`;
        }

        const res = await fetch(`https://api.github.com/repos/${repo}/releases`, { headers: headers });

        if (!res.ok) {
            // If config is wrong (e.g. repo doesn't exist yet), return empty list gracefully
            if (res.status === 404) return NextResponse.json([]);
            throw new Error(`GitHub API error: ${res.statusText}`);
        }

        const releases = await res.json();
        return NextResponse.json(releases);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

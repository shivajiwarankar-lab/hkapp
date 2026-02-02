import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url, name } = await req.json();

        if (!url || !name) {
            return NextResponse.json({ error: 'URL and Name are required' }, { status: 400 });
        }

        const githubToken = process.env.GITHUB_PAT;
        const repo = process.env.GITHUB_REPOSITORY; // format: owner/repo

        if (!githubToken || !repo) {
            return NextResponse.json({ error: 'Server configuration error: GITHUB_PAT or GITHUB_REPOSITORY missing' }, { status: 500 });
        }

        const workflows = ['build-windows.yml', 'build-android.yml'];
        const results = [];

        for (const workflow of workflows) {
            const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ref: 'main',
                    inputs: {
                        app_url: url,
                        app_name: name,
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to trigger ${workflow}:`, errorText);
                results.push({ workflow, status: 'failed', error: errorText });
            } else {
                results.push({ workflow, status: 'success' });
            }
        }

        const failures = results.filter(r => r.status === 'failed');
        if (failures.length > 0) {
            // Serialize the failure details for the client
            return NextResponse.json({
                error: 'Failed to trigger some builds',
                details: failures.map(f => `${f.workflow}: ${f.error}`)
            }, { status: 500 });
        }

        return NextResponse.json({ message: 'Builds triggered successfully' });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

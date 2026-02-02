import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url, name, platforms } = await req.json();

        if (!url || !name) {
            return NextResponse.json({ error: 'URL and Name are required' }, { status: 400 });
        }

        const githubToken = process.env.GITHUB_PAT;
        const repo = process.env.GITHUB_REPOSITORY; // format: owner/repo

        if (!githubToken || !repo) {
            return NextResponse.json({ error: 'Server configuration error: GITHUB_PAT or GITHUB_REPOSITORY missing' }, { status: 500 });
        }

        const allWorkflows: Record<string, string> = {
            'windows': 'build-windows.yml',
            'android': 'build-android.yml'
        };

        // Default to both if not specified, otherwise filter
        const selectedWorkflows = [];
        if (!platforms || platforms.length === 0) {
            selectedWorkflows.push(...Object.values(allWorkflows));
        } else {
            platforms.forEach((p: string) => {
                if (allWorkflows[p]) selectedWorkflows.push(allWorkflows[p]);
            });
        }

        // Validate we have at least one
        if (selectedWorkflows.length === 0) {
            return NextResponse.json({ error: 'No valid platforms selected' }, { status: 400 });
        }

        const results = [];

        for (const workflow of selectedWorkflows) {
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

import { NextResponse } from 'next/server';

export async function DELETE() {
    try {
        const githubToken = process.env.GITHUB_PAT;
        const repo = process.env.GITHUB_REPOSITORY;

        if (!githubToken || !repo) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 1. Fetch all runs
        const listRes = await fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=100`, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (!listRes.ok) {
            throw new Error(`Failed to fetch runs: ${listRes.statusText}`);
        }

        const data = await listRes.json();
        const runs = data.workflow_runs || [];

        // 2. Delete each run
        const deletePromises = runs.map((run: any) =>
            fetch(`https://api.github.com/repos/${repo}/actions/runs/${run.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            })
        );

        await Promise.all(deletePromises);

        return NextResponse.json({ message: `Cleaned up ${runs.length} workflow runs.` });

    } catch (error: any) {
        console.error('Cleanup API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

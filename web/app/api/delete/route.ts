import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
        }

        const githubToken = process.env.GITHUB_PAT;
        const repo = process.env.GITHUB_REPOSITORY; // format: owner/repo

        if (!githubToken || !repo) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const res = await fetch(`https://api.github.com/repos/${repo}/releases/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to delete release: ${res.statusText}`);
        }

        return NextResponse.json({ message: 'Release deleted successfully' });

    } catch (error: any) {
        console.error('Delete API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

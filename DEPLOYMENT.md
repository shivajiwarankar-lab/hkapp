# Deployment Guide

Follow these steps to launch your Web-to-App Converter.

## Step 1: Push to GitHub

1.  Create a **New Repository** on GitHub (e.g., named `web-to-app`).
2.  Run the following commands in your terminal (inside this folder):

```bash
git remote add origin https://github.com/YOUR_USERNAME/web-to-app.git
git branch -M main
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username)*

## Step 2: Get a Security Token (PAT)

1.  Go to **GitHub Settings** -> **Developer settings**.
2.  Click **Personal access tokens** -> **Tokens (classic)**.
3.  Click **Generate new token (classic)**.
4.  Name it: `WebToAppBuilder`.
5.  **Select Scopes** (Check these boxes):
    - [x] `repo` (Full control of private repositories)
    - [x] `workflow` (Update GitHub Action workflows)
6.  Click **Generate token**.
7.  **COPY THIS TOKEN IMMEDIATELY**. You won't see it again.

## Step 3: Deploy to Vercel (The Website)

1.  Go to [Vercel.com](https://vercel.com) and Log in.
2.  Click **"Add New..."** -> **Project**.
3.  Find your `web-to-app` repository and click **Import**.
4.  **Configure Project**:
    - **Root Directory**: Click "Edit" and select `web`.
    - **Environment Variables**: Add these two:
        - `GITHUB_PAT`: Paste the token you copied in Step 2.
        - `GITHUB_REPOSITORY`: Type your `username/repo-name` (e.g., `johndoe/web-to-app`).
5.  Click **Deploy**.

## Step 4: Done!

- Visit your new Vercel website URL.
- Enter a URL (e.g., `https://google.com`) and a Name (e.g., `Google App`).
- Click **Generate**.
- Wait ~10 minutes.
- Check the **Releases** section of your GitHub Repository to download the`.exe` or `.apk`!

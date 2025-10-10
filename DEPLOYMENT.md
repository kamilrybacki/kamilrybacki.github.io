# 🚀 GitHub Pages Deployment Setup Instructions

Your CI/CD pipeline is ready! Follow these steps to complete the setup:

## 📋 Prerequisites Checklist

- ✅ Repository name: `kamilrybacki.github.io` (must match your GitHub username)
- ✅ CI/CD workflow created: `.github/workflows/deploy.yml`
- ✅ Build script configured: `npm run build`
- ✅ Static assets properly configured in `.eleventy.js`

## 🔧 GitHub Repository Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **"GitHub Actions"**
4. Save the settings

### 2. Push Your Code

```bash
# Add all files
git add .

# Commit your changes
git commit -m "Add CI/CD pipeline and deploy to GitHub Pages"

# Push to main branch (this will trigger deployment)
git push origin main
```

### 3. Monitor Deployment

1. Go to **Actions** tab in your repository
2. Watch the "Deploy to GitHub Pages" workflow
3. Once complete, your site will be live at: `https://kamilrybacki.github.io`

## 🛠️ Local Testing

Before pushing, test the build locally:

```bash
# Run the deployment test script
./deploy-test.sh

# Or manually:
npm run clean
npm run build
```

## 🔄 Automatic Deployment

After setup, the workflow will automatically:

- **Trigger**: On every push to `main` branch
- **Build**: Install dependencies and run `npm run build`
- **Deploy**: Upload the `_site` directory to GitHub Pages
- **Go Live**: Your changes appear at `https://kamilrybacki.github.io`

## 🎯 Deployment Workflow

```text
Push to main → GitHub Actions → npm ci → npm run build → Deploy to Pages → Live Site
```

## 📂 What Gets Deployed

The CI/CD pipeline builds and deploys:

- ✅ All HTML pages from your 11ty build
- ✅ CSS styles from `src/styles/` (copied to `styles/`)
- ✅ Images from `public/images/` (copied to `public/images/`)
- ✅ Any other static assets defined in `.eleventy.js`

## 🔧 Troubleshooting

### Build Fails

- Check the Actions tab for error messages
- Test locally with `npm run build`
- Ensure all dependencies are in `package.json`

### Site Not Updating

- Check if GitHub Pages source is set to "GitHub Actions"
- Verify the workflow completed successfully
- Clear your browser cache

### Domain Issues

- For `username.github.io` repositories, no custom domain setup needed
- Site will be available at `https://kamilrybacki.github.io`

## 🎉 You're Ready

Once you push to main, your professional blog will be live and automatically updated with every commit!

---

**Next Steps**: Push your code and watch your site go live! 🚀
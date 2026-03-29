# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Vercel account connected: `vercel login`

## 🔧 Environment Variables Setup

### Method 1: Using Vercel CLI (Recommended)

```bash
# Navigate to project directory
cd Project/PRN_FE

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://prn232-backend-production.up.railway.app/api

vercel env add VITE_GOOGLE_CLIENT_ID production
# Enter: 571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com

vercel env add VITE_GITHUB_CLIENT_ID production
# Enter: Ov23li4fDC9o1CVWZzIU

# Also add for preview and development environments
vercel env add VITE_API_URL preview
vercel env add VITE_GOOGLE_CLIENT_ID preview
vercel env add VITE_GITHUB_CLIENT_ID preview
```

### Method 2: Using Vercel Dashboard (Web UI)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://prn232-backend-production.up.railway.app/api` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com` | Production, Preview, Development |
| `VITE_GITHUB_CLIENT_ID` | `Ov23li4fDC9o1CVWZzIU` | Production, Preview, Development |

5. Click **Save**

## 🚀 Deployment Commands

### First Time Deployment

```bash
cd Project/PRN_FE

# Deploy to production
vercel --prod
```

### Subsequent Deployments

```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod
```

## ✅ Verify Deployment

After deployment, verify:

1. **Environment Variables Loaded:**
   - Open browser console on deployed site
   - Check: `import.meta.env.VITE_API_URL`
   - Should show: `https://prn232-backend-production.up.railway.app/api`

2. **API Connection:**
   - Try logging in
   - Check Network tab for API calls to Railway backend

3. **OAuth Login:**
   - Test Google login
   - Test GitHub login
   - Verify redirect URIs are correct

## 🔄 Update Environment Variables

If you need to update environment variables:

```bash
# Remove old variable
vercel env rm VITE_API_URL production

# Add new variable
vercel env add VITE_API_URL production
```

Or update via Vercel Dashboard.

## 🐛 Troubleshooting

### Issue: Environment variables not loading

**Solution:**
```bash
# Pull environment variables locally
vercel env pull

# Rebuild and redeploy
vercel --prod --force
```

### Issue: OAuth redirect URI mismatch

**Solution:**
1. Update Google OAuth Console:
   - Authorized redirect URIs: `https://your-app.vercel.app/auth/callback`
2. Update GitHub OAuth App:
   - Authorization callback URL: `https://your-app.vercel.app/auth/callback`

### Issue: CORS errors

**Solution:**
Backend already has CORS configured for:
- `https://prn232.store`
- `https://www.prn232.store`

If using different domain, update backend CORS in `Program.cs`.

## 📝 Custom Domain (Optional)

If you want to use `prn232.store`:

```bash
# Add domain
vercel domains add prn232.store

# Follow DNS configuration instructions
```

Then update backend CORS to include your custom domain.

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel CLI Docs: https://vercel.com/docs/cli
- Environment Variables: https://vercel.com/docs/environment-variables

## 📞 Support

If deployment fails, check:
1. Build logs in Vercel dashboard
2. Environment variables are set correctly
3. Backend API is accessible from Vercel servers

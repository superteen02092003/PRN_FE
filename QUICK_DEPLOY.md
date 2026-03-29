# ⚡ Quick Deploy to Vercel

## 🚀 Option 1: Automated Setup (Recommended)

### Windows (PowerShell):
```powershell
cd Project/PRN_FE
.\setup-vercel-env.ps1
vercel --prod
```

### Linux/Mac (Bash):
```bash
cd Project/PRN_FE
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
vercel --prod
```

---

## 🔧 Option 2: Manual Setup via CLI

```bash
cd Project/PRN_FE

# Set environment variables
vercel env add VITE_API_URL production
# Paste: https://prn232-backend-production.up.railway.app/api

vercel env add VITE_GOOGLE_CLIENT_ID production
# Paste: 571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com

vercel env add VITE_GITHUB_CLIENT_ID production
# Paste: Ov23li4fDC9o1CVWZzIU

# Deploy
vercel --prod
```

---

## 🌐 Option 3: Via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add these 3 variables for **Production, Preview, Development**:

```
VITE_API_URL = https://prn232-backend-production.up.railway.app/api
VITE_GOOGLE_CLIENT_ID = 571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID = Ov23li4fDC9o1CVWZzIU
```

5. Redeploy: `vercel --prod`

---

## ✅ Verify Deployment

After deployment:

1. **Check Environment Variables:**
   ```javascript
   // Open browser console on deployed site
   console.log(import.meta.env.VITE_API_URL)
   // Should show: https://prn232-backend-production.up.railway.app/api
   ```

2. **Test Features:**
   - ✅ Login/Register
   - ✅ Google OAuth
   - ✅ GitHub OAuth
   - ✅ Product browsing
   - ✅ Add to cart
   - ✅ Checkout

---

## 🐛 Troubleshooting

### Environment variables not working?
```bash
# Force rebuild
vercel --prod --force
```

### OAuth redirect errors?
Update OAuth app settings:
- **Google Console**: Add `https://your-app.vercel.app/auth/callback`
- **GitHub Settings**: Add `https://your-app.vercel.app/auth/callback`

### CORS errors?
Backend already configured for:
- `https://prn232.store`
- `https://www.prn232.store`

If using different domain, update backend `Program.cs` CORS settings.

---

## 📝 Current Configuration

| Variable | Value |
|----------|-------|
| Backend API | https://prn232-backend-production.up.railway.app/api |
| Google Client ID | 571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com |
| GitHub Client ID | Ov23li4fDC9o1CVWZzIU |

---

## 🔗 Useful Commands

```bash
# Check current environment variables
vercel env ls

# Pull environment variables to local
vercel env pull

# Remove environment variable
vercel env rm VITE_API_URL production

# View deployment logs
vercel logs

# List all deployments
vercel ls
```

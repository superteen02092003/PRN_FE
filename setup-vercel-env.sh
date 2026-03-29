#!/bin/bash

# Setup Vercel Environment Variables
# Run this script after: vercel login

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# API URL
echo "Setting VITE_API_URL..."
echo "https://prn232-backend-production.up.railway.app/api" | vercel env add VITE_API_URL production
echo "https://prn232-backend-production.up.railway.app/api" | vercel env add VITE_API_URL preview
echo "https://prn232-backend-production.up.railway.app/api" | vercel env add VITE_API_URL development

# Google Client ID
echo "Setting VITE_GOOGLE_CLIENT_ID..."
echo "571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com" | vercel env add VITE_GOOGLE_CLIENT_ID production
echo "571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com" | vercel env add VITE_GOOGLE_CLIENT_ID preview
echo "571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com" | vercel env add VITE_GOOGLE_CLIENT_ID development

# GitHub Client ID
echo "Setting VITE_GITHUB_CLIENT_ID..."
echo "Ov23li4fDC9o1CVWZzIU" | vercel env add VITE_GITHUB_CLIENT_ID production
echo "Ov23li4fDC9o1CVWZzIU" | vercel env add VITE_GITHUB_CLIENT_ID preview
echo "Ov23li4fDC9o1CVWZzIU" | vercel env add VITE_GITHUB_CLIENT_ID development

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Verify deployment at your Vercel URL"

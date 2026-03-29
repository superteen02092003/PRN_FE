# Setup Vercel Environment Variables (PowerShell)
# Run this script after: vercel login

Write-Host "🚀 Setting up Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Function to add environment variable
function Add-VercelEnv {
    param (
        [string]$Name,
        [string]$Value,
        [string]$Environment
    )
    
    Write-Host "Setting $Name for $Environment..." -ForegroundColor Yellow
    echo $Value | vercel env add $Name $Environment
}

# API URL
$apiUrl = "https://prn232-backend-production.up.railway.app/api"
Add-VercelEnv -Name "VITE_API_URL" -Value $apiUrl -Environment "production"
Add-VercelEnv -Name "VITE_API_URL" -Value $apiUrl -Environment "preview"
Add-VercelEnv -Name "VITE_API_URL" -Value $apiUrl -Environment "development"

# Google Client ID
$googleClientId = "571495207196-eku74j0800ra1ng3gchtprk7reihrnfi.apps.googleusercontent.com"
Add-VercelEnv -Name "VITE_GOOGLE_CLIENT_ID" -Value $googleClientId -Environment "production"
Add-VercelEnv -Name "VITE_GOOGLE_CLIENT_ID" -Value $googleClientId -Environment "preview"
Add-VercelEnv -Name "VITE_GOOGLE_CLIENT_ID" -Value $googleClientId -Environment "development"

# GitHub Client ID
$githubClientId = "Ov23li4fDC9o1CVWZzIU"
Add-VercelEnv -Name "VITE_GITHUB_CLIENT_ID" -Value $githubClientId -Environment "production"
Add-VercelEnv -Name "VITE_GITHUB_CLIENT_ID" -Value $githubClientId -Environment "preview"
Add-VercelEnv -Name "VITE_GITHUB_CLIENT_ID" -Value $githubClientId -Environment "development"

Write-Host ""
Write-Host "✅ Environment variables setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: vercel --prod"
Write-Host "2. Verify deployment at your Vercel URL"

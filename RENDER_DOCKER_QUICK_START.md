# 🚀 Render Deployment - Docker Quick Start

Deploy your password-protected DCSC Attendance Dashboard to Render in 5 minutes!

## ✅ What You Get

- 🔐 **Password Protected** - Only authorized users can access
- 🐳 **Docker Containerized** - Consistent, reliable deployment
- 🔄 **Auto-Deploy** - Push to GitHub, automatic updates on Render
- 🌐 **Public URL** - Access from anywhere
- 📊 **Full Dashboard** - All features working in production

---

## 📝 Quick Deployment Steps

### 1️⃣ Push to GitHub (1 minute)

```bash
cd /Users/amin/Documents/GitHub/DCSC-Attendance
git add .
git commit -m "Add Docker and password protection"
git push origin main
```

### 2️⃣ Create Render Web Service (2 minutes)

1. Go to: https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** if not connected to GitHub
4. Find and select: **`DCSC-Attendance`** repository
5. Click **"Connect"**

### 3️⃣ Configure Service (1 minute)

Render will auto-detect Docker! Just verify:

- **Name**: `dcsc-attendance-dashboard`
- **Environment**: `Docker` ✅ (auto-detected)
- **Instance Type**: `Free` or `Starter`

Scroll down to **"Advanced"** → **"Environment Variables"**

### 4️⃣ Set Password (1 minute)

Add these TWO environment variables:

**Variable 1:**
```
Key:   BASIC_AUTH_USERNAME
Value: dcsc_admin
```
Click **"Add Environment Variable"**

**Variable 2:**
```
Key:   BASIC_AUTH_PASSWORD
Value: [YOUR-STRONG-PASSWORD]
```
Click **"Add Environment Variable"**

> 💡 **Password Tips**: 
> - Use at least 12 characters
> - Mix uppercase, lowercase, numbers, symbols
> - Example: `DCSC@ttend2025!`

### 5️⃣ Deploy! (3-5 minutes)

1. Click **"Create Web Service"**
2. Wait for build to complete (watch logs)
3. Look for: **"Your service is live 🎉"**
4. Click the URL (e.g., `https://dcsc-attendance-dashboard.onrender.com`)

### 6️⃣ Login & Test

1. Browser will show login prompt
2. Enter your username and password
3. Click **Sign In**
4. Upload your CSV file
5. Explore the dashboard!

---

## 🔐 Login Credentials

After deployment, users access the site with:

- **URL**: `https://your-app-name.onrender.com`
- **Username**: Value of `BASIC_AUTH_USERNAME` (e.g., `dcsc_admin`)
- **Password**: Value of `BASIC_AUTH_PASSWORD` (your strong password)

> 📧 **Share these credentials securely** with authorized club staff only!

---

## 🔄 How to Update

Anytime you make changes:

```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

Render automatically rebuilds and redeploys (2-3 minutes).

---

## 🧪 Test Locally with Docker (Optional)

Before deploying to Render, test locally:

```bash
# Option 1: Use the script
./docker-run.sh

# Option 2: Manual commands
docker build -t dcsc-attendance .
docker run -p 8080:8080 \
  -e BASIC_AUTH_USERNAME=admin \
  -e BASIC_AUTH_PASSWORD=test123 \
  dcsc-attendance
```

Then visit: http://localhost:8080
Login with: `admin` / `test123`

---

## ⚙️ Configuration Details

### Environment Variables

| Variable | Set Where | Purpose |
|----------|-----------|---------|
| `SECRET_KEY` | Auto-generated | Flask session security |
| `BASIC_AUTH_USERNAME` | You set in Render | Login username |
| `BASIC_AUTH_PASSWORD` | You set in Render | Login password |

### Docker Configuration

The `Dockerfile` includes:
- Python 3.11 slim base image
- All dependencies from `requirements.txt`
- Gunicorn production server
- Port 8080 exposed
- Optimized for Render

### render.yaml

Automatically configures:
- Docker environment
- Port mapping
- Environment variables
- Auto-deploy from GitHub

---

## 🆘 Troubleshooting

### ❌ Build Failed

**Check**: 
- Render build logs for specific error
- Verify all files pushed to GitHub
- Check Dockerfile syntax

**Fix**: 
```bash
# Test Docker build locally
docker build -t dcsc-attendance .
```

### ❌ Can't Login

**Check**:
- Username and password in Render environment variables
- Case sensitivity (passwords are case-sensitive!)
- No extra spaces in credentials

**Fix**:
- Go to Render → Service → Environment
- Verify `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`
- Click **"Save Changes"** to trigger redeploy

### ❌ Service Unavailable (Free Tier)

**Reason**: Free tier spins down after 15 min inactivity

**Solution**: 
- First request takes ~30 seconds to wake up
- Refresh the page
- Or upgrade to paid tier for always-on

### ❌ Upload Not Working

**Check**: 
- File size < 16MB
- CSV format is correct
- Check Render logs for errors

---

## 🎯 What's Different from Before

| Feature | Before | Now |
|---------|--------|-----|
| Deployment | Python | Docker 🐳 |
| Protection | None | Password 🔐 |
| Updates | Manual | Auto from GitHub 🔄 |
| Reliability | Variable | Consistent ✅ |

---

## 📱 Sharing Access

To give access to club staff:

1. **Share the URL**: `https://your-app.onrender.com`
2. **Share credentials** (securely):
   - Username: `dcsc_admin` (or what you set)
   - Password: [Your password]
3. **Recommend**: Use a password manager to share securely

### Change Password Later

1. Go to Render → Your Service → Environment
2. Edit `BASIC_AUTH_PASSWORD` value
3. Click **"Save Changes"**
4. Render redeploys with new password (2-3 min)

---

## ✅ Deployment Success Checklist

After deployment, verify:

- [ ] Site loads (may take 30 sec first time on free tier)
- [ ] Login prompt appears
- [ ] Can login with credentials
- [ ] Upload CSV file works
- [ ] All 4 tabs display correctly
- [ ] Charts render properly
- [ ] Filters work on Overview tab
- [ ] Calendars display on Players/Teams tabs

---

## 🎉 You're Done!

Your DCSC Attendance Dashboard is now:
- ✅ Live on the internet
- ✅ Password protected
- ✅ Auto-updating from GitHub
- ✅ Ready for production use

**Enjoy your secure, professional dashboard!** 🏆

---

## 📧 Support

For issues:
1. Check Render logs first
2. Review this guide
3. Test locally with Docker
4. Check `render.yaml` configuration

**Render Dashboard**: https://dashboard.render.com/


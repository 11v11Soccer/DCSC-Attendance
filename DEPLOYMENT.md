# 🚀 Deployment Guide for DCSC Attendance Dashboard

This guide walks you through deploying the attendance dashboard to Render, making it accessible online.

## Why Deploy to Render?

- ✅ **Free tier available** - Perfect for small teams
- ✅ **Easy setup** - No server management required
- ✅ **Automatic updates** - Deploy from GitHub
- ✅ **HTTPS included** - Secure by default
- ✅ **Always online** - 24/7 availability

---

## Prerequisites

Before you begin, make sure you have:

- [ ] A GitHub account (free) - [Sign up here](https://github.com/join)
- [ ] A Render account (free) - [Sign up here](https://render.com)
- [ ] Git installed on your computer (for pushing to GitHub)
- [ ] This project folder with all files

---

## Step-by-Step Deployment

### Part 1: Push to GitHub

#### 1. Create a New Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top-right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name:** `dcsc-attendance-dashboard`
   - **Description:** "Soccer attendance tracking dashboard for coaches"
   - **Visibility:** Private (recommended) or Public
   - **DO NOT** initialize with README (we already have one)
5. Click "Create repository"

#### 2. Push Your Code to GitHub

Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
# Navigate to your project folder
cd "/Users/amin/Documents/My Coaching/DCSC/Attendance"

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit: DCSC Attendance Dashboard"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/dcsc-attendance-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

✅ Your code is now on GitHub!

---

### Part 2: Deploy to Render

#### 1. Create a Render Account

1. Go to [Render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with your GitHub account (recommended)
4. Authorize Render to access your GitHub repositories

#### 2. Create a New Web Service

1. From your Render dashboard, click "New +"
2. Select "Web Service"
3. Click "Connect" next to your `dcsc-attendance-dashboard` repository
   - If you don't see it, click "Configure account" to grant access
4. Fill in the service details:

   **Basic Settings:**
   - **Name:** `dcsc-attendance-dashboard`
   - **Region:** Choose the closest to you (e.g., Oregon for West Coast)
   - **Branch:** `main`
   - **Root Directory:** Leave blank
   - **Runtime:** `Python 3`

   **Build & Deploy:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`

   **Instance Type:**
   - Select **"Free"** (perfect for getting started)
   - Note: Free tier sleeps after 15 minutes of inactivity

5. Expand **"Advanced"** section

#### 3. Set Environment Variables

Click "Add Environment Variable" and add:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | `your-random-secret-key-here-make-it-long-and-complex` |
| `PYTHON_VERSION` | `3.11.0` |

**Important:** For `SECRET_KEY`, use a long random string. Example:
```
dcsc-2024-attendance-super-secret-key-change-this-12345
```

#### 4. Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for the first deployment
3. Watch the deployment logs - you'll see:
   ```
   ==> Building...
   ==> Installing dependencies...
   ==> Starting application...
   ==> Your service is live 🎉
   ```

✅ **Your app is now live!**

Your URL will be: `https://dcsc-attendance-dashboard.onrender.com`

---

## Post-Deployment Steps

### 1. Test Your App

1. Click the URL Render provides
2. You should see the upload screen
3. Upload your attendance CSV file
4. Verify all tabs work correctly
5. Test on mobile and desktop

### 2. Share with Your Team

Send this message to coaches and directors:

```
📊 DCSC Attendance Dashboard is Ready!

Access the dashboard here:
https://dcsc-attendance-dashboard.onrender.com

Quick Start:
1. Click the upload area
2. Select your attendance CSV file
3. Wait a few seconds
4. Explore the dashboard!

Need help? Check the Quick Start guide.
```

### 3. Set Up Custom Domain (Optional)

If you want a custom URL like `attendance.dcsoccer.org`:

1. In Render dashboard, go to your service
2. Click "Settings"
3. Scroll to "Custom Domains"
4. Follow Render's instructions to add your domain

### 4. Configure Automatic Deployments

Good news! It's already configured. Every time you push to GitHub:
- Render automatically rebuilds your app
- Updates go live in 5-10 minutes
- Zero downtime deployment

---

## Updating Your App

### Making Changes

1. **Edit files locally** on your computer
2. **Test locally** by running `./run.sh` (Mac) or `run.bat` (Windows)
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```
4. **Push to GitHub:**
   ```bash
   git push
   ```
5. **Watch Render** automatically deploy your changes

### Example Updates

**Change colors:**
- Edit `static/css/style.css`
- Modify the `:root` color variables
- Commit and push

**Add new metrics:**
- Edit `app.py` to add calculations
- Edit `static/js/app.js` to display them
- Commit and push

---

## Monitoring & Maintenance

### Check App Health

1. Go to your Render dashboard
2. Click your service name
3. View:
   - **Logs** - See what's happening
   - **Metrics** - CPU and memory usage
   - **Events** - Deployment history

### View Logs

```bash
# In Render dashboard
1. Click your service
2. Click "Logs" tab
3. View real-time logs
```

Logs show:
- File uploads
- Errors (if any)
- User activity

### Handle Errors

If users report issues:

1. **Check Render logs** for errors
2. **Verify environment variables** are set
3. **Test with a sample CSV** file
4. **Restart the service** if needed:
   - Go to service settings
   - Click "Manual Deploy" → "Clear build cache & deploy"

---

## Cost & Performance

### Free Tier

**Included:**
- 750 hours/month (enough for one always-on service)
- Automatic HTTPS
- Automatic deployments
- Unlimited traffic

**Limitations:**
- Service sleeps after 15 minutes of inactivity
- Wake-up time: ~30 seconds when accessed
- 512 MB RAM

**Is this enough?**
- ✅ Perfect for small teams (5-20 users)
- ✅ Fine for occasional use
- ⚠️ Consider paid tier if you need instant access 24/7

### Upgrading

If you need better performance:

1. Go to service settings
2. Under "Instance Type", select:
   - **Starter** ($7/month) - No sleep, 512 MB RAM
   - **Standard** ($25/month) - 2 GB RAM, better performance

---

## Security Best Practices

### Production Checklist

- [ ] Use a strong `SECRET_KEY` (not the example one!)
- [ ] Set repository to Private (if it contains sensitive data)
- [ ] Don't commit real CSV files with personal information
- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Consider adding user authentication for production use
- [ ] Regularly review Render logs for suspicious activity
- [ ] Set up data cleanup cron job for uploaded files

### Adding Password Protection

If you want to add a simple password to the entire app:

**Option 1: Use Render's built-in IP allowlist**
1. Go to service settings
2. Add IP allowlisting under "Network"

**Option 2: Add HTTP Basic Auth**
(Requires code changes - see README for details)

---

## Troubleshooting

### Build Fails

**Error:** "Could not install requirements"
- **Fix:** Check `requirements.txt` has correct package names
- Verify Python version is 3.8+

### App Won't Start

**Error:** "Failed to bind to port"
- **Fix:** Ensure `gunicorn app:app` is correct
- Verify `app.py` has no syntax errors

### 500 Internal Server Error

- **Check logs** in Render dashboard
- **Verify** environment variables are set
- **Test** with a valid CSV file
- **Restart** the service

### Slow Wake-Up Time (Free Tier)

This is normal! Free tier sleeps after 15 minutes.
- Users wait ~30 seconds on first access
- Subsequent loads are fast
- **Solution:** Upgrade to Starter plan ($7/mo) for always-on

### CSV Upload Fails

- **Verify** file is under 16MB
- **Check** file has all required columns
- **Test** with the sample CSV included in repo

---

## Support Resources

- 📚 [Render Documentation](https://render.com/docs)
- 💬 [Render Community Forum](https://community.render.com/)
- 🐛 [Report Issues](https://github.com/YOUR_USERNAME/dcsc-attendance-dashboard/issues)

---

## Deployment Checklist

Use this checklist for your deployment:

### Pre-Deployment
- [ ] All files are in the project folder
- [ ] `requirements.txt` exists
- [ ] `render.yaml` exists
- [ ] App runs locally without errors
- [ ] GitHub account created
- [ ] Render account created

### GitHub Setup
- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] Repository is accessible (public or private with Render access)

### Render Setup
- [ ] Web service created
- [ ] Connected to GitHub repository
- [ ] Build command set: `pip install -r requirements.txt`
- [ ] Start command set: `gunicorn app:app`
- [ ] Environment variables added (SECRET_KEY, PYTHON_VERSION)
- [ ] Instance type selected (Free for testing)

### Post-Deployment
- [ ] App successfully deployed
- [ ] URL is accessible
- [ ] Upload functionality tested
- [ ] All charts display correctly
- [ ] Tested on mobile device
- [ ] URL shared with team
- [ ] Quick start guide distributed

---

## Next Steps After Deployment

1. **Monitor usage** for the first week
2. **Collect feedback** from coaches
3. **Plan improvements** based on feedback
4. **Consider upgrades** if needed
5. **Schedule regular updates** (monthly recommended)

---

## Success! 🎉

Your DCSC Attendance Dashboard is now live and accessible to your entire coaching staff!

**Your Dashboard URL:** `https://dcsc-attendance-dashboard.onrender.com`

Share it with your team and start tracking attendance like a pro! ⚽

---

**Questions?** Refer to the main README.md or contact technical support.


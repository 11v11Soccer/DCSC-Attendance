# 🚀 Deploy to Render NOW - Quick Guide

**Estimated Time:** 10 minutes

Your code is ready! Follow these steps to deploy your DCSC Attendance Dashboard to Render.

---

## Step 1: Create Render Account (2 minutes)

1. **Go to:** https://render.com
2. **Click:** "Get Started for Free" or "Sign Up"
3. **Select:** "Sign up with GitHub" (easiest option)
4. **Authorize Render** when GitHub asks for permission
5. **Verify your email** (check inbox)

✅ **Done!** You now have a Render account.

---

## Step 2: Connect Your Repository (3 minutes)

1. **Log into Render Dashboard:** https://dashboard.render.com

2. **Click the "New +" button** (top-right corner)

3. **Select "Web Service"** from dropdown

4. **If you DON'T see your repository:**
   - Click "Configure account" link
   - Click your profile picture → "Account Settings"
   - Go to "GitHub" in the left sidebar
   - Click "Configure" or "Update access"
   - Select "Only select repositories"
   - Find `DCSC-Attendance` in the dropdown
   - Check the box
   - Click "Save"
   - Go back to Step 2.2

5. **When you SEE your repository:**
   - Find: `11v11Soccer/DCSC-Attendance`
   - Click the "Connect" button next to it

✅ **Done!** Repository connected.

---

## Step 3: Configure Your Service (5 minutes)

Render will show you a configuration form. Fill it out:

### Basic Settings

**Name:**
```
dcsc-attendance-dashboard
```

**Region:** 
```
Oregon (US West)    [Choose the one closest to you]
```

**Branch:**
```
main
```
(should be auto-filled)

**Runtime:**
```
Python 3
```

### Build & Start Commands

**Build Command:**
```
pip install -r requirements.txt
```
(should be auto-detected)

**Start Command:**
```
gunicorn app:app
```
(should be auto-detected)

### Instance Type

**Select: Free** ($0/month)
- 750 hours/month
- Sleeps after 15 min of inactivity
- Wakes up in ~30 seconds

You can upgrade later if needed!

### Environment Variables (IMPORTANT!)

**Click "Advanced"** to expand the section.

**Click "Add Environment Variable"** twice and add:

**Variable 1:**
- **Key:** `SECRET_KEY`
- **Value:** `dcsc-soccer-2025-super-secret-attendance-key-change-this-random-12345`
  (Make it long and random for security!)

**Variable 2:**
- **Key:** `PYTHON_VERSION`
- **Value:** `3.11.0`

### Auto-Deploy

**Keep this checked:**
```
☑️ Auto-Deploy: Yes
```
(This means Render will auto-update when you push to GitHub)

---

## Step 4: Deploy! (5-10 minutes)

1. **Click the big blue "Create Web Service" button** at the bottom

2. **Wait for deployment** (Render will show logs):
   - Cloning from GitHub... ✓
   - Installing dependencies... ✓ (takes 2-3 minutes)
   - Starting service... ✓
   - Your service is live! 🎉

3. **Look for:** `Your service is live at https://...`

---

## Step 5: Test Your Dashboard

1. **Copy your URL** from the top of the Render dashboard:
   ```
   https://dcsc-attendance-dashboard-xxxx.onrender.com
   ```

2. **Click the URL** (or paste in browser)

3. **Wait 10-30 seconds** for first load

4. **You should see:** Your beautiful upload screen! 🎉

5. **Test it:**
   - Upload your `sample_data.csv` or `attendance.csv`
   - Click "Upload & Analyze"
   - View your dashboard with all the charts!

---

## ✅ Success! Your Dashboard is Live!

**Your app is now:**
- ✅ Accessible from anywhere in the world
- ✅ Running 24/7 (on free tier, sleeps after 15 min)
- ✅ Secured with HTTPS automatically
- ✅ Auto-updates when you push to GitHub

---

## Share with Your Team

Send this message to your staff:

```
📊 DCSC Attendance Dashboard is now live!

Access it here:
https://dcsc-attendance-dashboard-xxxx.onrender.com

How to use:
1. Visit the URL above
2. Upload your attendance CSV file (drag & drop)
3. Explore the analytics dashboard!

Note: First visit may take 30 seconds to load (the free tier 
wakes up from sleep mode). After that, it's instant!

See QUICKSTART.md for more details.
```

---

## What's Next?

### Making Updates

When you want to change something:

```bash
# 1. Make your changes locally
# 2. Commit and push
git add .
git commit -m "Your change description"
git push

# 3. Render automatically deploys (5-10 minutes)
# 4. Your live app is updated!
```

No need to manually deploy again!

### Monitoring Your App

- **View Logs:** Render Dashboard → Your Service → "Logs" tab
- **Check Status:** Look for 🟢 "Live" indicator
- **View Deployments:** "Events" tab shows deployment history

### Upgrading (Optional)

If you need the app to never sleep:
1. Go to your service → "Settings"
2. Change "Instance Type" to "Starter" ($7/month)
3. Click "Save Changes"
4. App will always be instantly available!

---

## Troubleshooting

### Build Failed
**Solution:** Check that `requirements.txt` exists and has correct format.

### App Crashed
**Solution:** 
1. Check "Logs" tab in Render
2. Make sure `SECRET_KEY` is set in Environment Variables
3. Verify Python version is 3.11.0

### Can't See Repository
**Solution:** Go back to Step 2.4 and configure GitHub access.

### 404 Error
**Solution:** Wait 10 minutes, deployment might still be in progress.

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Your project docs:** See QUICKSTART.md and README.md

---

## Deployment Checklist

- [x] Code pushed to GitHub ✓
- [ ] Render account created
- [ ] Repository connected to Render
- [ ] Environment variables set
- [ ] Service created and deployed
- [ ] URL accessible and tested
- [ ] Team notified with URL

---

**🎉 You're all set! Go deploy your dashboard now!**

**Your GitHub Repository:** https://github.com/11v11Soccer/DCSC-Attendance

**Next Step:** Go to https://dashboard.render.com and follow Step 2!

---

*Good luck! Your dashboard will help coaches make data-driven decisions! ⚽*


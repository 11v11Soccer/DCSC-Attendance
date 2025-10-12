# 🚀 Deployment Cheat Sheet (Print Me!)

**One-page quick reference for deploying DCSC Attendance Dashboard**

---

## 📋 Prerequisites Checklist

□ GitHub account → https://github.com/join  
□ Render account → https://render.com (sign up with GitHub)  
□ Personal access token → Settings → Developer settings → Tokens  
□ Project files ready

---

## ⚡ Quick Deploy (Terminal Method)

```bash
# 1. Navigate to project
cd "/Users/amin/Documents/My Coaching/DCSC/Attendance"

# 2. Run GitHub setup script
./github-setup.sh

# 3. Follow prompts:
#    - Enter GitHub username
#    - Paste GitHub token (NOT password!)

# 4. Go to render.com and deploy (see Web UI steps below)
```

---

## 🌐 Web UI Deploy Steps

### GITHUB (5 minutes)

1. **Create repo:** github.com → New → `dcsc-attendance-dashboard`
2. **Privacy:** Private
3. **DON'T** add README/license/.gitignore

### RENDER (10 minutes)

1. **New + → Web Service**
2. **Connect:** dcsc-attendance-dashboard repo
3. **Configure:**
   - Name: `dcsc-attendance-dashboard`
   - Region: Oregon or Ohio
   - Branch: `main`
   - Runtime: `Python 3`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`
   - Plan: **Free**
4. **Advanced → Environment Variables:**
   - `SECRET_KEY` = `make-a-long-random-string-here`
   - `PYTHON_VERSION` = `3.11.0`
5. **Create Web Service** → Wait 5-10 min
6. **Test:** Upload sample_data.csv

---

## 🔑 GitHub Token (One-Time Setup)

GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic)

**Permissions needed:** Check `repo` (only)  
**Expiration:** 90 days or No expiration  
**Save token securely!** Looks like: `ghp_xxxxxxxxxxxx`

---

## 🎯 Quick Commands

```bash
# Push changes (after initial setup)
git add .
git commit -m "Description"
git push

# Run locally for testing
./run.sh                  # Mac
run.bat                   # Windows
```

---

## 🚨 Common Issues

| Error | Solution |
|-------|----------|
| Authentication failed | Use token, not password |
| Repo not found | Check spelling, make sure repo exists |
| Build failed | Verify requirements.txt exists |
| App won't start | Check SECRET_KEY is set in Render |

---

## 📞 Help Resources

| Need | File |
|------|------|
| Token help | GITHUB_TOKEN_SETUP.md |
| Detailed Render | RENDER_DETAILED_SETUP.md |
| Visual guide | DEPLOYMENT_VISUAL_GUIDE.md |
| Use the app | QUICKSTART.md |

---

## ✅ Success Indicators

**GitHub:** Can view repo at github.com/YOUR_USERNAME/dcsc-attendance-dashboard  
**Render:** Logs say "Your service is live"  
**App:** URL loads → Upload works → Charts display  

---

## 📱 Your Deployment Info

**GitHub Username:** _______________________

**Token (keep secret!):** ghp_____________________

**GitHub Repo:** https://github.com/_______/dcsc-attendance-dashboard

**Render URL:** https://dcsc-attendance-dashboard-_______.onrender.com

**Deployed:** ___/___/2024

---

## 🔄 Update Workflow

```
Edit code → Commit → Push → Render auto-deploys (5 min)
```

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| GitHub setup | 10 min |
| Render setup | 10 min |
| First deploy | 10 min |
| Testing | 5 min |
| **TOTAL** | **~35 min** |

---

## 🎉 Post-Deployment

□ Test upload with sample_data.csv  
□ Verify all 4 tabs work  
□ Test on mobile  
□ Share URL with team  
□ Send QUICKSTART.md to coaches  
□ Celebrate! 🎊  

---

**Print this page and check off steps as you go!** ✅


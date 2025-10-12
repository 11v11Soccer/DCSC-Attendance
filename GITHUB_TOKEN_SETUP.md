# 🔑 GitHub Personal Access Token Setup

## Why Do I Need This?

GitHub no longer accepts your regular password when pushing code from the command line. Instead, you need a special "token" (like a temporary password) that's more secure.

**Don't worry!** This is a one-time setup and only takes 2-3 minutes.

---

## Step-by-Step Token Creation

### Step 1: Log in to GitHub

Go to **https://github.com** and log in with your username and password.

---

### Step 2: Access Settings

1. **Click your profile picture** in the top-right corner
2. **Click "Settings"** from the dropdown menu

---

### Step 3: Navigate to Developer Settings

1. Scroll down the left sidebar
2. Click **"Developer settings"** (near the bottom)

---

### Step 4: Create Personal Access Token

1. In the left sidebar, click **"Personal access tokens"**
2. Click **"Tokens (classic)"**
3. Click the green **"Generate new token"** button
4. Select **"Generate new token (classic)"**

---

### Step 5: Configure Your Token

You'll see a form. Fill it out like this:

**Note:** (A name for your token)
```
DCSC Attendance Dashboard - Mac
```

**Expiration:** 
- Select **"90 days"** (recommended)
- Or **"No expiration"** (if you won't remember to renew)

**Select scopes:** (These are permissions)

✅ Check **"repo"** (this automatically checks all sub-options)
   - This gives full control of private repositories
   - It's the only permission you need!

**Leave everything else unchecked.**

---

### Step 6: Generate Token

1. Scroll to the bottom
2. Click the green **"Generate token"** button
3. **IMPORTANT:** GitHub will now show you the token **ONLY ONCE**

You'll see something like:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 7: Copy and Save Your Token

**🚨 CRITICAL: This is shown only once! Copy it now!**

1. **Click the copy icon** next to the token (or select and copy manually)
2. **Save it somewhere safe** - options:
   - Paste into a secure note on your phone
   - Save in Apple Notes (lock the note)
   - Use a password manager (1Password, LastPass, etc.)
   - Write it down and keep in a secure place

---

### Step 8: Use Your Token

When you run the `github-setup.sh` script and it asks for credentials:

**Username:** Your GitHub username (e.g., `dcsc-coach-amin`)

**Password:** **PASTE YOUR TOKEN HERE** (not your GitHub password!)

---

## Alternative: Use SSH Keys (Advanced)

If you're comfortable with more technical setup, you can use SSH keys instead of tokens:

1. Follow GitHub's SSH guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. This is more secure and you won't need to enter credentials

---

## What If I Lost My Token?

No problem! Just create a new one:

1. Go back to GitHub → Settings → Developer settings → Personal access tokens
2. Delete the old token
3. Create a new one following the steps above

---

## Troubleshooting

### "Authentication failed" error

**Cause:** Wrong username or token

**Solution:** 
- Double-check your GitHub username
- Make sure you're pasting the token (not your password)
- Token should start with `ghp_`
- Make sure there are no extra spaces when pasting

### "Repository not found" error

**Cause:** Repository doesn't exist or wrong name

**Solution:**
- Verify the repository exists at https://github.com/YOUR_USERNAME/dcsc-attendance-dashboard
- Check the spelling of your username
- Make sure the repository is named exactly: `dcsc-attendance-dashboard`

### "Permission denied" error

**Cause:** Token doesn't have correct permissions

**Solution:**
- Create a new token
- Make sure you checked the "repo" scope
- Delete old token and try again

---

## Security Tips

✅ **DO:**
- Keep your token secret (like a password)
- Set an expiration date (renew periodically)
- Delete tokens you no longer use
- Use different tokens for different computers

❌ **DON'T:**
- Share your token with others
- Post it in chat/email
- Commit it to code
- Use the same token for everything

---

## Quick Reference Card

Save this information securely:

```
GitHub Username: _________________________

Personal Access Token: ghp_____________________

Token Name: DCSC Attendance Dashboard - Mac

Created Date: _______________

Expires: _______________

Used For: Pushing code to dcsc-attendance-dashboard repo
```

---

## Video Tutorial (Optional)

If you prefer watching a video, search YouTube for:
```
"GitHub personal access token 2024"
```

Many excellent tutorials are available (2-3 minutes each).

---

## Need Help?

If you get stuck:
1. Try creating a new token (you can have multiple)
2. Search GitHub's documentation: https://docs.github.com
3. Ask a tech-savvy colleague to help with the token creation

---

**Once you have your token, you're ready to run `./github-setup.sh`!** 🚀


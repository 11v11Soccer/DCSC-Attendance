# 🚀 Quick Start Guide for DCSC Attendance Dashboard

This guide is designed for **non-technical users** (coaches and directors) to get started quickly.

## What You'll Need

- A computer (Mac or Windows)
- Your attendance CSV file
- Internet connection (for deployment)
- **Ollama** (optional, for AI-powered summaries - see below)

---

## Option 1: Use the Deployed Version (Easiest) ⭐

If someone has already deployed the app for your team:

1. **Get the URL** from your technical administrator
   - Example: `https://dcsc-attendance-dashboard.onrender.com`

2. **Open the URL** in your web browser (Chrome, Safari, Firefox, Edge)

3. **Upload your CSV file**
   - Click the upload area or drag and drop your file
   - Wait 5-10 seconds for analysis

4. **Explore your data!**
   - Use the tabs to view different reports
   - Search for specific players
   - Filter by teams

That's it! You're done! 🎉

---

## Option 2: Run Locally on Your Computer

If you want to run the app on your own computer:

### For Mac Users 🍎

1. **Download the project folder**
   - You should have all the files in a folder called "Attendance"

2. **Open Terminal**
   - Press `Command + Space`
   - Type "Terminal" and press Enter

3. **Navigate to the project folder**
   ```bash
   cd "Documents/My Coaching/DCSC/Attendance"
   ```
   (Adjust the path if your folder is in a different location)

4. **Run the startup script**
   ```bash
   ./run.sh
   ```

5. **Open your browser**
   - Go to: `http://localhost:5000`

### For Windows Users 🪟

1. **Download the project folder**
   - You should have all the files in a folder called "Attendance"

2. **Open the folder**
   - Navigate to where you saved the "Attendance" folder

3. **Double-click `run.bat`**
   - This will open a black window (Command Prompt)
   - Wait for the message "Running on http://127.0.0.1:5000"

4. **Open your browser**
   - Go to: `http://localhost:5000`

---

## How to Use the Dashboard

### 1. Upload Your Attendance File

Your CSV file should have these columns (in this exact order):
- `team_id`
- `team_name`
- `event_name`
- `date`
- `time`
- `location`
- `player_id`
- `player_first_name`
- `player_last_name`
- `attendance`

**Steps:**
1. Click the upload area (or drag and drop your CSV file)
2. Click "Upload & Analyze"
3. Wait a few seconds
4. The dashboard will appear automatically

### 2. Navigate the Dashboard

**🤖 NEW: AI-Powered Insights!**
- Each tab now has an "AI Insights" box at the top
- Click "Generate Summary" to get AI-generated narrative insights
- See patterns, top performers, and recommendations automatically
- Requires Ollama to be installed (optional feature)

The dashboard has 4 main sections (tabs):

#### 📊 Overview Tab
- **What you'll see:**
  - Overall attendance breakdown (Present, Absent, Late, Injured)
  - Games vs Practice comparison
  - Seasonal patterns (Fall, Spring, Summer)
  - Monthly trends over time

- **What to look for:**
  - Is attendance better for games or practice?
  - Which season has the best attendance?
  - Is attendance improving or declining over time?

#### 👥 Teams Tab
- **What you'll see:**
  - Comparison of all teams
  - Each team's attendance rate
  - Game vs Practice breakdown by team
  - Detailed team statistics table

- **What to look for:**
  - Which teams have the best attendance?
  - Which teams need improvement?
  - Do certain teams attend games better than practice?

#### 👤 Players Tab
- **What you'll see:**
  - Complete list of all players
  - Individual attendance rates
  - Search and filter options
  - Top performers and players needing attention

- **How to use it:**
  1. **Search:** Type a player's name in the search box
  2. **Filter:** Select a specific team from the dropdown
  3. **Review:** Check attendance rates, absences, lates, and injuries

- **What to look for:**
  - Who are your most reliable players?
  - Who might need a check-in call?
  - Are absences due to injuries?

#### 📈 Trends Tab
- **What you'll see:**
  - Average number of players per event by team and season
  - Key insights (best season, best event type, top team)
  - Overall trend indicator (improving, declining, stable)

- **What to look for:**
  - Long-term patterns
  - Success stories to celebrate
  - Areas needing attention

### 3. Understanding the Colors and Badges

**Status Badges:**
- 🟢 **Excellent** (90-100%): Outstanding! Keep it up!
- 🔵 **Good** (75-89%): Strong attendance
- 🟠 **Fair** (60-74%): Room for improvement
- 🔴 **Needs Attention** (<60%): May need follow-up

**Attendance Types:**
- **Present**: Player was there on time ✅
- **Late**: Player arrived late but participated ⏰
- **Absent**: Player didn't attend ❌
- **Injured**: Player couldn't attend due to injury 🤕
- **Not Reported**: Status wasn't recorded yet ❓

---

## Tips for Coaches

1. **Regular Check-ins**
   - Upload new data weekly to track trends
   - Use the player search to quickly find specific athletes

2. **Parent Communication**
   - Reference attendance rates in parent meetings
   - Use the print function (Ctrl+P / Cmd+P) to create reports

3. **Team Motivation**
   - Share team attendance rankings to encourage improvement
   - Celebrate teams with "Excellent" status

4. **Early Intervention**
   - Check the "Players Needing Attention" chart weekly
   - Reach out to players with declining attendance

5. **Seasonal Planning**
   - Use seasonal trends to plan better engagement strategies
   - Compare Fall vs Spring to understand patterns

---

## Troubleshooting

### Problem: "No file selected" error
**Solution:** Make sure you clicked "Choose File" or dragged a file before clicking "Upload & Analyze"

### Problem: "Missing required columns" error
**Solution:** Your CSV file doesn't have all the required columns. Check that it matches the format in the example above.

### Problem: Charts aren't showing
**Solution:** Try refreshing your browser page (Press F5 or Ctrl+R / Cmd+R)

### Problem: File too large error
**Solution:** The file must be under 16MB. If yours is larger, try splitting it into smaller time periods.

### Problem: Can't access localhost:5000
**Solution:** Make sure the application is still running. Look for the black window (Command Prompt/Terminal) - it should still be open.

---

## Getting Help

If you encounter any issues:

1. **Check the README.md** - More detailed technical information
2. **Contact your technical administrator**
3. **Check that Python is installed** (for local use)
4. **Try restarting the application**

---

## Frequently Asked Questions

**Q: Is my data secure?**
A: When running locally, data stays on your computer. When using the deployed version, files are temporarily stored and should be deleted regularly by your admin.

**Q: Can multiple people use it at once?**
A: Yes! If deployed online, multiple coaches can access it simultaneously. Each person uploads their own file.

**Q: Do I need to be online?**
A: For the deployed version, yes. For local use, you only need internet for the initial setup (installing dependencies).

**Q: Can I export the reports?**
A: Yes! Use your browser's print function (Ctrl+P / Cmd+P) and save as PDF.

**Q: How often should I upload new data?**
A: We recommend weekly updates to track trends and catch attendance issues early.

**Q: What if I upload the wrong file?**
A: No problem! Just click "Upload New File" and upload the correct one.

---

## Next Steps

✅ Upload your first CSV file
✅ Explore all four tabs
✅ Find a player you know and check their stats
✅ Identify your top-performing team
✅ Generate your first report

---

**Need more help?** Refer to the full README.md or contact your technical support team.

**Happy coaching!** ⚽🎉


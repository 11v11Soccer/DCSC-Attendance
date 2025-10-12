# DCSC Soccer Attendance Dashboard

A comprehensive, user-friendly web application for analyzing soccer team attendance data. Built for coaches and directors to gain insights into player attendance patterns, team performance, and seasonal trends.

## Features

### 📊 Comprehensive Analytics
- **Overall Statistics**: View total players, teams, events, and overall attendance rates
- **Team Analysis**: Compare attendance rates across different teams
- **Player Tracking**: Monitor individual player attendance with detailed breakdowns
- **Event Comparison**: Analyze attendance differences between games and practices
- **Seasonal Trends**: Track attendance patterns across Fall, Spring, and Summer seasons
- **Monthly Trends**: Visualize attendance changes over time

### 📈 Interactive Visualizations
- Doughnut charts for attendance distribution
- Bar charts for team and player comparisons
- Line charts for temporal trends
- Side-by-side comparisons of games vs practice attendance

### 🎨 User-Friendly Interface
- Modern, responsive design that works on desktop and mobile
- Intuitive drag-and-drop CSV upload
- Easy-to-navigate tabbed interface
- Color-coded status indicators
- Searchable and filterable data tables

## Technology Stack

- **Backend**: Flask (Python)
- **Data Processing**: Pandas
- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Chart.js
- **Deployment**: Render (Platform as a Service)

## Quick Start

### Local Development

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

5. **Upload your CSV file**
   - Click the upload area or drag and drop your attendance CSV file
   - The file should have these columns:
     - `team_id`
     - `team_name`
     - `event_name`
     - `date`
     - `time`
     - `location`
     - `player_id`
     - `player_first_name`
     - `player_last_name`
     - `attendance` (values: Present, Absent, Late, Injured, None)

## Deployment on Render

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Create a Render account**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

3. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the settings from `render.yaml`

4. **Configure (if needed)**
   - Name: `dcsc-attendance-dashboard`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Instance Type: Free (or your preferred tier)

5. **Add Environment Variable**
   - Go to "Environment" tab
   - Add `SECRET_KEY` with a random secure string
   - Example: `your-super-secret-key-change-this-in-production`

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Your app will be available at `https://dcsc-attendance-dashboard.onrender.com`

### Option 2: Deploy without GitHub

1. **Install Render CLI** (optional)
   ```bash
   npm install -g @render-com/cli
   ```

2. **Deploy manually**
   - Zip your project folder
   - Upload to Render dashboard
   - Follow steps 3-6 from Option 1

## Usage Guide

### For Coaches and Directors

1. **Access the Dashboard**
   - Navigate to your deployed URL or `localhost:5000`

2. **Upload Attendance Data**
   - Prepare your CSV file with attendance records
   - Drag and drop or click to upload
   - Wait for analysis (usually 5-10 seconds)

3. **Explore the Dashboard**

   **Overview Tab**
   - See overall attendance distribution
   - Compare games vs practice attendance
   - View seasonal patterns
   - Track monthly trends

   **Teams Tab**
   - Compare attendance rates across teams
   - Identify top-performing teams
   - View detailed team statistics
   - Analyze game vs practice attendance by team

   **Players Tab**
   - Search for specific players
   - Filter by team
   - View detailed attendance records
   - Identify top performers and players needing attention
   - See absent, late, and injured counts

   **Trends Tab**
   - View average players per event by team and season
   - Get insights on best season, best event type, and top team
   - See overall attendance trend (improving/declining/stable)

4. **Generate Reports**
   - Use browser print function (Ctrl+P / Cmd+P)
   - All charts and tables are print-friendly

### Understanding Metrics

- **Attendance Rate**: Percentage of times a player/team attended (Present + Late) out of total events
- **Present**: Player attended on time
- **Late**: Player arrived late but participated
- **Absent**: Player did not attend
- **Injured**: Player was unable to attend due to injury
- **None/Not Reported**: Attendance status was not recorded

### Status Indicators

- 🟢 **Excellent** (90-100%): Outstanding attendance
- 🔵 **Good** (75-89%): Strong attendance
- 🟠 **Fair** (60-74%): Acceptable but could improve
- 🔴 **Needs Attention** (<60%): Requires follow-up

## CSV File Format

Your CSV file should look like this:

```csv
team_id,team_name,event_name,date,time,location,player_id,player_first_name,player_last_name,attendance
351791,DCSC Select U15,Practice,2025-09-02,6:00pm,Hardy Field,1460723,John,Doe,Present
351791,DCSC Select U15,Practice,2025-09-02,6:00pm,Hardy Field,1460724,Jane,Smith,Absent
351791,DCSC Select U15,Game vs. Tigers,2025-09-09,10:00am,Main Stadium,1460723,John,Doe,Present
```

## Troubleshooting

### Upload Issues
- **"Missing required columns"**: Ensure your CSV has all required columns
- **File too large**: Maximum file size is 16MB
- **Wrong format**: Only CSV files are accepted

### Display Issues
- **Charts not showing**: Refresh the page
- **Data not updating**: Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)

### Deployment Issues
- **Build failed**: Check that `requirements.txt` is present
- **App crashes**: Verify environment variables are set
- **Slow performance**: Consider upgrading Render instance

## Security Notes

⚠️ **Important for Production Use**

1. **Change the SECRET_KEY**: Use a strong, random secret key in production
2. **Data Privacy**: Uploaded CSV files are stored temporarily. Consider implementing:
   - Database storage for persistent data
   - User authentication
   - Data encryption
   - Regular data cleanup
3. **Access Control**: Currently, anyone with the URL can access the app. Consider adding:
   - Password protection
   - User login system
   - Team-based permissions

## Customization

### Changing Colors
Edit `static/css/style.css` and modify the `:root` variables:
```css
:root {
    --primary-color: #2563eb;  /* Main brand color */
    --secondary-color: #10b981; /* Accent color */
    /* ... other colors */
}
```

### Adding New Metrics
1. Add calculation logic in `app.py` in the `analyze_attendance_data()` function
2. Update frontend in `static/js/app.js` to display the new metric
3. Add visualizations as needed

## Support

For questions or issues:
1. Check this README first
2. Review the troubleshooting section
3. Contact your technical administrator

## License

This project is created for DCSC (DC Soccer Club) internal use.

## Version

**v1.0.0** - Initial Release (October 2025)

---

Made with ⚽ for DCSC Coaches and Directors


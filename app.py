"""
DCSC Soccer Attendance Dashboard
A Flask application for analyzing soccer team attendance data
"""

from flask import Flask, render_template, request, jsonify, session
import pandas as pd
import os
from datetime import datetime
import json
from werkzeug.utils import secure_filename
import uuid
from ai_service import get_ai_service
from ai_service import get_ai_service

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def parse_date(date_str):
    """Parse date string to datetime object"""
    try:
        return pd.to_datetime(date_str)
    except:
        return None

def get_season(date):
    """Determine season from date (Fall: Aug-Dec, Spring: Jan-May, Summer: Jun-Jul)"""
    if pd.isna(date):
        return 'Unknown'
    month = date.month
    if month in [8, 9, 10, 11, 12]:
        return 'Fall'
    elif month in [1, 2, 3, 4, 5]:
        return 'Spring'
    else:
        return 'Summer'

def analyze_attendance_data(df):
    """Comprehensive analysis of attendance data"""
    
    # Clean and prepare data
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['season'] = df['date'].apply(get_season)
    df['month'] = df['date'].dt.month_name()
    df['year'] = df['date'].dt.year
    
    # Determine event type
    df['event_type'] = df['event_name'].apply(
        lambda x: 'Game' if 'Game' in str(x) else ('Practice' if 'Practice' in str(x) else 'Other')
    )
    
    # Map attendance to categories
    attendance_map = {
        'Present': 'present',
        'Absent': 'absent',
        'Late': 'late',
        'Injured': 'injured',
        'None': 'not_reported'
    }
    df['attendance_status'] = df['attendance'].map(attendance_map).fillna('not_reported')
    
    # Overall statistics
    total_records = len(df)
    total_players = df['player_id'].nunique()
    total_teams = df['team_id'].nunique()
    total_events = df.groupby(['team_id', 'event_name', 'date']).ngroups
    
    # Attendance distribution
    attendance_dist = df['attendance_status'].value_counts().to_dict()
    
    # Calculate attendance rate (Present + Late as "attended")
    attended = len(df[df['attendance_status'].isin(['present', 'late'])])
    attendance_rate = (attended / total_records * 100) if total_records > 0 else 0
    
    # Team statistics
    team_stats = []
    for team_id, team_group in df.groupby('team_id'):
        team_name = team_group['team_name'].iloc[0]
        team_records = len(team_group)
        team_attended = len(team_group[team_group['attendance_status'].isin(['present', 'late'])])
        team_rate = (team_attended / team_records * 100) if team_records > 0 else 0
        team_events = team_group.groupby(['event_name', 'date']).ngroups
        team_players = team_group['player_id'].nunique()
        
        team_stats.append({
            'team_id': int(team_id),
            'team_name': team_name,
            'total_players': int(team_players),
            'total_events': int(team_events),
            'attendance_rate': round(team_rate, 2),
            'total_records': int(team_records)
        })
    
    team_stats = sorted(team_stats, key=lambda x: x['attendance_rate'], reverse=True)
    
    # Event type comparison
    event_type_stats = []
    for event_type, event_group in df.groupby('event_type'):
        event_records = len(event_group)
        event_attended = len(event_group[event_group['attendance_status'].isin(['present', 'late'])])
        event_rate = (event_attended / event_records * 100) if event_records > 0 else 0
        
        event_type_stats.append({
            'event_type': event_type,
            'attendance_rate': round(event_rate, 2),
            'total_records': int(event_records)
        })
    
    # Seasonal trends
    season_stats = []
    for season, season_group in df.groupby('season'):
        season_records = len(season_group)
        season_attended = len(season_group[season_group['attendance_status'].isin(['present', 'late'])])
        season_rate = (season_attended / season_records * 100) if season_records > 0 else 0
        
        season_stats.append({
            'season': season,
            'attendance_rate': round(season_rate, 2),
            'total_records': int(season_records)
        })
    
    # Average players per event by team and season
    team_season_avg = []
    for (team_id, season), group in df.groupby(['team_id', 'season']):
        team_name = group['team_name'].iloc[0]
        
        # Calculate average players present per event
        event_attendance = group[group['attendance_status'].isin(['present', 'late'])].groupby(['event_name', 'date']).size()
        avg_attendance = event_attendance.mean() if len(event_attendance) > 0 else 0
        
        team_season_avg.append({
            'team_name': team_name,
            'season': season,
            'avg_players_per_event': round(avg_attendance, 2)
        })
    
    # Top and bottom performers (players)
    player_stats = []
    for player_id, player_group in df.groupby('player_id'):
        player_name = f"{player_group['player_first_name'].iloc[0]} {player_group['player_last_name'].iloc[0]}"
        team_name = player_group['team_name'].iloc[0]
        player_records = len(player_group)
        player_attended = len(player_group[player_group['attendance_status'].isin(['present', 'late'])])
        player_rate = (player_attended / player_records * 100) if player_records > 0 else 0
        
        player_stats.append({
            'player_id': int(player_id),
            'player_name': player_name,
            'team_name': team_name,
            'attendance_rate': round(player_rate, 2),
            'events_attended': int(player_attended),
            'total_events': int(player_records),
            'absent_count': int(len(player_group[player_group['attendance_status'] == 'absent'])),
            'late_count': int(len(player_group[player_group['attendance_status'] == 'late'])),
            'injured_count': int(len(player_group[player_group['attendance_status'] == 'injured']))
        })
    
    player_stats = sorted(player_stats, key=lambda x: x['attendance_rate'], reverse=True)
    
    # Monthly trend
    monthly_trend = []
    df_with_date = df[df['date'].notna()].copy()
    if len(df_with_date) > 0:
        df_with_date['year_month'] = df_with_date['date'].dt.to_period('M')
        for period, period_group in df_with_date.groupby('year_month'):
            period_records = len(period_group)
            period_attended = len(period_group[period_group['attendance_status'].isin(['present', 'late'])])
            period_rate = (period_attended / period_records * 100) if period_records > 0 else 0
            
            monthly_trend.append({
                'month': str(period),
                'attendance_rate': round(period_rate, 2),
                'total_records': int(period_records)
            })
    
    monthly_trend = sorted(monthly_trend, key=lambda x: x['month'])
    
    # Game vs Practice attendance by team
    team_event_comparison = []
    for team_id, team_group in df.groupby('team_id'):
        team_name = team_group['team_name'].iloc[0]
        
        game_data = team_group[team_group['event_type'] == 'Game']
        practice_data = team_group[team_group['event_type'] == 'Practice']
        
        game_records = len(game_data)
        game_attended = len(game_data[game_data['attendance_status'].isin(['present', 'late'])])
        game_rate = (game_attended / game_records * 100) if game_records > 0 else 0
        
        practice_records = len(practice_data)
        practice_attended = len(practice_data[practice_data['attendance_status'].isin(['present', 'late'])])
        practice_rate = (practice_attended / practice_records * 100) if practice_records > 0 else 0
        
        team_event_comparison.append({
            'team_name': team_name,
            'game_attendance_rate': round(game_rate, 2),
            'practice_attendance_rate': round(practice_rate, 2),
            'game_count': int(game_records),
            'practice_count': int(practice_records)
        })
    
    return {
        'summary': {
            'total_records': int(total_records),
            'total_players': int(total_players),
            'total_teams': int(total_teams),
            'total_events': int(total_events),
            'overall_attendance_rate': round(attendance_rate, 2),
            'attendance_distribution': attendance_dist
        },
        'team_stats': team_stats,
        'event_type_stats': event_type_stats,
        'season_stats': season_stats,
        'team_season_avg': team_season_avg,
        'player_stats': player_stats,
        'monthly_trend': monthly_trend,
        'team_event_comparison': team_event_comparison
    }

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle CSV file upload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Please upload a CSV file'}), 400
    
    try:
        # Read CSV file
        df = pd.read_csv(file)
        
        # Validate required columns
        required_columns = ['team_id', 'team_name', 'event_name', 'date', 'player_id', 
                          'player_first_name', 'player_last_name', 'attendance']
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({'error': f'Missing required columns: {", ".join(missing_columns)}'}), 400
        
        # Store dataframe in session (for demo purposes - in production use database)
        session_id = str(uuid.uuid4())
        filename = secure_filename(f"{session_id}.csv")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        df.to_csv(filepath, index=False)
        
        session['data_file'] = filename
        
        # Analyze data
        analysis = analyze_attendance_data(df)
        
        return jsonify({
            'success': True,
            'message': 'File uploaded and analyzed successfully',
            'analysis': analysis
        })
    
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/analyze', methods=['GET'])
def analyze():
    """Re-analyze stored data"""
    if 'data_file' not in session:
        return jsonify({'error': 'No data uploaded. Please upload a CSV file first.'}), 400
    
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], session['data_file'])
        df = pd.read_csv(filepath)
        analysis = analyze_attendance_data(df)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': f'Error analyzing data: {str(e)}'}), 500

@app.route('/ai/check', methods=['GET'])
def check_ai():
    """Check if Ollama AI service is available"""
    ai_service = get_ai_service()
    if ai_service and ai_service.check_connection():
        available_models = ai_service.list_available_models()
        return jsonify({
            'available': True,
            'model': ai_service.model,
            'available_models': available_models
        })
    else:
        return jsonify({
            'available': False,
            'message': 'Ollama is not running. Please start Ollama to enable AI summaries.'
        })

@app.route('/ai/summary/<section>', methods=['GET'])
def get_ai_summary(section):
    """Get AI-generated summary for a specific section"""
    if 'data_file' not in session:
        return jsonify({'error': 'No data uploaded. Please upload a CSV file first.'}), 400
    
    ai_service = get_ai_service()
    if not ai_service or not ai_service.check_connection():
        return jsonify({
            'error': 'AI service not available. Please ensure Ollama is running.',
            'available': False
        }), 503
    
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], session['data_file'])
        df = pd.read_csv(filepath)
        analysis = analyze_attendance_data(df)
        
        summary = None
        
        if section == 'overview':
            summary = ai_service.generate_overview_summary(
                analysis['summary'],
                analysis['event_type_stats'],
                analysis['season_stats'],
                analysis['monthly_trend']
            )
        elif section == 'teams':
            summary = ai_service.generate_teams_summary(
                analysis['team_stats'],
                analysis['team_event_comparison']
            )
        elif section == 'players':
            summary = ai_service.generate_players_summary(
                analysis['player_stats']
            )
        elif section == 'trends':
            summary = ai_service.generate_trends_summary(
                analysis['team_season_avg'],
                analysis['season_stats'],
                analysis['team_stats'],
                analysis['monthly_trend']
            )
        else:
            return jsonify({'error': f'Unknown section: {section}'}), 400
        
        if summary:
            return jsonify({
                'success': True,
                'summary': summary,
                'section': section
            })
        else:
            return jsonify({
                'error': 'Failed to generate summary. Check Ollama connection and model availability.',
                'available': False
            }), 500
            
    except Exception as e:
        return jsonify({'error': f'Error generating summary: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)


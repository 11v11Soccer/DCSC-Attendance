"""
AI Service for DCSC Attendance Dashboard
Uses Ollama for local LLM-powered narrative summaries
"""

import requests
import json
import re
from typing import Dict, List, Optional

class OllamaAIService:
    """Service for generating AI summaries using Ollama"""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2"):
        """
        Initialize Ollama AI Service
        
        Args:
            base_url: Ollama API base URL (default: localhost)
            model: Model name to use (default: llama3.2, alternatives: mistral, qwen2.5)
        """
        self.base_url = base_url
        self.model = model
        self.api_url = f"{base_url}/api/generate"
        
    def check_connection(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def list_available_models(self) -> List[str]:
        """List available models in Ollama"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model['name'] for model in data.get('models', [])]
            return []
        except:
            return []
    
    def generate_summary(self, prompt: str, max_tokens: int = 500) -> Optional[str]:
        """
        Generate AI summary using Ollama
        
        Args:
            prompt: The prompt to send to the model
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated summary text or None if error
        """
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": max_tokens,
                    "top_p": 0.9
                }
            }
            
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                print(f"Ollama API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.ConnectionError:
            return None
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return None
    
    def generate_teams_summary(self, team_stats: List[Dict], team_event_comparison: List[Dict]) -> Optional[str]:
        """Generate narrative summary for Teams tab"""
        
        # Extract top and bottom teams
        sorted_teams = sorted(team_stats, key=lambda x: x['attendance_rate'], reverse=True)
        top_5 = sorted_teams[:5]
        bottom_5 = sorted_teams[-5:] if len(sorted_teams) >= 5 else sorted_teams
        
        # Extract age/gender patterns
        age_gender_analysis = self._analyze_team_demographics(team_stats)
        
        prompt = f"""You are a helpful soccer coach's assistant analyzing attendance data. Write a clear, professional narrative summary (2-3 short paragraphs) about team attendance performance.

TEAM DATA:
Top 5 Teams by Attendance:
{self._format_teams_for_prompt(top_5)}

Bottom 5 Teams by Attendance:
{self._format_teams_for_prompt(bottom_5)}

Age/Gender Analysis:
{age_gender_analysis}

Game vs Practice Comparison (first 5 teams):
{self._format_game_practice_comparison(team_event_comparison[:5])}

Write a narrative that:
1. Highlights the top 5 teams and their strengths
2. Mentions the bottom 5 teams and potential areas for improvement
3. Discusses any patterns you notice regarding age groups or gender (boys vs girls teams)
4. Notes any interesting differences between game and practice attendance
5. Keep it conversational, professional, and actionable

Write in second person ("The DCSC Select G16 team shows...") and keep it concise but informative."""
        
        return self.generate_summary(prompt, max_tokens=600)
    
    def generate_overview_summary(self, summary: Dict, event_type_stats: List[Dict], 
                                   season_stats: List[Dict], monthly_trend: List[Dict]) -> Optional[str]:
        """Generate narrative summary for Overview tab"""
        
        prompt = f"""You are a helpful soccer coach's assistant analyzing attendance data. Write a clear, professional narrative summary (2-3 short paragraphs) about overall attendance patterns.

OVERALL STATISTICS:
- Total Players: {summary.get('total_players', 0)}
- Total Teams: {summary.get('total_teams', 0)}
- Total Events: {summary.get('total_events', 0)}
- Overall Attendance Rate: {summary.get('overall_attendance_rate', 0)}%

Attendance Distribution:
{json.dumps(summary.get('attendance_distribution', {}), indent=2)}

Event Type Performance:
{self._format_list_for_prompt(event_type_stats, 'event_type', 'attendance_rate')}

Seasonal Performance:
{self._format_list_for_prompt(season_stats, 'season', 'attendance_rate')}

Monthly Trend (recent 3 months):
{self._format_list_for_prompt(monthly_trend[-3:], 'month', 'attendance_rate')}

Write a narrative that:
1. Summarizes the overall attendance rate and what it means
2. Highlights the attendance distribution (present, absent, late, injured)
3. Compares games vs practice attendance
4. Discusses seasonal patterns (which season has best attendance?)
5. Notes any trends over time (improving, declining, stable)
6. Keep it conversational, professional, and insightful

Write in second person and keep it concise."""
        
        return self.generate_summary(prompt, max_tokens=600)
    
    def generate_players_summary(self, player_stats: List[Dict]) -> Optional[str]:
        """Generate narrative summary for Players tab"""
        
        sorted_players = sorted(player_stats, key=lambda x: x['attendance_rate'], reverse=True)
        top_10 = sorted_players[:10]
        bottom_10 = sorted_players[-10:] if len(sorted_players) >= 10 else sorted_players
        
        # Filter players with at least 3 events for bottom performers
        bottom_10_with_enough_data = [p for p in bottom_10 if p['total_events'] >= 3][:10]
        
        prompt = f"""You are a helpful soccer coach's assistant analyzing attendance data. Write a clear, professional narrative summary (2-3 short paragraphs) about player attendance performance.

TOP 10 PLAYERS:
{self._format_players_for_prompt(top_10)}

PLAYERS NEEDING ATTENTION (lowest attendance, at least 3 events):
{self._format_players_for_prompt(bottom_10_with_enough_data)}

Overall Statistics:
- Total Players: {len(player_stats)}
- Average Attendance Rate: {sum(p['attendance_rate'] for p in player_stats) / len(player_stats) if player_stats else 0:.1f}%

Write a narrative that:
1. Celebrates the top performers and their consistency
2. Mentions players who may need support or follow-up
3. Notes any patterns in absences, lates, or injuries
4. Provides actionable insights for coaches
5. Keep it positive but honest, professional, and supportive

Write in second person and keep it concise."""
        
        return self.generate_summary(prompt, max_tokens=600)
    
    def generate_trends_summary(self, team_season_avg: List[Dict], season_stats: List[Dict],
                                 team_stats: List[Dict], monthly_trend: List[Dict]) -> Optional[str]:
        """Generate narrative summary for Trends tab"""
        
        # Determine trend direction
        if len(monthly_trend) >= 2:
            recent_avg = sum(m['attendance_rate'] for m in monthly_trend[-3:]) / min(3, len(monthly_trend))
            older_avg = sum(m['attendance_rate'] for m in monthly_trend[:3]) / min(3, len(monthly_trend))
            if recent_avg > older_avg + 2:
                trend_direction = "improving"
            elif recent_avg < older_avg - 2:
                trend_direction = "declining"
            else:
                trend_direction = "stable"
        else:
            trend_direction = "insufficient data"
        
        # Find best season
        best_season = max(season_stats, key=lambda x: x['attendance_rate']) if season_stats else None
        best_team = max(team_stats, key=lambda x: x['attendance_rate']) if team_stats else None
        
        prompt = f"""You are a helpful soccer coach's assistant analyzing attendance data. Write a clear, professional narrative summary (2-3 short paragraphs) about attendance trends and patterns.

TREND ANALYSIS:
Overall Trend: {trend_direction.capitalize()}
Recent months show {'improvement' if trend_direction == 'improving' else 'decline' if trend_direction == 'declining' else 'stability'} in attendance.

Seasonal Performance:
{self._format_list_for_prompt(season_stats, 'season', 'attendance_rate')}
Best Season: {best_season['season'] if best_season else 'N/A'} ({best_season['attendance_rate']}% if best_season else 'N/A')

Top Performing Team: {best_team['team_name'] if best_team else 'N/A'} ({best_team['attendance_rate']}% if best_team else 'N/A')

Team Performance by Season (sample):
{self._format_team_season_avg(team_season_avg[:10])}

Monthly Trend (last 6 months if available):
{self._format_list_for_prompt(monthly_trend[-6:], 'month', 'attendance_rate')}

Write a narrative that:
1. Describes the overall trend (improving, declining, or stable)
2. Highlights which season performed best and why that might be
3. Notes patterns across different teams and seasons
4. Provides strategic insights for planning future seasons
5. Keeps it forward-looking and actionable

Write in second person and keep it concise."""
        
        return self.generate_summary(prompt, max_tokens=600)
    
    def _analyze_team_demographics(self, team_stats: List[Dict]) -> str:
        """Analyze age and gender patterns from team names"""
        age_groups = {}
        gender_groups = {'Boys': [], 'Girls': [], 'Mixed': []}
        
        for team in team_stats:
            team_name = team['team_name']
            attendance_rate = team['attendance_rate']
            
            # Extract gender (G = Girls, B = Boys)
            if ' G' in team_name or 'G' in team_name[:2]:
                gender_key = 'Girls'
            elif ' B' in team_name or 'B' in team_name[:2]:
                gender_key = 'Boys'
            else:
                gender_key = 'Mixed'
            
            gender_groups[gender_key].append(attendance_rate)
            
            # Extract age (numbers like U15, U16, 15, 16)
            age_match = re.search(r'(?:U)?(\d{2})', team_name)
            if age_match:
                age = age_match.group(1)
                if age not in age_groups:
                    age_groups[age] = []
                age_groups[age].append(attendance_rate)
        
        # Calculate averages
        analysis_lines = []
        
        if gender_groups['Boys'] or gender_groups['Girls']:
            analysis_lines.append("Gender Analysis:")
            if gender_groups['Girls']:
                avg_girls = sum(gender_groups['Girls']) / len(gender_groups['Girls'])
                analysis_lines.append(f"- Girls Teams: {len(gender_groups['Girls'])} teams, Avg Attendance: {avg_girls:.1f}%")
            if gender_groups['Boys']:
                avg_boys = sum(gender_groups['Boys']) / len(gender_groups['Boys'])
                analysis_lines.append(f"- Boys Teams: {len(gender_groups['Boys'])} teams, Avg Attendance: {avg_boys:.1f}%")
        
        if age_groups:
            analysis_lines.append("\nAge Group Analysis:")
            for age in sorted(age_groups.keys()):
                avg_attendance = sum(age_groups[age]) / len(age_groups[age])
                analysis_lines.append(f"- U{age}: {len(age_groups[age])} teams, Avg Attendance: {avg_attendance:.1f}%")
        
        return "\n".join(analysis_lines) if analysis_lines else "No demographic patterns detected."
    
    def _format_teams_for_prompt(self, teams: List[Dict]) -> str:
        """Format team stats for prompt"""
        lines = []
        for i, team in enumerate(teams, 1):
            lines.append(f"{i}. {team['team_name']}: {team['attendance_rate']}% attendance ({team['total_players']} players, {team['total_events']} events)")
        return "\n".join(lines) if lines else "No teams available."
    
    def _format_players_for_prompt(self, players: List[Dict]) -> str:
        """Format player stats for prompt"""
        lines = []
        for i, player in enumerate(players, 1):
            lines.append(f"{i}. {player['player_name']} ({player['team_name']}): {player['attendance_rate']}% ({player['events_attended']}/{player['total_events']} events) - {player['absent_count']} absences, {player['late_count']} lates, {player['injured_count']} injuries")
        return "\n".join(lines) if lines else "No players available."
    
    def _format_list_for_prompt(self, items: List[Dict], name_key: str, value_key: str) -> str:
        """Format a list of dicts for prompt"""
        lines = []
        for item in items:
            lines.append(f"- {item.get(name_key, 'N/A')}: {item.get(value_key, 'N/A')}")
        return "\n".join(lines) if lines else "No data available."
    
    def _format_game_practice_comparison(self, comparisons: List[Dict]) -> str:
        """Format game vs practice comparison for prompt"""
        lines = []
        for comp in comparisons:
            lines.append(f"- {comp['team_name']}: Games {comp['game_attendance_rate']}%, Practice {comp['practice_attendance_rate']}%")
        return "\n".join(lines) if lines else "No comparison data available."
    
    def _format_team_season_avg(self, team_seasons: List[Dict]) -> str:
        """Format team season averages for prompt"""
        lines = []
        for ts in team_seasons[:10]:  # Limit to 10 for brevity
            lines.append(f"- {ts['team_name']} ({ts['season']}): Avg {ts['avg_players_per_event']} players per event")
        return "\n".join(lines) if lines else "No data available."


# Singleton instance
_ai_service = None

def get_ai_service() -> Optional[OllamaAIService]:
    """Get or create AI service instance"""
    global _ai_service
    if _ai_service is None:
        # Try different models in order of preference
        models_to_try = ["llama3.2", "mistral", "qwen2.5", "llama3.1", "llama2"]
        service = None
        
        for model in models_to_try:
            test_service = OllamaAIService(model=model)
            if test_service.check_connection():
                # Check if model is available
                available_models = test_service.list_available_models()
                if any(model in m for m in available_models):
                    service = test_service
                    break
        
        _ai_service = service if service else OllamaAIService()  # Use default even if not connected
    
    return _ai_service


// Global variables
let analysisData = null;
let allPlayerStats = [];
let allTeams = [];

// Chart instances
const charts = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeUpload();
    initializeTabs();
    checkExistingData();
    checkAIAvailability();
});

// Upload functionality
function initializeUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileName = document.getElementById('fileName');
    const uploadNewBtn = document.getElementById('uploadNewBtn');

    // File input change
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileName.textContent = `Selected: ${this.files[0].name}`;
            uploadBtn.style.display = 'inline-flex';
        }
    });

    // Upload button click
    uploadBtn.addEventListener('click', uploadFile);

    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileName.textContent = `Selected: ${files[0].name}`;
            uploadBtn.style.display = 'inline-flex';
        }
    });

    // Upload new file button
    if (uploadNewBtn) {
        uploadNewBtn.addEventListener('click', function() {
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('uploadSection').style.display = 'flex';
            fileInput.value = '';
            fileName.textContent = '';
            uploadBtn.style.display = 'none';
        });
    }
}

// Upload file to server
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('uploadStatus');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (!fileInput.files.length) {
        showStatus('Please select a file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        loadingOverlay.style.display = 'flex';
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            analysisData = data.analysis;
            showStatus('File uploaded and analyzed successfully!', 'success');
            
            setTimeout(() => {
                document.getElementById('uploadSection').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                renderDashboard(analysisData);
            }, 1000);
        } else {
            showStatus(data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        showStatus('Error uploading file: ' + error.message, 'error');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
}

// Check for existing data
async function checkExistingData() {
    try {
        const response = await fetch('/analyze');
        if (response.ok) {
            const data = await response.json();
            analysisData = data;
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            renderDashboard(analysisData);
        }
    } catch (error) {
        // No existing data, show upload screen
    }
}

// Tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Render dashboard
function renderDashboard(data) {
    renderSummaryCards(data.summary);
    renderOverviewTab(data);
    renderTeamsTab(data);
    renderPlayersTab(data);
    renderTrendsTab(data);
}

// Render summary cards
function renderSummaryCards(summary) {
    const container = document.getElementById('summaryCards');
    
    const cards = [
        {
            icon: 'fa-users',
            iconClass: 'blue',
            label: 'Total Players',
            value: summary.total_players
        },
        {
            icon: 'fa-users-line',
            iconClass: 'green',
            label: 'Total Teams',
            value: summary.total_teams
        },
        {
            icon: 'fa-calendar-days',
            iconClass: 'orange',
            label: 'Total Events',
            value: summary.total_events
        },
        {
            icon: 'fa-chart-line',
            iconClass: 'purple',
            label: 'Attendance Rate',
            value: `${summary.overall_attendance_rate}%`
        }
    ];

    container.innerHTML = cards.map(card => `
        <div class="summary-card">
            <div class="summary-card-icon ${card.iconClass}">
                <i class="fas ${card.icon}"></i>
            </div>
            <div class="summary-card-content">
                <h3>${card.label}</h3>
                <div class="value">${card.value}</div>
            </div>
        </div>
    `).join('');
}

// Render Overview Tab
function renderOverviewTab(data) {
    // Attendance Distribution Chart
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
    if (charts.attendance) charts.attendance.destroy();
    
    const attendanceDist = data.summary.attendance_distribution;
    charts.attendance = new Chart(attendanceCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(attendanceDist).map(key => 
                key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            ),
            datasets: [{
                data: Object.values(attendanceDist),
                backgroundColor: [
                    '#10b981',  // present - green
                    '#ef4444',  // absent - red
                    '#f59e0b',  // late - orange
                    '#8b5cf6',  // injured - purple
                    '#94a3b8'   // not_reported - gray
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Event Type Comparison Chart
    const eventTypeCtx = document.getElementById('eventTypeChart').getContext('2d');
    if (charts.eventType) charts.eventType.destroy();
    
    charts.eventType = new Chart(eventTypeCtx, {
        type: 'bar',
        data: {
            labels: data.event_type_stats.map(e => e.event_type),
            datasets: [{
                label: 'Attendance Rate (%)',
                data: data.event_type_stats.map(e => e.attendance_rate),
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Seasonal Chart
    const seasonCtx = document.getElementById('seasonChart').getContext('2d');
    if (charts.season) charts.season.destroy();
    
    charts.season = new Chart(seasonCtx, {
        type: 'bar',
        data: {
            labels: data.season_stats.map(s => s.season),
            datasets: [{
                label: 'Attendance Rate (%)',
                data: data.season_stats.map(s => s.attendance_rate),
                backgroundColor: ['#f59e0b', '#10b981', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Monthly Trend Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    if (charts.monthly) charts.monthly.destroy();
    
    charts.monthly = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: data.monthly_trend.map(m => m.month),
            datasets: [{
                label: 'Attendance Rate (%)',
                data: data.monthly_trend.map(m => m.attendance_rate),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Render Teams Tab
function renderTeamsTab(data) {
    allTeams = data.team_stats.map(t => t.team_name);
    
    // Team Comparison Chart
    const teamCompCtx = document.getElementById('teamComparisonChart').getContext('2d');
    if (charts.teamComparison) charts.teamComparison.destroy();
    
    const topTeams = data.team_stats.slice(0, 10); // Show top 10 teams
    
    charts.teamComparison = new Chart(teamCompCtx, {
        type: 'bar',
        data: {
            labels: topTeams.map(t => t.team_name),
            datasets: [{
                label: 'Attendance Rate (%)',
                data: topTeams.map(t => t.attendance_rate),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Team Event Comparison Chart
    const teamEventCtx = document.getElementById('teamEventComparisonChart').getContext('2d');
    if (charts.teamEvent) charts.teamEvent.destroy();
    
    const topTeamsEvent = data.team_event_comparison.slice(0, 10);
    
    charts.teamEvent = new Chart(teamEventCtx, {
        type: 'bar',
        data: {
            labels: topTeamsEvent.map(t => t.team_name),
            datasets: [
                {
                    label: 'Games',
                    data: topTeamsEvent.map(t => t.game_attendance_rate),
                    backgroundColor: '#2563eb'
                },
                {
                    label: 'Practice',
                    data: topTeamsEvent.map(t => t.practice_attendance_rate),
                    backgroundColor: '#10b981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Team Stats Table
    const tableBody = document.querySelector('#teamStatsTable tbody');
    tableBody.innerHTML = data.team_stats.map(team => {
        const status = getAttendanceStatus(team.attendance_rate);
        return `
            <tr>
                <td><strong>${team.team_name}</strong></td>
                <td>${team.total_players}</td>
                <td>${team.total_events}</td>
                <td><strong>${team.attendance_rate}%</strong></td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
            </tr>
        `;
    }).join('');
}

// Render Players Tab
function renderPlayersTab(data) {
    allPlayerStats = data.player_stats;
    
    // Populate team filter
    const teamFilter = document.getElementById('teamFilter');
    teamFilter.innerHTML = '<option value="">All Teams</option>' + 
        [...new Set(data.player_stats.map(p => p.team_name))].map(team => 
            `<option value="${team}">${team}</option>`
        ).join('');

    // Add filter listeners
    document.getElementById('playerSearch').addEventListener('input', filterPlayers);
    teamFilter.addEventListener('change', filterPlayers);

    // Initial render
    renderPlayerTable(allPlayerStats);

    // Top Players Chart
    const topPlayersCtx = document.getElementById('topPlayersChart').getContext('2d');
    if (charts.topPlayers) charts.topPlayers.destroy();
    
    const topPlayers = data.player_stats.slice(0, 10);
    
    charts.topPlayers = new Chart(topPlayersCtx, {
        type: 'bar',
        data: {
            labels: topPlayers.map(p => p.player_name),
            datasets: [{
                label: 'Attendance Rate (%)',
                data: topPlayers.map(p => p.attendance_rate),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Bottom Players Chart (need attention)
    const bottomPlayersCtx = document.getElementById('bottomPlayersChart').getContext('2d');
    if (charts.bottomPlayers) charts.bottomPlayers.destroy();
    
    const bottomPlayers = data.player_stats
        .filter(p => p.total_events >= 3) // Only players with at least 3 events
        .sort((a, b) => a.attendance_rate - b.attendance_rate)
        .slice(0, 10);
    
    charts.bottomPlayers = new Chart(bottomPlayersCtx, {
        type: 'bar',
        data: {
            labels: bottomPlayers.map(p => p.player_name),
            datasets: [{
                label: 'Attendance Rate (%)',
                data: bottomPlayers.map(p => p.attendance_rate),
                backgroundColor: '#ef4444'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Render player table
function renderPlayerTable(players) {
    const tableBody = document.querySelector('#playerStatsTable tbody');
    tableBody.innerHTML = players.map(player => `
        <tr>
            <td><strong>${player.player_name}</strong></td>
            <td>${player.team_name}</td>
            <td><strong>${player.attendance_rate}%</strong></td>
            <td>${player.events_attended}</td>
            <td>${player.total_events}</td>
            <td>${player.absent_count}</td>
            <td>${player.late_count}</td>
            <td>${player.injured_count}</td>
        </tr>
    `).join('');
}

// Filter players
function filterPlayers() {
    const searchTerm = document.getElementById('playerSearch').value.toLowerCase();
    const teamFilter = document.getElementById('teamFilter').value;

    const filtered = allPlayerStats.filter(player => {
        const matchesSearch = player.player_name.toLowerCase().includes(searchTerm);
        const matchesTeam = !teamFilter || player.team_name === teamFilter;
        return matchesSearch && matchesTeam;
    });

    renderPlayerTable(filtered);
}

// Render Trends Tab
function renderTrendsTab(data) {
    // Team Season Average Chart
    const teamSeasonCtx = document.getElementById('teamSeasonAvgChart').getContext('2d');
    if (charts.teamSeason) charts.teamSeason.destroy();
    
    // Group by season
    const seasons = [...new Set(data.team_season_avg.map(d => d.season))];
    const teams = [...new Set(data.team_season_avg.map(d => d.team_name))].slice(0, 10); // Top 10 teams
    
    const datasets = seasons.map((season, idx) => {
        const colors = ['#2563eb', '#10b981', '#f59e0b'];
        return {
            label: season,
            data: teams.map(team => {
                const entry = data.team_season_avg.find(d => d.team_name === team && d.season === season);
                return entry ? entry.avg_players_per_event : 0;
            }),
            backgroundColor: colors[idx % colors.length]
        };
    });
    
    charts.teamSeason = new Chart(teamSeasonCtx, {
        type: 'bar',
        data: {
            labels: teams,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Insights
    if (data.season_stats.length > 0) {
        const bestSeason = data.season_stats.reduce((a, b) => 
            a.attendance_rate > b.attendance_rate ? a : b
        );
        document.getElementById('bestSeason').textContent = 
            `${bestSeason.season} (${bestSeason.attendance_rate}%)`;
    }

    if (data.event_type_stats.length > 0) {
        const bestEvent = data.event_type_stats.reduce((a, b) => 
            a.attendance_rate > b.attendance_rate ? a : b
        );
        document.getElementById('bestEventType').textContent = 
            `${bestEvent.event_type} (${bestEvent.attendance_rate}%)`;
    }

    if (data.team_stats.length > 0) {
        const topTeam = data.team_stats[0];
        document.getElementById('topTeam').textContent = 
            `${topTeam.team_name} (${topTeam.attendance_rate}%)`;
    }

    // Calculate trend
    if (data.monthly_trend.length >= 2) {
        const recent = data.monthly_trend.slice(-3);
        const older = data.monthly_trend.slice(0, 3);
        const recentAvg = recent.reduce((sum, m) => sum + m.attendance_rate, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.attendance_rate, 0) / older.length;
        
        if (recentAvg > olderAvg + 2) {
            document.getElementById('trend').textContent = '📈 Improving';
        } else if (recentAvg < olderAvg - 2) {
            document.getElementById('trend').textContent = '📉 Declining';
        } else {
            document.getElementById('trend').textContent = '➡️ Stable';
        }
    }
}

// Helper: Get attendance status
function getAttendanceStatus(rate) {
    if (rate >= 90) return { class: 'excellent', text: 'Excellent' };
    if (rate >= 75) return { class: 'good', text: 'Good' };
    if (rate >= 60) return { class: 'fair', text: 'Fair' };
    return { class: 'poor', text: 'Needs Attention' };
}

// AI Summary Functions
let aiAvailable = false;

// Check if AI service is available
async function checkAIAvailability() {
    try {
        const response = await fetch('/ai/check');
        const data = await response.json();
        aiAvailable = data.available || false;
        
        // Update UI to show AI status
        updateAIStatusIndicators(aiAvailable, data.model || null);
    } catch (error) {
        console.log('AI service check failed:', error);
        aiAvailable = false;
        updateAIStatusIndicators(false, null);
    }
}

// Update AI status indicators in the UI
function updateAIStatusIndicators(available, model) {
    const buttons = document.querySelectorAll('.ai-generate-btn');
    buttons.forEach(btn => {
        if (available) {
            btn.disabled = false;
            btn.title = model ? `Using ${model} model` : 'AI available';
        } else {
            btn.disabled = true;
            btn.title = 'AI not available - Please start Ollama';
        }
    });
    
    // Add status badge to first AI card
    const firstCard = document.querySelector('.ai-summary-card');
    if (firstCard) {
        let statusBadge = firstCard.querySelector('.ai-status-badge');
        if (!statusBadge) {
            statusBadge = document.createElement('span');
            statusBadge.className = 'ai-status-badge';
            const header = firstCard.querySelector('.ai-summary-header');
            if (header) {
                header.appendChild(statusBadge);
            }
        }
        
        if (available) {
            statusBadge.className = 'ai-status-badge available';
            statusBadge.innerHTML = `<i class="fas fa-check-circle"></i> AI Ready${model ? ` (${model})` : ''}`;
        } else {
            statusBadge.className = 'ai-status-badge unavailable';
            statusBadge.innerHTML = `<i class="fas fa-exclamation-circle"></i> AI Unavailable`;
        }
    }
}

// Generate AI summary for a specific section
async function generateAISummary(section) {
    const contentDiv = document.getElementById(`aiSummary${section.charAt(0).toUpperCase() + section.slice(1)}Content`);
    const button = event.target.closest('.ai-generate-btn');
    
    if (!aiAvailable) {
        contentDiv.innerHTML = `
            <div class="ai-summary-error">
                <strong>AI Service Not Available</strong><br>
                Please ensure Ollama is installed and running. See the installation guide for details.
            </div>
        `;
        return;
    }
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    contentDiv.innerHTML = `
        <div class="ai-summary-loading">
            <div class="spinner"></div>
            <span>Analyzing data and generating insights...</span>
        </div>
    `;
    
    try {
        const response = await fetch(`/ai/summary/${section}`);
        const data = await response.json();
        
        if (data.success && data.summary) {
            // Display the summary
            contentDiv.innerHTML = `<p>${data.summary.replace(/\n/g, '<br>')}</p>`;
            
            // Re-enable button
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-magic"></i> Generate Summary';
        } else {
            // Show error
            contentDiv.innerHTML = `
                <div class="ai-summary-error">
                    <strong>Error Generating Summary</strong><br>
                    ${data.error || 'Failed to generate summary. Please try again or check Ollama connection.'}
                </div>
            `;
            
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-magic"></i> Generate Summary';
        }
    } catch (error) {
        console.error('Error generating AI summary:', error);
        contentDiv.innerHTML = `
            <div class="ai-summary-error">
                <strong>Connection Error</strong><br>
                Could not connect to AI service. Please ensure Ollama is running and try again.
            </div>
        `;
        
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-magic"></i> Generate Summary';
    }
}


// Global variables
let analysisData = null;
let originalAnalysisData = null; // Store original unfiltered data
let allPlayerStats = [];
let allTeams = [];

// Chart instances
const charts = {};

// Helper functions for team parsing
function parseTeamInfo(teamName) {
    // Extract gender (G = Girls, B = Boys) and birth year from team name
    // Examples: "DCSC G15" -> {gender: 'G', birthYear: '2015'}
    //           "B16 Elite" -> {gender: 'B', birthYear: '2016'}
    const match = teamName.match(/([GB])(\d{2})/);
    if (match) {
        const gender = match[1];
        const year = match[2];
        const birthYear = `20${year}`; // Convert 15 -> 2015, 16 -> 2016
        return { gender, birthYear, year };
    }
    return { gender: null, birthYear: null, year: null };
}

function getUniqueTeams(data) {
    const teams = new Set();
    data.team_stats.forEach(t => teams.add(t.team_name));
    return Array.from(teams).sort();
}

function getUniqueBirthYears(data) {
    const years = new Set();
    data.team_stats.forEach(t => {
        const info = parseTeamInfo(t.team_name);
        if (info.birthYear) {
            years.add(info.birthYear);
        }
    });
    return Array.from(years).sort().reverse(); // Most recent first
}

// Filter data based on selected criteria
function filterOverviewData(data, teamFilter, genderFilter, birthYearFilter) {
    let filteredTeams = data.team_stats;
    
    // Apply filters
    if (teamFilter) {
        filteredTeams = filteredTeams.filter(t => t.team_name === teamFilter);
    }
    if (genderFilter) {
        filteredTeams = filteredTeams.filter(t => {
            const info = parseTeamInfo(t.team_name);
            return info.gender === genderFilter;
        });
    }
    if (birthYearFilter) {
        filteredTeams = filteredTeams.filter(t => {
            const info = parseTeamInfo(t.team_name);
            return info.birthYear === birthYearFilter;
        });
    }
    
    // Recalculate statistics based on filtered teams
    const teamNames = filteredTeams.map(t => t.team_name);
    
    // Filter player stats
    const filteredPlayerStats = data.player_stats.filter(p => 
        teamNames.includes(p.team_name)
    );
    
    // Filter other stats
    const filteredEventTypeStats = data.event_type_stats; // Keep all event types
    const filteredSeasonStats = data.season_stats; // Keep all seasons
    const filteredMonthlyTrend = data.monthly_trend; // Keep all months
    
    // Calculate overall summary for filtered data
    let totalRecords = 0;
    let totalAttended = 0;
    const attendanceDistribution = {
        present: 0,
        absent: 0,
        late: 0,
        injured: 0,
        not_reported: 0
    };
    
    filteredPlayerStats.forEach(p => {
        totalRecords += p.total_events;
        totalAttended += p.events_attended;
        attendanceDistribution.absent += p.absent_count;
        attendanceDistribution.late += p.late_count;
        attendanceDistribution.injured += p.injured_count;
        attendanceDistribution.present += (p.events_attended - p.late_count);
    });
    
    const overallAttendanceRate = totalRecords > 0 ? (totalAttended / totalRecords * 100) : 0;
    
    const filteredSummary = {
        total_records: totalRecords,
        total_players: filteredPlayerStats.length,
        total_teams: filteredTeams.length,
        total_events: filteredTeams.reduce((sum, t) => sum + t.total_events, 0),
        overall_attendance_rate: overallAttendanceRate.toFixed(2),
        attendance_distribution: attendanceDistribution
    };
    
    return {
        summary: filteredSummary,
        team_stats: filteredTeams,
        player_stats: filteredPlayerStats,
        event_type_stats: filteredEventTypeStats,
        season_stats: filteredSeasonStats,
        monthly_trend: filteredMonthlyTrend,
        team_event_comparison: data.team_event_comparison,
        team_season_avg: data.team_season_avg
    };
}

// Initialize overview filters
let filtersInitialized = false;

function updateCascadingFilters() {
    if (!originalAnalysisData) return;
    
    const genderFilter = document.getElementById('overviewGenderFilter');
    const birthYearFilter = document.getElementById('overviewBirthYearFilter');
    const teamFilter = document.getElementById('overviewTeamFilter');
    
    const selectedGender = genderFilter.value;
    const selectedBirthYear = birthYearFilter.value;
    const selectedTeam = teamFilter.value;
    
    // Filter teams based on gender and birth year
    let availableTeams = originalAnalysisData.team_stats.filter(t => {
        const info = parseTeamInfo(t.team_name);
        
        // Apply gender filter
        if (selectedGender && info.gender !== selectedGender) {
            return false;
        }
        
        // Apply birth year filter
        if (selectedBirthYear && info.birthYear !== selectedBirthYear) {
            return false;
        }
        
        return true;
    });
    
    // Get available birth years based on gender
    let availableBirthYears = new Set();
    originalAnalysisData.team_stats.forEach(t => {
        const info = parseTeamInfo(t.team_name);
        
        // Apply gender filter
        if (selectedGender && info.gender !== selectedGender) {
            return;
        }
        
        if (info.birthYear) {
            availableBirthYears.add(info.birthYear);
        }
    });
    
    // Update Birth Year dropdown
    const currentBirthYear = birthYearFilter.value;
    while (birthYearFilter.options.length > 1) {
        birthYearFilter.remove(1);
    }
    
    Array.from(availableBirthYears).sort().reverse().forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentBirthYear && availableBirthYears.has(currentBirthYear)) {
            option.selected = true;
        }
        birthYearFilter.appendChild(option);
    });
    
    // Reset birth year if it's no longer available
    if (currentBirthYear && !availableBirthYears.has(currentBirthYear)) {
        birthYearFilter.value = '';
    }
    
    // Update Team dropdown
    const currentTeam = teamFilter.value;
    while (teamFilter.options.length > 1) {
        teamFilter.remove(1);
    }
    
    availableTeams.sort((a, b) => a.team_name.localeCompare(b.team_name)).forEach(t => {
        const option = document.createElement('option');
        option.value = t.team_name;
        option.textContent = t.team_name;
        if (t.team_name === currentTeam) {
            option.selected = true;
        }
        teamFilter.appendChild(option);
    });
    
    // Reset team if it's no longer available
    if (currentTeam && !availableTeams.some(t => t.team_name === currentTeam)) {
        teamFilter.value = '';
    }
}

function applyOverviewFilters() {
    if (!originalAnalysisData) return;
    
    const genderFilter = document.getElementById('overviewGenderFilter');
    const birthYearFilter = document.getElementById('overviewBirthYearFilter');
    const teamFilter = document.getElementById('overviewTeamFilter');
    const noDataMessage = document.getElementById('noDataMessage');
    const chartsContainer = document.querySelectorAll('#overview .charts-row');
    
    const gender = genderFilter.value;
    const birthYear = birthYearFilter.value;
    const team = teamFilter.value;
    
    // Update cascading filters first
    updateCascadingFilters();
    
    // Filter data
    const filteredData = filterOverviewData(originalAnalysisData, team, gender, birthYear);
    
    // Check if we have data
    const hasData = filteredData.team_stats.length > 0 && filteredData.summary.total_records > 0;
    
    if (hasData) {
        // Hide no data message, show charts
        noDataMessage.style.display = 'none';
        chartsContainer.forEach(el => el.style.display = 'grid');
        
        // Render data
        renderOverviewTab(filteredData);
        renderSummaryCards(filteredData.summary);
    } else {
        // Show no data message, hide charts
        noDataMessage.style.display = 'block';
        chartsContainer.forEach(el => el.style.display = 'none');
        
        // Show empty summary
        const emptySummary = {
            total_records: 0,
            total_players: 0,
            total_teams: 0,
            total_events: 0,
            overall_attendance_rate: 0,
            attendance_distribution: {}
        };
        renderSummaryCards(emptySummary);
    }
}

function initializeOverviewFilters() {
    if (!originalAnalysisData || filtersInitialized) return;
    
    const genderFilter = document.getElementById('overviewGenderFilter');
    const birthYearFilter = document.getElementById('overviewBirthYearFilter');
    const teamFilter = document.getElementById('overviewTeamFilter');
    const updateBtn = document.getElementById('updateOverviewReports');
    const resetBtn = document.getElementById('resetOverviewFilters');
    
    // Initial population of dropdowns
    updateCascadingFilters();
    
    // Add event listeners for cascading dropdowns (but don't apply filters yet)
    genderFilter.addEventListener('change', () => {
        birthYearFilter.value = '';  // Reset dependent filters
        teamFilter.value = '';
        updateCascadingFilters();  // Only update dropdowns, don't apply filters
    });
    
    birthYearFilter.addEventListener('change', () => {
        teamFilter.value = '';  // Reset team when birth year changes
        updateCascadingFilters();  // Only update dropdowns, don't apply filters
    });
    
    // Team filter doesn't need cascading, just update on change
    teamFilter.addEventListener('change', () => {
        // Don't apply filters automatically
    });
    
    // Update Reports button - this is where we apply the filters
    updateBtn.addEventListener('click', applyOverviewFilters);
    
    // Reset button - clear all filters and show all data
    resetBtn.addEventListener('click', () => {
        genderFilter.value = '';
        birthYearFilter.value = '';
        teamFilter.value = '';
        updateCascadingFilters();
        
        const noDataMessage = document.getElementById('noDataMessage');
        const chartsContainer = document.querySelectorAll('#overview .charts-row');
        noDataMessage.style.display = 'none';
        chartsContainer.forEach(el => el.style.display = 'grid');
        
        renderOverviewTab(originalAnalysisData);
        renderSummaryCards(originalAnalysisData.summary);
    });
    
    filtersInitialized = true;
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeUpload();
    initializeTabs();
    checkExistingData();
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
            originalAnalysisData = null; // Reset for new upload
            filtersInitialized = false; // Reset filter initialization
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
    // Store original data for filtering
    if (!originalAnalysisData) {
        originalAnalysisData = JSON.parse(JSON.stringify(data)); // Deep copy
    }
    
    renderSummaryCards(data.summary);
    renderOverviewTab(data);
    renderTeamsTab(data);
    renderPlayersTab(data);
    renderTrendsTab(data);
    
    // Initialize overview filters after rendering
    initializeOverviewFilters();
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
    
    // Calculate total for percentage
    const total = Object.values(attendanceDist).reduce((sum, val) => sum + val, 0);
    
    // Convert to percentages
    const percentages = Object.values(attendanceDist).map(val => 
        total > 0 ? ((val / total) * 100).toFixed(1) : 0
    );
    
    charts.attendance = new Chart(attendanceCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(attendanceDist).map(key => 
                key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            ),
            datasets: [{
                data: percentages,
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return label + ': ' + value + '%';
                        }
                    }
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
    
    // Initialize Team Attendance Tracking
    initializeTeamAttendanceTracking(data);
}

// Initialize Team Attendance Tracking
function initializeTeamAttendanceTracking(data) {
    const teamFilter = document.getElementById('trackingTeamFilter');
    const eventTypeFilter = document.getElementById('trackingEventTypeFilter');
    const updateBtn = document.getElementById('updateTrackingChart');
    
    // Populate team dropdown
    while (teamFilter.options.length > 1) {
        teamFilter.remove(1);
    }
    
    data.team_stats.forEach(team => {
        const option = document.createElement('option');
        option.value = team.team_name;
        option.textContent = team.team_name;
        teamFilter.appendChild(option);
    });
    
    // Update chart button click handler
    updateBtn.addEventListener('click', () => {
        const selectedTeam = teamFilter.value;
        const selectedEventType = eventTypeFilter.value;
        
        if (!selectedTeam) {
            alert('Please select a team first');
            return;
        }
        
        renderTeamAttendanceTrackingChart(data.event_attendance_tracking, selectedTeam, selectedEventType);
    });
}

// Render Team Attendance Tracking Chart
let currentFilteredEvents = []; // Store for tooltip access

function renderTeamAttendanceTrackingChart(eventData, teamName, eventType) {
    const chartContainer = document.getElementById('trackingChartContainer');
    const noSelectionMsg = document.getElementById('trackingNoSelection');
    const chartTitle = document.getElementById('trackingChartTitle');
    
    // Filter data for selected team and event type
    let filteredEvents = eventData.filter(e => e.team_name === teamName);
    
    if (eventType !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.event_type === eventType);
    }
    
    // Sort by date
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredEvents.length === 0) {
        alert('No events found for this team and event type combination');
        return;
    }
    
    // Store for tooltip access
    currentFilteredEvents = filteredEvents;
    
    // Show chart, hide no selection message
    chartContainer.style.display = 'block';
    noSelectionMsg.style.display = 'none';
    
    // Update chart title
    const eventTypeText = eventType === 'all' ? 'All Events' : eventType === 'Game' ? 'Games' : 'Practices';
    chartTitle.textContent = `${teamName} - ${eventTypeText} Attendance Trend`;
    
    // Prepare chart data
    const labels = filteredEvents.map(e => {
        const date = new Date(e.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    });
    
    const attendanceData = filteredEvents.map(e => e.present_count);
    const totalPlayersData = filteredEvents.map(e => e.total_players);
    
    // Create chart
    const ctx = document.getElementById('teamAttendanceTrackingChart').getContext('2d');
    if (charts.teamTracking) charts.teamTracking.destroy();
    
    charts.teamTracking = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Players Attended',
                    data: attendanceData,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Total Roster',
                    data: totalPlayersData,
                    borderColor: '#94a3b8',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderDash: [5, 5],
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#94a3b8',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Players'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Event Date'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            const event = currentFilteredEvents[index];
                            return event.event_name + ' - ' + context[0].label;
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const event = currentFilteredEvents[index];
                            return 'Attendance Rate: ' + event.attendance_rate + '%';
                        }
                    }
                }
            }
        }
    });
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
    
    const topPlayers = data.player_stats.slice(0, 25);
    
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
        .slice(0, 25);
    
    charts.bottomPlayers = new Chart(bottomPlayersCtx, {
        type: 'bar',
        data: {
            labels: bottomPlayers.map(p => p.player_name),
            datasets: [{
                label: 'Absence Rate (%)',
                data: bottomPlayers.map(p => 100 - p.attendance_rate),
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


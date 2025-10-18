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
    
    // Filter calendar data for accurate event-level stats
    const filteredCalendarData = data.player_calendar_data ? 
        data.player_calendar_data.filter(e => teamNames.includes(e.team_name)) : [];
    
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
    
    // Recalculate event type stats from filtered calendar data
    const filteredEventTypeStats = [];
    if (filteredCalendarData.length > 0) {
        const gameEvents = filteredCalendarData.filter(e => e.event_type === 'Game');
        const practiceEvents = filteredCalendarData.filter(e => e.event_type === 'Practice');
        const otherEvents = filteredCalendarData.filter(e => e.event_type === 'Other');
        
        const calcEventTypeRate = (events) => {
            const attended = events.filter(e => e.attendance_status === 'present' || e.attendance_status === 'late').length;
            return events.length > 0 ? (attended / events.length * 100) : 0;
        };
        
        if (gameEvents.length > 0) {
            filteredEventTypeStats.push({
                event_type: 'Game',
                attendance_rate: calcEventTypeRate(gameEvents).toFixed(2),
                total_records: gameEvents.length
            });
        }
        if (practiceEvents.length > 0) {
            filteredEventTypeStats.push({
                event_type: 'Practice',
                attendance_rate: calcEventTypeRate(practiceEvents).toFixed(2),
                total_records: practiceEvents.length
            });
        }
        if (otherEvents.length > 0) {
            filteredEventTypeStats.push({
                event_type: 'Other',
                attendance_rate: calcEventTypeRate(otherEvents).toFixed(2),
                total_records: otherEvents.length
            });
        }
    }
    
    // Recalculate seasonal stats from filtered calendar data
    const filteredSeasonStats = [];
    if (filteredCalendarData.length > 0) {
        const seasonMap = {};
        filteredCalendarData.forEach(e => {
            const date = new Date(e.date);
            const month = date.getMonth() + 1;
            let season = 'Unknown';
            if ([8, 9, 10, 11, 12].includes(month)) season = 'Fall';
            else if ([1, 2, 3, 4, 5].includes(month)) season = 'Spring';
            else season = 'Summer';
            
            if (!seasonMap[season]) seasonMap[season] = { total: 0, attended: 0 };
            seasonMap[season].total++;
            if (e.attendance_status === 'present' || e.attendance_status === 'late') {
                seasonMap[season].attended++;
            }
        });
        
        Object.keys(seasonMap).forEach(season => {
            const rate = (seasonMap[season].attended / seasonMap[season].total * 100).toFixed(2);
            filteredSeasonStats.push({
                season: season,
                attendance_rate: parseFloat(rate),
                total_records: seasonMap[season].total
            });
        });
    }
    
    // Recalculate monthly trend from filtered calendar data
    const filteredMonthlyTrend = [];
    if (filteredCalendarData.length > 0) {
        const monthMap = {};
        filteredCalendarData.forEach(e => {
            const date = new Date(e.date);
            const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM format
            
            if (!monthMap[yearMonth]) monthMap[yearMonth] = { total: 0, attended: 0 };
            monthMap[yearMonth].total++;
            if (e.attendance_status === 'present' || e.attendance_status === 'late') {
                monthMap[yearMonth].attended++;
            }
        });
        
        Object.keys(monthMap).sort().forEach(yearMonth => {
            const rate = (monthMap[yearMonth].attended / monthMap[yearMonth].total * 100).toFixed(2);
            filteredMonthlyTrend.push({
                month: yearMonth,
                attendance_rate: parseFloat(rate),
                total_records: monthMap[yearMonth].total
            });
        });
    }
    
    const overallAttendanceRate = totalRecords > 0 ? (totalAttended / totalRecords * 100) : 0;
    
    // Calculate total players as sum of unique players per filtered team (roster size)
    const totalPlayersInFilteredTeams = filteredTeams.reduce((sum, team) => sum + team.total_players, 0);
    
    const filteredSummary = {
        total_records: totalRecords,
        total_players: totalPlayersInFilteredTeams,
        total_teams: filteredTeams.length,
        total_events: filteredTeams.reduce((sum, t) => sum + t.total_events, 0),
        overall_attendance_rate: overallAttendanceRate.toFixed(2),
        attendance_distribution: attendanceDistribution
    };
    
    return {
        summary: filteredSummary,
        team_stats: filteredTeams,
        player_stats: filteredPlayerStats,
        event_type_stats: filteredEventTypeStats.length > 0 ? filteredEventTypeStats : data.event_type_stats,
        season_stats: filteredSeasonStats.length > 0 ? filteredSeasonStats : data.season_stats,
        monthly_trend: filteredMonthlyTrend.length > 0 ? filteredMonthlyTrend : data.monthly_trend,
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

    // Team Attendance Comparison Chart (moved from Teams tab)
    const teamCompCtx = document.getElementById('teamComparisonChart').getContext('2d');
    if (charts.teamComparison) charts.teamComparison.destroy();
    
    // Show all teams (sorted by attendance rate)
    const allTeams = data.team_stats; // Already sorted from backend
    
    // Calculate dynamic height based on number of teams (minimum 40px per team)
    const chartContainer = document.getElementById('teamComparisonChart').parentElement;
    const minHeightPerTeam = 40;
    const calculatedHeight = Math.max(400, allTeams.length * minHeightPerTeam);
    chartContainer.style.height = calculatedHeight + 'px';
    
    charts.teamComparison = new Chart(teamCompCtx, {
        type: 'bar',
        data: {
            labels: allTeams.map(t => t.team_name),
            datasets: [{
                label: 'Attendance Rate (%)',
                data: allTeams.map(t => t.attendance_rate),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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

// Render Teams Tab
function renderTeamsTab(data) {
    allTeams = data.team_stats.map(t => t.team_name);

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
    
    // Initialize Team Calendar
    initializeTeamCalendar(data);
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

// Initialize Team Calendar
function initializeTeamCalendar(data) {
    const teamFilter = document.getElementById('calTeamFilter');
    const showBtn = document.getElementById('showTeamCalendar');
    
    // Populate team dropdown
    data.team_stats.forEach(team => {
        const option = document.createElement('option');
        option.value = team.team_name;
        option.textContent = team.team_name;
        teamFilter.appendChild(option);
    });
    
    // Show calendar button
    showBtn.addEventListener('click', () => {
        const teamName = teamFilter.value;
        if (!teamName) {
            alert('Please select a team first');
            return;
        }
        const startMonth = parseInt(document.getElementById('teamCalStartMonth').value);
        const endMonth = parseInt(document.getElementById('teamCalEndMonth').value);
        renderTeamCalendar(data.team_calendar_data, teamName, startMonth, endMonth);
    });
}

// Generate Team Calendar Month (with mini-bars)
function generateTeamCalendarMonth(year, month, eventsByDate) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    let html = `
        <div class="calendar-month">
            <div class="calendar-month-header">${monthNames[month]} ${year}</div>
            <div class="calendar-weekdays">
                ${weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
            </div>
            <div class="calendar-days">
    `;
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const events = eventsByDate[dateStr] || [];
        
        if (events.length > 0) {
            // Multiple events on same day - combine them
            const totalPresent = events.reduce((sum, e) => sum + e.present, 0);
            const totalAbsent = events.reduce((sum, e) => sum + e.absent, 0);
            const totalLate = events.reduce((sum, e) => sum + e.late, 0);
            const totalInjured = events.reduce((sum, e) => sum + e.injured, 0);
            const totalNotReported = events.reduce((sum, e) => sum + e.not_reported, 0);
            
            const tooltipText = events.map(e => e.event_name).join(', ') + 
                `\nPresent: ${totalPresent}, Absent: ${totalAbsent}, Late: ${totalLate}, Injured: ${totalInjured}, Not Reported: ${totalNotReported}`;
            
            html += `
                <div class="calendar-day team-event" title="${tooltipText}">
                    <div class="team-event-date">${day}</div>
                    <div class="team-event-bars">
                        ${totalPresent > 0 ? `<div class="team-event-bar present" style="flex: ${totalPresent}"></div>` : ''}
                        ${totalAbsent > 0 ? `<div class="team-event-bar absent" style="flex: ${totalAbsent}"></div>` : ''}
                        ${totalLate > 0 ? `<div class="team-event-bar late" style="flex: ${totalLate}"></div>` : ''}
                        ${totalInjured > 0 ? `<div class="team-event-bar injured" style="flex: ${totalInjured}"></div>` : ''}
                        ${totalNotReported > 0 ? `<div class="team-event-bar not_reported" style="flex: ${totalNotReported}"></div>` : ''}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="calendar-day regular">${day}</div>`;
        }
    }
    
    html += '</div></div>';
    return html;
}

// Render Team Calendar
function renderTeamCalendar(calendarData, teamName, startMonth = 7, endMonth = 6) {
    const container = document.getElementById('teamCalendarContainer');
    const noSelection = document.getElementById('teamCalendarNoSelection');
    const calendarGrid = document.getElementById('teamCalendarGrid');
    const summaryDiv = document.getElementById('teamCalendarSummary');
    
    // Filter data for this team
    const teamEvents = calendarData.filter(e => e.team_name === teamName);
    
    if (teamEvents.length === 0) {
        alert('No events found for this team');
        return;
    }
    
    // Group events by date (can have multiple events per day)
    const eventsByDate = {};
    teamEvents.forEach(event => {
        if (!eventsByDate[event.date]) {
            eventsByDate[event.date] = [];
        }
        eventsByDate[event.date].push(event);
    });
    
    // Find year range
    const dates = teamEvents.map(e => new Date(e.date));
    const minYear = Math.min(...dates.map(d => d.getFullYear()));
    const maxYear = Math.max(...dates.map(d => d.getFullYear()));
    
    // Generate calendar for selected period (Aug-Jul or user-selected)
    let calendarHTML = '<div class="calendar-grid">';
    
    // Determine year for calendar generation
    const currentYear = minYear;
    const nextYear = maxYear >= minYear + 1 ? maxYear : minYear + 1;
    
    // If start month > end month, we span two years (e.g., Aug 2025 to July 2026)
    if (startMonth > endMonth) {
        // Start month to December of current year
        for (let month = startMonth; month < 12; month++) {
            calendarHTML += generateTeamCalendarMonth(currentYear, month, eventsByDate);
        }
        // January to end month of next year
        for (let month = 0; month <= endMonth; month++) {
            calendarHTML += generateTeamCalendarMonth(nextYear, month, eventsByDate);
        }
    } else {
        // Same year (e.g., Jan to Dec)
        for (let month = startMonth; month <= endMonth; month++) {
            calendarHTML += generateTeamCalendarMonth(currentYear, month, eventsByDate);
        }
    }
    
    calendarHTML += '</div>';
    
    // Add legend
    calendarHTML = `
        <h4 style="margin-bottom: 15px; color: var(--text-primary);">Calendar for ${teamName}</h4>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Hover over event dates to see detailed breakdown. Mini-bars show proportion of attendance statuses.</p>
        <div class="calendar-legend">
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #10b981;"></div>
                <div class="calendar-legend-label">Present</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #ef4444;"></div>
                <div class="calendar-legend-label">Absent</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #f59e0b;"></div>
                <div class="calendar-legend-label">Late</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #8b5cf6;"></div>
                <div class="calendar-legend-label">Injured</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #94a3b8;"></div>
                <div class="calendar-legend-label">Not Reported</div>
            </div>
        </div>
    ` + calendarHTML;
    
    calendarGrid.innerHTML = calendarHTML;
    
    // Calculate summary statistics
    const totalEvents = teamEvents.length;
    const totalPresent = teamEvents.reduce((sum, e) => sum + e.present, 0);
    const totalAbsent = teamEvents.reduce((sum, e) => sum + e.absent, 0);
    const totalLate = teamEvents.reduce((sum, e) => sum + e.late, 0);
    const totalInjured = teamEvents.reduce((sum, e) => sum + e.injured, 0);
    const totalNotReported = teamEvents.reduce((sum, e) => sum + e.not_reported, 0);
    const totalRecords = totalPresent + totalAbsent + totalLate + totalInjured + totalNotReported;
    const attendanceRate = totalRecords > 0 ? (((totalPresent + totalLate) / totalRecords) * 100).toFixed(1) : 0;
    
    // Calculate averages per event
    const avgPresent = (totalPresent / totalEvents).toFixed(1);
    const avgAbsent = (totalAbsent / totalEvents).toFixed(1);
    const avgLate = (totalLate / totalEvents).toFixed(1);
    const avgInjured = (totalInjured / totalEvents).toFixed(1);
    const avgNotReported = (totalNotReported / totalEvents).toFixed(1);
    
    summaryDiv.innerHTML = `
        <h4>Summary for ${teamName}</h4>
        <div class="calendar-summary-grid">
            <div class="calendar-summary-item">
                <div class="label">Total Events</div>
                <div class="value">${totalEvents}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Avg Present/Event</div>
                <div class="value">${avgPresent}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Avg Absent/Event</div>
                <div class="value">${avgAbsent}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Avg Late/Event</div>
                <div class="value">${avgLate}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Avg Injured/Event</div>
                <div class="value">${avgInjured}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Avg Not Reported/Event</div>
                <div class="value">${avgNotReported}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Attendance Rate</div>
                <div class="value">${attendanceRate}%</div>
            </div>
        </div>
    `;
    
    // Show calendar, hide no selection message
    container.style.display = 'block';
    noSelection.style.display = 'none';
}

// Calendar Helper Functions
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function generateCalendarMonth(year, month, eventDates) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    let html = `
        <div class="calendar-month">
            <div class="calendar-month-header">${monthNames[month]} ${year}</div>
            <div class="calendar-weekdays">
                ${weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
            </div>
            <div class="calendar-days">
    `;
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const eventData = eventDates[dateStr];
        
        if (eventData) {
            html += `<div class="calendar-day event ${eventData.status}" 
                          title="${eventData.event_name} - ${eventData.status.replace('_', ' ')}">${day}</div>`;
        } else {
            html += `<div class="calendar-day regular">${day}</div>`;
        }
    }
    
    html += '</div></div>';
    return html;
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
    
    const topPlayers = data.player_stats.slice(0, 50);
    
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
        .slice(0, 50);
    
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
    
    // Initialize Player Calendar
    initializePlayerCalendar(data);
}

// Initialize Player Calendar
function initializePlayerCalendar(data) {
    const genderFilter = document.getElementById('calPlayerGenderFilter');
    const birthYearFilter = document.getElementById('calPlayerBirthYearFilter');
    const teamFilter = document.getElementById('calPlayerTeamFilter');
    const playerFilter = document.getElementById('calPlayerNameFilter');
    const showBtn = document.getElementById('showPlayerCalendar');
    
    // Get unique birth years
    const birthYears = [...new Set(data.team_stats.map(t => {
        const info = parseTeamInfo(t.team_name);
        return info.birthYear;
    }).filter(y => y))].sort().reverse();
    
    birthYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        birthYearFilter.appendChild(option);
    });
    
    // Cascading filter logic
    const updatePlayerCalendarFilters = () => {
        const selectedGender = genderFilter.value;
        const selectedBirthYear = birthYearFilter.value;
        const selectedTeam = teamFilter.value;
        
        // Update team filter
        const teams = data.player_stats
            .map(p => p.team_name)
            .filter((team, index, self) => self.indexOf(team) === index)
            .filter(team => {
                const info = parseTeamInfo(team);
                if (selectedGender && info.gender !== selectedGender) return false;
                if (selectedBirthYear && info.birthYear !== selectedBirthYear) return false;
                return true;
            }).sort();
        
        teamFilter.innerHTML = '<option value="">Select a team...</option>' +
            teams.map(team => `<option value="${team}">${team}</option>`).join('');
        
        // Update player filter
        const players = data.player_stats
            .filter(p => {
                if (selectedGender) {
                    const info = parseTeamInfo(p.team_name);
                    if (info.gender !== selectedGender) return false;
                }
                if (selectedBirthYear) {
                    const info = parseTeamInfo(p.team_name);
                    if (info.birthYear !== selectedBirthYear) return false;
                }
                if (selectedTeam && p.team_name !== selectedTeam) return false;
                return true;
            })
            .sort((a, b) => a.player_name.localeCompare(b.player_name));
        
        playerFilter.innerHTML = '<option value="">Select a player...</option>' +
            players.map(p => `<option value="${p.player_id}">${p.player_name}</option>`).join('');
    };
    
    genderFilter.addEventListener('change', () => {
        birthYearFilter.value = '';
        teamFilter.value = '';
        playerFilter.value = '';
        updatePlayerCalendarFilters();
    });
    
    birthYearFilter.addEventListener('change', () => {
        teamFilter.value = '';
        playerFilter.value = '';
        updatePlayerCalendarFilters();
    });
    
    teamFilter.addEventListener('change', () => {
        playerFilter.value = '';
        updatePlayerCalendarFilters();
    });
    
    updatePlayerCalendarFilters();
    
    // Show calendar button
    showBtn.addEventListener('click', () => {
        const playerId = playerFilter.value;
        if (!playerId) {
            alert('Please select a player first');
            return;
        }
        const startMonth = parseInt(document.getElementById('playerCalStartMonth').value);
        const endMonth = parseInt(document.getElementById('playerCalEndMonth').value);
        renderPlayerCalendar(data.player_calendar_data, parseInt(playerId), startMonth, endMonth);
    });
}

// Render Player Calendar
function renderPlayerCalendar(calendarData, playerId, startMonth = 7, endMonth = 6) {
    const container = document.getElementById('playerCalendarContainer');
    const noSelection = document.getElementById('playerCalendarNoSelection');
    const calendarGrid = document.getElementById('playerCalendarGrid');
    const summaryDiv = document.getElementById('playerCalendarSummary');
    
    // Filter data for this player
    const playerEvents = calendarData.filter(e => e.player_id === playerId);
    
    if (playerEvents.length === 0) {
        alert('No events found for this player');
        return;
    }
    
    const playerName = playerEvents[0].player_name;
    const teamName = playerEvents[0].team_name;
    
    // Group events by date
    const eventsByDate = {};
    playerEvents.forEach(event => {
        eventsByDate[event.date] = {
            status: event.attendance_status,
            event_name: event.event_name,
            event_type: event.event_type
        };
    });
    
    // Find year range
    const dates = playerEvents.map(e => new Date(e.date));
    const minYear = Math.min(...dates.map(d => d.getFullYear()));
    const maxYear = Math.max(...dates.map(d => d.getFullYear()));
    
    // Generate calendar for selected period (Aug-Jul or user-selected)
    let calendarHTML = '<div class="calendar-grid">';
    
    // Determine year for calendar generation
    const currentYear = minYear;
    const nextYear = maxYear >= minYear + 1 ? maxYear : minYear + 1;
    
    // If start month > end month, we span two years (e.g., Aug 2025 to July 2026)
    if (startMonth > endMonth) {
        // Start month to December of current year
        for (let month = startMonth; month < 12; month++) {
            calendarHTML += generateCalendarMonth(currentYear, month, eventsByDate);
        }
        // January to end month of next year
        for (let month = 0; month <= endMonth; month++) {
            calendarHTML += generateCalendarMonth(nextYear, month, eventsByDate);
        }
    } else {
        // Same year (e.g., Jan to Dec)
        for (let month = startMonth; month <= endMonth; month++) {
            calendarHTML += generateCalendarMonth(currentYear, month, eventsByDate);
        }
    }
    
    calendarHTML += '</div>';
    
    // Add legend
    calendarHTML = `
        <div class="calendar-legend">
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #10b981;"></div>
                <div class="calendar-legend-label">Present</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #ef4444;"></div>
                <div class="calendar-legend-label">Absent</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #f59e0b;"></div>
                <div class="calendar-legend-label">Late</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #8b5cf6;"></div>
                <div class="calendar-legend-label">Injured</div>
            </div>
            <div class="calendar-legend-item">
                <div class="calendar-legend-color" style="background: #94a3b8;"></div>
                <div class="calendar-legend-label">Not Reported</div>
            </div>
        </div>
    ` + calendarHTML;
    
    calendarGrid.innerHTML = calendarHTML;
    
    // Calculate summary statistics
    const statusCounts = {
        present: playerEvents.filter(e => e.attendance_status === 'present').length,
        absent: playerEvents.filter(e => e.attendance_status === 'absent').length,
        late: playerEvents.filter(e => e.attendance_status === 'late').length,
        injured: playerEvents.filter(e => e.attendance_status === 'injured').length,
        not_reported: playerEvents.filter(e => e.attendance_status === 'not_reported').length
    };
    
    const totalEvents = playerEvents.length;
    const attendedEvents = statusCounts.present + statusCounts.late;
    const attendanceRate = ((attendedEvents / totalEvents) * 100).toFixed(1);
    
    summaryDiv.innerHTML = `
        <h4>Summary for ${playerName} (${teamName})</h4>
        <div class="calendar-summary-grid">
            <div class="calendar-summary-item">
                <div class="label">Total Events</div>
                <div class="value">${totalEvents}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Present</div>
                <div class="value">${statusCounts.present}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Absent</div>
                <div class="value">${statusCounts.absent}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Late</div>
                <div class="value">${statusCounts.late}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Injured</div>
                <div class="value">${statusCounts.injured}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Not Reported</div>
                <div class="value">${statusCounts.not_reported}</div>
            </div>
            <div class="calendar-summary-item">
                <div class="label">Attendance Rate</div>
                <div class="value">${attendanceRate}%</div>
            </div>
        </div>
    `;
    
    // Show calendar, hide no selection message
    container.style.display = 'block';
    noSelection.style.display = 'none';
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


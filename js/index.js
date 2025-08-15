// Global variables
        let allEvents = [];
        let updateInterval;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Dashboard initializing...');
            loadEventsFromStorage();
            updateDashboard();
            startRealTimeUpdates();
        });

        // Load events from localStorage (same key as Events.html)
        function loadEventsFromStorage() {
            try {
                const savedEvents = localStorage.getItem('savedEvents');
                if (savedEvents) {
                    allEvents = JSON.parse(savedEvents);
                    console.log('Loaded', allEvents.length, 'events from storage');
                } else {
                    allEvents = [];
                    console.log('No events found in storage');
                }
            } catch (error) {
                console.error('Error loading events:', error);
                allEvents = [];
            }
        }

        // Update entire dashboard
        function updateDashboard() {
            console.log('Updating dashboard with', allEvents.length, 'events');
            updateBudgetCards();
            updateEventsList();
            updateLiveIndicator();
        }

        // Update budget statistics cards
function updateBudgetCards() {
    // Load budget settings from localStorage (same as budget page)
    let budgetSettings = {
        totalBudget: 8000,
        period: 'annual',
        emergencyReserve: 10
    };
    
    try {
        const savedBudgetSettings = localStorage.getItem('budgetSettings');
        if (savedBudgetSettings) {
            budgetSettings = { ...budgetSettings, ...JSON.parse(savedBudgetSettings) };
        }
    } catch (error) {
        console.error('Error loading budget settings:', error);
    }

    const totalAvailableBudget = budgetSettings.totalBudget;
    const allocatedBudget = allEvents.reduce((sum, event) => sum + (event.totalBudget || 0), 0);
    const remainingBudget = totalAvailableBudget - allocatedBudget;
    const emergencyReserveAmount = (totalAvailableBudget * budgetSettings.emergencyReserve) / 100;
    
    const activeEvents = allEvents.filter(event => event.status === 'active').length;
    const planningEvents = allEvents.filter(event => event.status === 'planning').length;
    const totalEventsCount = allEvents.length;

    // Update total available budget (to match budget page)
    document.getElementById('totalBudget').textContent = `$${totalAvailableBudget.toLocaleString()}`;
    const allocatedPercent = totalAvailableBudget > 0 ? (allocatedBudget / totalAvailableBudget) * 100 : 0;
    document.getElementById('totalProgress').style.width = `${Math.min(allocatedPercent, 100)}%`;
    document.getElementById('totalProgressText').textContent = `${Math.round(allocatedPercent)}% allocated`;

    // Update progress bar color based on allocation percentage (like budget page)
    const totalProgressBar = document.getElementById('totalProgress');
    if (allocatedPercent > 90) {
        totalProgressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else if (allocatedPercent > 75) {
        totalProgressBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
        totalProgressBar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    }

    // Update active events
    document.getElementById('activeEventsCount').textContent = activeEvents;
    const activePercent = totalEventsCount > 0 ? (activeEvents / totalEventsCount) * 100 : 0;
    document.getElementById('activeProgress').style.width = `${activePercent}%`;
    document.getElementById('activeProgressText').textContent = `${Math.round(activePercent)}% events are active`;

    // Update planning events
    document.getElementById('planningEventsCount').textContent = planningEvents;
    const planningPercent = totalEventsCount > 0 ? (planningEvents / totalEventsCount) * 100 : 0;
    document.getElementById('planningProgress').style.width = `${planningPercent}%`;
    document.getElementById('planningProgressText').textContent = `${Math.round(planningPercent)}% events in planning`;

    // Update budget subtitle to show allocated amount (like budget page)
    const totalBudgetCard = document.querySelector('.budget-card:first-child .budget-subtitle');
    if (totalBudgetCard) {
        totalBudgetCard.textContent = `$${allocatedBudget.toLocaleString()} allocated of $${totalAvailableBudget.toLocaleString()} total`;
    }
}

        // Update events list (show recent 5 events)
        function updateEventsList() {
            const eventsList = document.getElementById('eventsList');
            
            if (allEvents.length === 0) {
                eventsList.innerHTML = `
                    <div class="no-events">
                        <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                        </svg>
                        <h3>No events yet</h3>
                        <p>Create your first event to see it here!</p>
                        <button class="add-event-btn" onclick="goToEvents()" style="margin-top: 1rem;">Create First Event</button>
                    </div>
                `;
                return;
            }

            // Sort events by creation date (newest first) and take first 5
            const recentEvents = [...allEvents]
                .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                .slice(0, 5);

            eventsList.innerHTML = recentEvents.map(event => createEventItem(event)).join('');
        }

        // Create individual event item HTML
        function createEventItem(event) {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            
            const formattedTime = formatTime(event.time);

            return `
                <div class="event-item" onclick="goToEventDetails(${event.id})">
                    <div class="event-info">
                        <h4 class="event-name">${event.name}</h4>
                        <p class="event-date">${formattedDate} • ${formattedTime}</p>
                        <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem;">
                            📍 ${event.venue?.name || 'Venue TBD'} • 👥 ${event.attendeeCount || 0} attendees
                        </p>
                    </div>
                    <div class="event-budget">
                        <div class="event-amount">$${(event.totalBudget || 0).toLocaleString()}</div>
                        <div class="event-status status-${event.status || 'planning'}">${capitalizeFirst(event.status || 'planning')}</div>
                    </div>
                </div>
            `;
        }

        // Update live indicator
        function updateLiveIndicator() {
            const liveCount = document.getElementById('liveEventCount');
            const totalEvents = allEvents.length;
            const activeEvents = allEvents.filter(event => event.status === 'active').length;
            
            liveCount.textContent = `${totalEvents} events • ${activeEvents} active`;
        }

        // Start real-time updates (check for changes every 5 seconds)
        function startRealTimeUpdates() {
            updateInterval = setInterval(() => {
                const currentEventCount = allEvents.length;
                loadEventsFromStorage();
                
                if (allEvents.length !== currentEventCount) {
                    console.log('Events updated, refreshing dashboard');
                    updateDashboard();
                    addRealtimeUpdate('Dashboard updated with latest events');
                }
            }, 5000);
        }

        // Add real-time update notification
        function addRealtimeUpdate(message) {
            const updatesList = document.getElementById('updatesList');
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit'
            });
            
            const updateItem = document.createElement('div');
            updateItem.className = 'update-item';
            updateItem.innerHTML = `
                <div class="update-dot"></div>
                <div class="update-content">
                    <div class="update-text">${message}</div>
                    <div class="update-time">${timeString}</div>
                </div>
            `;
            
            updatesList.insertBefore(updateItem, updatesList.firstChild);
            
            // Keep only last 10 updates
            while (updatesList.children.length > 10) {
                updatesList.removeChild(updatesList.lastChild);
            }
        }

        // Navigate to events page
        function goToEvents() {
            window.location.href = 'Events.html';
        }

        // Navigate to event details (could open modal or go to events page)
        function goToEventDetails(eventId) {
            // For now, just go to events page - could be enhanced to show modal
            window.location.href = 'Events.html';
        }

        // Toggle updates panel
        function toggleUpdates() {
            const panel = document.getElementById('updatesPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }

        // Mobile sidebar toggle
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        }

        // Utility functions
        function capitalizeFirst(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function formatTime(timeString) {
            if (!timeString) return 'Time TBD';
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        }

        // Listen for storage changes (when events are added/modified in Events.html)
        window.addEventListener('storage', function(e) {
            if (e.key === 'savedEvents') {
                console.log('Storage changed, updating dashboard');
                loadEventsFromStorage();
                updateDashboard();
                addRealtimeUpdate('Events synchronized from another tab');
            }
        });

        // Listen for focus events (when user switches back to dashboard tab)
        window.addEventListener('focus', function() {
            console.log('Tab focused, checking for updates');
            const currentEventCount = allEvents.length;
            loadEventsFromStorage();
            
            if (allEvents.length !== currentEventCount) {
                updateDashboard();
                addRealtimeUpdate('Dashboard refreshed with latest data');
            }
        });

        // Add some initial updates when page loads
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                addRealtimeUpdate('Dashboard initialized successfully');
                if (allEvents.length > 0) {
                    addRealtimeUpdate(`Loaded ${allEvents.length} events from storage`);
                }
            }, 1000);
        });

        // Enhanced budget calculations
        function getDetailedBudgetStats() {
            const stats = {
                total: 0,
                spent: 0,
                remaining: 0,
                byStatus: {
                    planning: 0,
                    active: 0,
                    completed: 0,
                    cancelled: 0
                },
                byType: {},
                monthlySpend: 0
            };

            allEvents.forEach(event => {
                const budget = event.totalBudget || 0;
                stats.total += budget;
                
                // Calculate by status
                const status = event.status || 'planning';
                stats.byStatus[status] += budget;
                
                // Calculate by type
                const type = event.type || 'other';
                stats.byType[type] = (stats.byType[type] || 0) + budget;
                
                // Calculate monthly spend (completed events)
                if (status === 'completed') {
                    stats.spent += budget;
                }
            });

            stats.remaining = stats.total - stats.spent;
            
            return stats;
        }

        // Update budget with more detailed information
        function updateDetailedBudget() {
            const stats = getDetailedBudgetStats();
            
            // You can use these stats for more detailed dashboard cards
            console.log('Budget Stats:', stats);
            
            // Update additional budget information
            const totalBudgetCard = document.querySelector('.budget-card:first-child .budget-subtitle');
            if (totalBudgetCard && allEvents.length > 0) {
                totalBudgetCard.textContent = `Allocated across ${allEvents.length} events`;
            }
        }

        // Add click tracking for dashboard analytics
        function trackDashboardInteraction(action, details = {}) {
            console.log('Dashboard Interaction:', action, details);
            addRealtimeUpdate(`User ${action.toLowerCase()}`);
        }

        // Enhanced event item with more interactions
        function createEnhancedEventItem(event) {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate > new Date();
            const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
            
            const dateInfo = isUpcoming && daysUntil <= 30 
                ? `${daysUntil} days to go` 
                : eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return `
                <div class="event-item" onclick="goToEventDetails(${event.id}); trackDashboardInteraction('Viewed event details', {eventId: ${event.id}})">
                    <div class="event-info">
                        <h4 class="event-name">${event.name}</h4>
                        <p class="event-date">${formatTime(event.time)} • ${dateInfo}</p>
                        <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem;">
                            📍 ${event.venue?.name || 'Venue TBD'} • 👥 ${event.attendeeCount || 0} attendees
                        </p>
                        ${event.description ? `<p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; opacity: 0.8;">${event.description.substring(0, 50)}...</p>` : ''}
                    </div>
                    <div class="event-budget">
                        <div class="event-amount">${(event.totalBudget || 0).toLocaleString()}</div>
                        <div class="event-status status-${event.status || 'planning'}">${capitalizeFirst(event.status || 'planning')}</div>
                        ${isUpcoming && daysUntil <= 7 ? '<div style="font-size: 0.7rem; color: #ef4444; margin-top: 0.25rem;">⚡ Coming Soon</div>' : ''}
                    </div>
                </div>
            `;
        }

        // Check for urgent events (upcoming in next 7 days)
        function checkUrgentEvents() {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            const urgentEvents = allEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= now && eventDate <= nextWeek && event.status !== 'completed';
            });

            if (urgentEvents.length > 0) {
                addRealtimeUpdate(`${urgentEvents.length} event(s) upcoming in the next 7 days`);
            }

            return urgentEvents;
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + E to go to events
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                goToEvents();
            }
            
            // Ctrl/Cmd + R to refresh dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                loadEventsFromStorage();
                updateDashboard();
                addRealtimeUpdate('Dashboard manually refreshed');
            }
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', function() {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        });

        // Add error handling for localStorage issues
        window.addEventListener('error', function(e) {
            console.error('Dashboard error:', e);
            addRealtimeUpdate('Dashboard encountered an error - please refresh');
        });

        // Add CSS animations for new events
        function animateNewEvent() {
            const eventItems = document.querySelectorAll('.event-item');
            if (eventItems.length > 0) {
                eventItems[0].style.animation = 'slideInFromRight 0.5s ease-out';
            }
        }

        // Add CSS for new animations
        const additionalStyles = document.createElement('style');
        additionalStyles.textContent = `
            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .updates-panel {
                position: fixed;
                top: 0;
                right: 0;
                width: 300px;
                height: 100vh;
                background: white;
                box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                padding: 1rem;
                overflow-y: auto;
            }

            .updates-header {
                font-weight: 600;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .update-item {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                padding: 0.75rem 0;
                border-bottom: 1px solid #f3f4f6;
            }

            .update-dot {
                width: 8px;
                height: 8px;
                background: #3b82f6;
                border-radius: 50%;
                margin-top: 0.5rem;
                flex-shrink: 0;
            }

            .update-content {
                flex: 1;
            }

            .update-text {
                font-size: 0.875rem;
                color: #1e293b;
                margin-bottom: 0.25rem;
            }

            .update-time {
                font-size: 0.75rem;
                color: #6b7280;
            }


            

            @media (max-width: 768px) {
                .sidebar {
                    transform: translateX(-100%);
                }

                .sidebar.mobile-open {
                    transform: translateX(0);
                }

                .main-content {
                    margin-left: 0;
                    padding: 1rem;
                }

                .mobile-menu-btn {
                    display: block;
                }

                .updates-panel {
                    width: 100vw;
                }
            }
        `;
        document.head.appendChild(additionalStyles);
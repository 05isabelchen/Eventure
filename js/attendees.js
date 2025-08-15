// Global variables
        let allEvents = [];
        let filteredEvents = [];
        let expandedEvents = new Set();

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Attendees page initializing...');
            loadEvents();
            addSampleAttendees(); // Add sample data for demonstration
            updateOverviewStats();
            updateEventsDisplay();
        });

        // Load events from localStorage
        function loadEvents() {
            try {
                const savedEvents = localStorage.getItem('savedEvents');
                if (savedEvents) {
                    allEvents = JSON.parse(savedEvents);
                    console.log('Loaded', allEvents.length, 'events');
                } else {
                    allEvents = [];
                }
                
                filteredEvents = [...allEvents];
            } catch (error) {
                console.error('Error loading events:', error);
                allEvents = [];
                filteredEvents = [];
            }
        }

        // Add sample attendees for demonstration
        function addSampleAttendees() {
            allEvents.forEach(event => {
                if (!event.attendees || event.attendees.length === 0) {
                    event.attendees = generateSampleAttendees(event);
                }
            });
            
            // Save updated events back to localStorage
            try {
                localStorage.setItem('savedEvents', JSON.stringify(allEvents));
            } catch (error) {
                console.error('Error saving events with sample attendees:', error);
            }
        }

        // Generate sample attendees for an event
        function generateSampleAttendees(event) {
            const sampleNames = [
                { firstName: 'Isabel', lastName: 'Chen', email: '05isabelchen@berkeley.edu', phone: '(510) 960-9909' }
            ];

            const statuses = ['confirmed', 'pending', 'declined'];
            const attendeeCount = Math.min(Math.floor(Math.random() * 8) + 3, sampleNames.length);
            const selectedNames = sampleNames.slice(0, attendeeCount);

            return selectedNames.map((person, index) => ({
                id: `${event.id}_attendee_${index + 1}`,
                name: `${person.firstName} ${person.lastName}`,
                firstName: person.firstName,
                lastName: person.lastName,
                email: person.email,
                phone: person.phone,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                rsvpDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                notes: Math.random() > 0.7 ? 'Dietary restrictions: Vegetarian' : ''
            }));
        }

        // Update overview statistics
        function updateOverviewStats() {
            const totalEvents = filteredEvents.length;
            let totalAttendees = 0;
            let confirmedCount = 0;
            let pendingCount = 0;

            filteredEvents.forEach(event => {
                if (event.attendees) {
                    totalAttendees += event.attendees.length;
                    confirmedCount += event.attendees.filter(a => a.status === 'confirmed').length;
                    pendingCount += event.attendees.filter(a => a.status === 'pending').length;
                }
            });

            document.getElementById('totalEvents').textContent = totalEvents;
            document.getElementById('totalAttendees').textContent = totalAttendees;
            document.getElementById('confirmedAttendees').textContent = confirmedCount;
            document.getElementById('pendingAttendees').textContent = pendingCount;
        }

        // Update events display
        function updateEventsDisplay() {
            const container = document.getElementById('eventsContainer');
            const noEventsMessage = document.getElementById('noEventsMessage');

            if (filteredEvents.length === 0) {
                container.style.display = 'none';
                noEventsMessage.style.display = 'block';
                return;
            }

            container.style.display = 'block';
            noEventsMessage.style.display = 'none';

            container.innerHTML = filteredEvents.map(event => createExpandableEventCard(event)).join('');
        }

        // Create expandable event card
        function createExpandableEventCard(event) {
            const attendees = event.attendees || [];
            const confirmedCount = attendees.filter(a => a.status === 'confirmed').length;
            const pendingCount = attendees.filter(a => a.status === 'pending').length;
            const declinedCount = attendees.filter(a => a.status === 'declined').length;
            const isExpanded = expandedEvents.has(event.id);

            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });

            return `
                <div class="expandable-event-card ${isExpanded ? 'expanded' : ''}" data-event-id="${event.id}">
                    <div class="event-card-header" onclick="toggleEventExpansion(${event.id})">
                        <div class="event-main-info">
                            <h3 class="event-card-title">${event.name}</h3>
                            <div class="event-card-meta">
                                <span class="event-date">📅 ${formattedDate} • ${formatTime(event.time)}</span>
                                <span class="event-venue">📍 ${event.venue?.name || 'Venue TBD'}</span>
                                <span class="event-status status-${event.status || 'planning'}">${capitalizeFirst(event.status || 'planning')}</span>
                            </div>
                        </div>
                        
                        <div class="event-attendee-summary">
                            <div class="attendee-stats">
                                <div class="stat-item">
                                    <span class="stat-number">${attendees.length}</span>
                                    <span class="stat-label">Total</span>
                                </div>
                                <div class="stat-item confirmed">
                                    <span class="stat-number">${confirmedCount}</span>
                                    <span class="stat-label">Confirmed</span>
                                </div>
                                <div class="stat-item pending">
                                    <span class="stat-number">${pendingCount}</span>
                                    <span class="stat-label">Pending</span>
                                </div>
                                ${declinedCount > 0 ? `
                                <div class="stat-item declined">
                                    <span class="stat-number">${declinedCount}</span>
                                    <span class="stat-label">Declined</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="expand-button">
                                <svg class="expand-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="event-attendees-section" style="display: ${isExpanded ? 'block' : 'none'};">
                        <div class="attendees-header">
                            <h4>Attendees (${attendees.length})</h4>
                            <div class="attendees-actions">
                                <button class="btn-small btn-outline" onclick="exportEventAttendees(${event.id})">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                    Export
                                </button>
                                <button class="btn-small btn-primary" onclick="sendEventReminder(${event.id})">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                    </svg>
                                    Send Reminder
                                </button>
                            </div>
                        </div>

                        <div class="attendees-filters">
                            <input type="text" class="attendee-search" placeholder="Search attendees..." oninput="filterAttendees(${event.id}, this.value)">
                            <select class="attendee-status-filter" onchange="filterAttendeesByStatus(${event.id}, this.value)">
                                <option value="">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>

                        <div class="attendees-grid" id="attendees-${event.id}">
                            ${attendees.length > 0 ? attendees.map(attendee => createAttendeeCard(attendee, event.id)).join('') : '<div class="no-attendees-message">No attendees for this event yet.</div>'}
                        </div>
                    </div>
                </div>
            `;
        }

        // Create attendee card
        function createAttendeeCard(attendee, eventId) {
            const initials = attendee.name ? 
                attendee.name.split(' ').map(n => n[0]).join('').toUpperCase() :
                (attendee.firstName && attendee.lastName ? 
                    `${attendee.firstName[0]}${attendee.lastName[0]}`.toUpperCase() :
                    'NA');

            const rsvpDate = attendee.rsvpDate ? 
                new Date(attendee.rsvpDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }) : 'N/A';

            return `
                <div class="attendee-card" data-attendee-id="${attendee.id}" data-status="${attendee.status}">
                    <div class="attendee-header">
                        <div class="attendee-avatar">
                            <span class="avatar-initials">${initials}</span>
                        </div>
                        <div class="attendee-info">
                            <h5 class="attendee-name">${attendee.name}</h5>
                            <p class="attendee-email">${attendee.email}</p>
                            ${attendee.phone ? `<p class="attendee-phone">${attendee.phone}</p>` : ''}
                        </div>
                        <div class="attendee-status-badge status-${attendee.status}">
                            ${capitalizeFirst(attendee.status)}
                        </div>
                    </div>
                    
                    <div class="attendee-details">
                        <div class="attendee-meta">
                            <span class="rsvp-date">RSVP'd ${rsvpDate}</span>
                            ${attendee.notes ? `<span class="attendee-notes">${attendee.notes}</span>` : ''}
                        </div>
                        
                    </div>
                </div>
            `;
        }

        // Toggle event expansion
        function toggleEventExpansion(eventId) {
            const card = document.querySelector(`[data-event-id="${eventId}"]`);
            const attendeesSection = card.querySelector('.event-attendees-section');
            const expandIcon = card.querySelector('.expand-icon');
            
            if (expandedEvents.has(eventId)) {
                // Collapse
                expandedEvents.delete(eventId);
                card.classList.remove('expanded');
                attendeesSection.style.display = 'none';
                expandIcon.style.transform = 'rotate(0deg)';
            } else {
                // Expand
                expandedEvents.add(eventId);
                card.classList.add('expanded');
                attendeesSection.style.display = 'block';
                expandIcon.style.transform = 'rotate(180deg)';
            }

            updateExpandCollapseButtons();
        }

        // Expand all events
        function expandAllEvents() {
            filteredEvents.forEach(event => {
                expandedEvents.add(event.id);
            });
            updateEventsDisplay();
            updateExpandCollapseButtons();
        }

        // Collapse all events
        function collapseAllEvents() {
            expandedEvents.clear();
            updateEventsDisplay();
            updateExpandCollapseButtons();
        }

        // Update expand/collapse buttons
        function updateExpandCollapseButtons() {
            const expandBtn = document.getElementById('expandAllBtn');
            const collapseBtn = document.getElementById('collapseAllBtn');
            
            if (expandedEvents.size > 0) {
                expandBtn.style.display = 'none';
                collapseBtn.style.display = 'flex';
            } else {
                expandBtn.style.display = 'flex';
                collapseBtn.style.display = 'none';
            }
        }

        // Filter events
        function filterEvents() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const statusFilter = document.getElementById('statusFilter').value;

            filteredEvents = allEvents.filter(event => {
                // Status filter
                const statusMatch = !statusFilter || event.status === statusFilter;
                
                // Search filter (event name, venue, or attendee names/emails)
                let searchMatch = true;
                if (searchTerm) {
                    const eventMatch = event.name.toLowerCase().includes(searchTerm) ||
                                     (event.venue?.name || '').toLowerCase().includes(searchTerm);
                    
                    const attendeeMatch = event.attendees && event.attendees.some(attendee => 
                        attendee.name.toLowerCase().includes(searchTerm) ||
                        attendee.email.toLowerCase().includes(searchTerm)
                    );
                    
                    searchMatch = eventMatch || attendeeMatch;
                }
                
                return statusMatch && searchMatch;
            });

            updateOverviewStats();
            updateEventsDisplay();
        }

        // Filter attendees within an event
        function filterAttendees(eventId, searchTerm) {
            const event = allEvents.find(e => e.id === eventId);
            if (!event || !event.attendees) return;

            const attendeesGrid = document.getElementById(`attendees-${eventId}`);
            const filteredAttendees = event.attendees.filter(attendee =>
                attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

            attendeesGrid.innerHTML = filteredAttendees.length > 0 ? 
                filteredAttendees.map(attendee => createAttendeeCard(attendee, eventId)).join('') :
                '<div class="no-attendees-message">No attendees match your search.</div>';
        }

        // Filter attendees by status within an event
        function filterAttendeesByStatus(eventId, status) {
            const event = allEvents.find(e => e.id === eventId);
            if (!event || !event.attendees) return;

            const attendeesGrid = document.getElementById(`attendees-${eventId}`);
            const filteredAttendees = status ? 
                event.attendees.filter(attendee => attendee.status === status) :
                event.attendees;

            attendeesGrid.innerHTML = filteredAttendees.length > 0 ? 
                filteredAttendees.map(attendee => createAttendeeCard(attendee, eventId)).join('') :
                '<div class="no-attendees-message">No attendees with this status.</div>';
        }

        // Export all attendees
        function exportAllAttendees() {
            const allAttendees = [];
            
            allEvents.forEach(event => {
                if (event.attendees) {
                    event.attendees.forEach(attendee => {
                        allAttendees.push({
                            eventName: event.name,
                            eventDate: event.date,
                            attendeeName: attendee.name,
                            email: attendee.email,
                            phone: attendee.phone || '',
                            status: attendee.status,
                            rsvpDate: attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : '',
                            notes: attendee.notes || ''
                        });
                    });
                }
            });

            if (allAttendees.length === 0) {
                alert('No attendees to export.');
                return;
            }

            const csvContent = [
                ['Event Name', 'Event Date', 'Attendee Name', 'Email', 'Phone', 'Status', 'RSVP Date', 'Notes'],
                ...allAttendees.map(attendee => [
                    attendee.eventName,
                    attendee.eventDate,
                    attendee.attendeeName,
                    attendee.email,
                    attendee.phone,
                    attendee.status,
                    attendee.rsvpDate,
                    attendee.notes
                ])
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

            downloadCSV(csvContent, 'all-attendees.csv');
        }

        // Export attendees for specific event
        function exportEventAttendees(eventId) {
            const event = allEvents.find(e => e.id === eventId);
            if (!event || !event.attendees || event.attendees.length === 0) {
                alert('No attendees to export for this event.');
                return;
            }

            const csvContent = [
                ['Name', 'Email', 'Phone', 'Status', 'RSVP Date', 'Notes'],
                ...event.attendees.map(attendee => [
                    attendee.name,
                    attendee.email,
                    attendee.phone || '',
                    attendee.status,
                    attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : '',
                    attendee.notes || ''
                ])
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

            downloadCSV(csvContent, `${event.name.replace(/[^a-zA-Z0-9]/g, '-')}-attendees.csv`);
        }

        // Download CSV file
        function downloadCSV(csvContent, filename) {
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        // Send event reminder
        function sendEventReminder(eventId) {
            const event = allEvents.find(e => e.id === eventId);
            if (!event) return;

            const confirmedAttendees = event.attendees ? event.attendees.filter(a => a.status === 'confirmed').length : 0;
            const pendingAttendees = event.attendees ? event.attendees.filter(a => a.status === 'pending').length : 0;

            if (confirmedAttendees === 0 && pendingAttendees === 0) {
                alert('No attendees to send reminders to for this event.');
                return;
            }

            // Simulate sending reminder
            alert(`Reminder sent successfully!\n\n` +
                  `Event: ${event.name}\n` +
                  `Confirmed attendees: ${confirmedAttendees}\n` +
                  `Pending attendees: ${pendingAttendees}\n\n` +
                  `Email reminders have been sent to all attendees.`);
        }

        // Edit attendee (placeholder function)
        function editAttendee(attendeeId, eventId) {
            const event = allEvents.find(e => e.id === eventId);
            if (!event) return;

            const attendee = event.attendees.find(a => a.id === attendeeId);
            if (!attendee) return;

            // Simple prompt-based editing (in a real app, this would be a modal)
            const newName = prompt('Edit attendee name:', attendee.name);
            const newEmail = prompt('Edit attendee email:', attendee.email);
            const newStatus = prompt('Edit attendee status (confirmed/pending/declined):', attendee.status);

            if (newName && newEmail && newStatus) {
                attendee.name = newName;
                attendee.email = newEmail;
                attendee.status = newStatus;

                // Save to localStorage
                try {
                    localStorage.setItem('savedEvents', JSON.stringify(allEvents));
                    updateEventsDisplay();
                    updateOverviewStats();
                    alert('Attendee updated successfully!');
                } catch (error) {
                    console.error('Error saving updated attendee:', error);
                    alert('Failed to update attendee.');
                }
            }
        }

        // Remove attendee
        function removeAttendee(attendeeId, eventId) {
            const event = allEvents.find(e => e.id === eventId);
            if (!event) return;

            const attendee = event.attendees.find(a => a.id === attendeeId);
            if (!attendee) return;

            if (confirm(`Are you sure you want to remove ${attendee.name} from this event?`)) {
                event.attendees = event.attendees.filter(a => a.id !== attendeeId);

                // Save to localStorage
                try {
                    localStorage.setItem('savedEvents', JSON.stringify(allEvents));
                    updateEventsDisplay();
                    updateOverviewStats();
                    alert('Attendee removed successfully!');
                } catch (error) {
                    console.error('Error removing attendee:', error);
                    alert('Failed to remove attendee.');
                }
            }
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

        // Add event listeners for keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('searchInput');
                if (searchInput.value) {
                    searchInput.value = '';
                    filterEvents();
                }
            }
        });

        // Auto-refresh data every 30 seconds to catch changes from other pages
        setInterval(() => {
            const currentEventsLength = allEvents.length;
            loadEvents();
            
            if (allEvents.length !== currentEventsLength) {
                console.log('Events data changed, refreshing display');
                updateOverviewStats();
                updateEventsDisplay();
            }
        }, 30000);

        // Listen for storage changes (when events are modified in other tabs)
        window.addEventListener('storage', function(e) {
            if (e.key === 'savedEvents') {
                console.log('Storage changed, updating attendees display');
                loadEvents();
                updateOverviewStats();
                updateEventsDisplay();
            }
        });

        // Smooth scroll to top when filtering
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Initialize tooltips and enhanced interactions
        function initializeEnhancements() {
            // Add loading states to export buttons
            const exportButtons = document.querySelectorAll('[onclick*="export"]');
            exportButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="animation: spin 1s linear infinite;"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg> Exporting...';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                });
            });
        }

        // Call initialization after DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeEnhancements, 1000);
        });

        // Performance optimization: Debounce search input
        let searchTimeout;
        function debounceSearch() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterEvents, 300);
        }

        // Update search input to use debounced search
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.removeAttribute('oninput');
                searchInput.addEventListener('input', debounceSearch);
            }
        });

        // Enhanced error handling
        window.addEventListener('error', function(e) {
            console.error('Attendees page error:', e);
            
            // Show user-friendly error message
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fee2e2;
                color: #991b1b;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid #fca5a5;
                z-index: 10000;
                max-width: 300px;
                font-size: 1rem;
            `;
            errorDiv.innerHTML = `
                <strong>Something went wrong</strong><br>
                Please refresh the page or try again later.
                <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer; margin-left: 1rem;">×</button>
            `;
            
            document.body.appendChild(errorDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.remove();
                }
            }, 5000);
        });

        // Add print functionality
        function printAttendeeList(eventId = null) {
            const printWindow = window.open('', '_blank');
            let content = '';
            
            if (eventId) {
                const event = allEvents.find(e => e.id === eventId);
                if (event && event.attendees) {
                    content = `
                        <h1>${event.name} - Attendees</h1>
                        <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                        <p>Venue: ${event.venue?.name || 'TBD'}</p>
                        <table border="1" style="border-collapse: collapse; width: 100%;">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>RSVP Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${event.attendees.map(attendee => `
                                    <tr>
                                        <td>${attendee.name}</td>
                                        <td>${attendee.email}</td>
                                        <td>${attendee.phone || ''}</td>
                                        <td>${attendee.status}</td>
                                        <td>${attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                }
            } else {
                // Print all attendees
                const allAttendees = [];
                allEvents.forEach(event => {
                    if (event.attendees) {
                        event.attendees.forEach(attendee => {
                            allAttendees.push({
                                ...attendee,
                                eventName: event.name,
                                eventDate: event.date
                            });
                        });
                    }
                });
                
                content = `
                    <h1>All Attendees Report</h1>
                    <p>Generated: ${new Date().toLocaleDateString()}</p>
                    <table border="1" style="border-collapse: collapse; width: 100%;">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allAttendees.map(attendee => `
                                <tr>
                                    <td>${attendee.eventName}</td>
                                    <td>${new Date(attendee.eventDate).toLocaleDateString()}</td>
                                    <td>${attendee.name}</td>
                                    <td>${attendee.email}</td>
                                    <td>${attendee.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Attendees Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                            th { background-color: #f5f5f5; font-weight: bold; }
                            h1 { color: #333; }
                        </style>
                    </head>
                    <body>
                        ${content}
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.print();
        }

        // Add context menu for advanced actions
        document.addEventListener('contextmenu', function(e) {
            const attendeeCard = e.target.closest('.attendee-card');
            if (attendeeCard) {
                e.preventDefault();
                
                // Create context menu
                const contextMenu = document.createElement('div');
                contextMenu.style.cssText = `
                    position: fixed;
                    top: ${e.clientY}px;
                    left: ${e.clientX}px;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    padding: 0.5rem 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    min-width: 150px;
                `;
                
                const attendeeId = attendeeCard.dataset.attendeeId;
                const eventCard = attendeeCard.closest('.expandable-event-card');
                const eventId = eventCard.dataset.eventId;
                
                contextMenu.innerHTML = `
                    <div style="padding: 0.5rem 1rem; cursor: pointer; font-size: 1rem;" onclick="editAttendee('${attendeeId}', ${eventId}); this.parentElement.remove();">Edit Attendee</div>
                    <div style="padding: 0.5rem 1rem; cursor: pointer; font-size: 1rem;" onclick="removeAttendee('${attendeeId}', ${eventId}); this.parentElement.remove();">Remove Attendee</div>
                    <div style="padding: 0.5rem 1rem; cursor: pointer; font-size: 1rem; border-top: 1px solid #e5e7eb; margin-top: 0.5rem; padding-top: 0.5rem;" onclick="this.parentElement.remove();">Cancel</div>
                `;
                
                document.body.appendChild(contextMenu);
                
                // Remove context menu when clicking elsewhere
                setTimeout(() => {
                    document.addEventListener('click', function removeMenu() {
                        contextMenu.remove();
                        document.removeEventListener('click', removeMenu);
                    });
                }, 100);
            }
        });

        // Console welcome message
        console.log(`
        🎉 Eventure Attendees Management Loaded!
        
        Features available:
        • Expandable event cards with attendee lists
        • Search and filter functionality
        • Export to CSV
        • Bulk actions (expand/collapse all)
        • Real-time statistics
        • Mobile responsive design
        
        Keyboard shortcuts:
        • Ctrl/Cmd + F: Focus search
        • Escape: Clear search
        `);
let allEvents = [];
        let availableEvents = [];
        let currentEvent = null;

        document.addEventListener('DOMContentLoaded', function() {
            loadAllEvents();
            setupEventListeners();
        });

        function loadAllEvents() {
            try {
                const savedEvents = localStorage.getItem('savedEvents');
                if (savedEvents) {
                    allEvents = JSON.parse(savedEvents);
                    availableEvents = allEvents.filter(event => 
                        event.status === 'planning' || event.status === 'active'
                    );
                } else {
                    allEvents = [];
                    availableEvents = [];
                }
                updateAvailableEventsDisplay();
            } catch (error) {
                console.error('Error loading events:', error);
                allEvents = [];
                availableEvents = [];
                updateAvailableEventsDisplay();
            }
        }

        function updateAvailableEventsDisplay() {
            const container = document.getElementById('availableEventsGrid');
            if (!container) return;
            
            if (availableEvents.length === 0) {
                container.innerHTML = `
                    <div class="no-events-available">
                        <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                        </svg>
                        <h3>No events available for RSVP</h3>
                        <p>There are currently no active or planning events.</p>
                        <button class="btn btn-primary" onclick="goBackToEvents()">View All Events</button>
                    </div>
                `;
                return;
            }
            
            const eventsHTML = availableEvents.map(event => createEventCard(event)).join('');
            container.innerHTML = eventsHTML;
        }

        function createEventCard(event) {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
            });
            const attendeeCount = (event.attendees && event.attendees.length) || 0;
            
            return `
                <div class="event-card" onclick="selectEventForRSVP(${event.id})">
                    <div class="event-card-header">
                        <h3 class="event-card-title">${event.name}</h3>
                        <div class="event-status status-${event.status}">${capitalizeFirst(event.status)}</div>
                    </div>
                    
                    <div class="event-card-details">
                        <div class="event-detail-row">
                            <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                            </svg>
                            <span>${formattedDate} at ${formatTime(event.time)}</span>
                        </div>
                        
                        <div class="event-detail-row">
                            <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                            </svg>
                            <span>${event.venue.name}</span>
                        </div>
                        
                        <div class="event-detail-row">
                            <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            <span>${attendeeCount} RSVP'd / ${event.attendeeCount} expected</span>
                        </div>
                        
                        ${event.description ? `
                        <div class="event-description">
                            <p>${event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="event-card-footer">
                        <button class="btn btn-primary btn-rsvp">
                            RSVP Now
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        function selectEventForRSVP(eventId) {
            const event = availableEvents.find(e => e.id === eventId);
            if (!event) return;
            
            currentEvent = event;
            if (!currentEvent.attendees) currentEvent.attendees = [];
            
            updateEventInfoCard();
            updateAttendeesDisplay();
            showEventSections();
            
            document.getElementById('rsvpFormSection').scrollIntoView({ 
                behavior: 'smooth', block: 'start' 
            });
        }

        function showEventSections() {
            document.getElementById('eventInfoSection').style.display = 'block';
            document.getElementById('rsvpFormSection').style.display = 'block';
            document.getElementById('attendeesSection').style.display = 'block';
        }

        function updateEventInfoCard() {
            const eventInfoCard = document.getElementById('eventInfoCard');
            if (!eventInfoCard || !currentEvent) return;
            
            const eventDate = new Date(currentEvent.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            
            eventInfoCard.innerHTML = `
                <div class="event-card-header">
                    <h2 class="event-card-title">${currentEvent.name}</h2>
                    <div class="event-status status-${currentEvent.status}">${capitalizeFirst(currentEvent.status)}</div>
                </div>
                <div class="event-card-details">
                    <div class="event-detail-row">
                        <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                        </svg>
                        <span><strong>Date:</strong> ${formattedDate} at ${formatTime(currentEvent.time)}</span>
                    </div>
                    <div class="event-detail-row">
                        <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                        </svg>
                        <span><strong>Venue:</strong> ${currentEvent.venue.name}</span>
                    </div>
                    <div class="event-detail-row">
                        <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                        <span><strong>Type:</strong> ${capitalizeFirst(currentEvent.type)}</span>
                    </div>
                    ${currentEvent.description ? `
                    <div class="event-detail-row">
                        <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                        </svg>
                        <span><strong>Description:</strong> ${currentEvent.description}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        function setupEventListeners() {
            const rsvpForm = document.getElementById('rsvpForm');
            if (rsvpForm) {
                rsvpForm.addEventListener('submit', handleRSVPSubmission);
            }
        }

        function handleRSVPSubmission(e) {
            e.preventDefault();
            
            if (!currentEvent) {
                alert('Please select an event first.');
                return;
            }
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const specialNotes = document.getElementById('specialNotes').value.trim();
            
            if (!firstName || !lastName || !email) {
                alert('Please fill in all required fields.');
                return;
            }
            
            const existingRSVP = currentEvent.attendees.find(attendee => 
                attendee.email.toLowerCase() === email.toLowerCase()
            );
            
            if (existingRSVP) {
                alert('This email has already RSVP\'d to this event.');
                return;
            }
            
            const newAttendee = {
                id: Date.now(),
                name: `${firstName} ${lastName}`,
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone || '',
                notes: specialNotes || '',
                status: 'confirmed',
                rsvpDate: new Date().toISOString()
            };
            
            currentEvent.attendees.push(newAttendee);
            saveEventUpdates();
            updateAttendeesDisplay();
            
            document.getElementById('rsvpForm').reset();
            alert(`Thank you ${firstName}! Your RSVP has been confirmed.`);
        }

        function saveEventUpdates() {
            try {
                const eventIndex = allEvents.findIndex(e => e.id === currentEvent.id);
                if (eventIndex !== -1) {
                    allEvents[eventIndex] = currentEvent;
                    localStorage.setItem('savedEvents', JSON.stringify(allEvents));
                }
            } catch (error) {
                console.error('Error saving event updates:', error);
                alert('Error saving RSVP. Please try again.');
            }
        }

        function updateAttendeesDisplay() {
            const attendeesContainer = document.getElementById('attendeesContainer');
            const rsvpCountElement = document.getElementById('rsvpCount');
            
            if (!currentEvent || !currentEvent.attendees) return;
            
            const attendees = currentEvent.attendees;
            const rsvpCount = attendees.length;
            
            if (rsvpCountElement) rsvpCountElement.textContent = rsvpCount;
            
            if (rsvpCount === 0) {
                attendeesContainer.innerHTML = `
                    <div class="no-attendees">
                        <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                        <h3>No RSVPs yet</h3>
                        <p>Be the first to RSVP to this event!</p>
                    </div>
                `;
            } else {
                const attendeesList = attendees.map(attendee => createAttendeeItem(attendee)).join('');
                attendeesContainer.innerHTML = `
                    <div class="attendees-list">
                        ${attendeesList}
                    </div>
                `;
            }
        }

        function createAttendeeItem(attendee) {
            const rsvpDate = new Date(attendee.rsvpDate);
            const formattedDate = rsvpDate.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });
            
            const fullName = attendee.name || 
                (attendee.firstName && attendee.lastName ? 
                    `${attendee.firstName} ${attendee.lastName}` : 'Unknown');
            
            const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
            
            return `
                <div class="attendee-item">
                    <div class="attendee-avatar">
                        <span class="avatar-initials">${initials}</span>
                    </div>
                    <div class="attendee-info">
                        <h4 class="attendee-name">${fullName}</h4>
                        <p class="attendee-email">${attendee.email}</p>
                        ${attendee.phone ? `<p class="attendee-phone">📞 ${attendee.phone}</p>` : ''}
                        ${attendee.notes ? `<p class="attendee-notes">💬 ${attendee.notes}</p>` : ''}
                    </div>
                    <div class="attendee-details">
                        <div class="attendee-status status-${attendee.status}">
                            ${capitalizeFirst(attendee.status)}
                        </div>
                        <div class="attendee-rsvp-date">RSVP'd ${formattedDate}</div>
                    </div>
                </div>
            `;
        }

        function goBackToEvents() {
            window.location.href = 'MainEvents.html';
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        }

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
                hour: 'numeric', minute: '2-digit', hour12: true 
            });
        }
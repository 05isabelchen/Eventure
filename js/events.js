 // Global variables
let allEvents = [];
let filteredEvents = [];
let editingEventId = null; 
let currentEventForAttendees = null;  // ADD THIS
let filteredAttendees = [];           // ADD THIS// Changed from currentEventId to be more explicit

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    loadEvents();
    setupEventListeners();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('eventDate');
    if (dateField) {
        dateField.value = today;
    }
    
    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.toTimeString().slice(0, 5);
    const timeField = document.getElementById('eventTime');
    if (timeField) {
        timeField.value = timeString;
    }

    // Add event listener to the submit button
    const submitBtn = document.getElementById('createEventSubmitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Submit button clicked');
            submitEventForm();
        });
        console.log('Submit button event listener added');
    } else {
        console.error('Submit button not found!');
    }
});



// Load events from localStorage
function loadEvents() {
    try {
        const savedEvents = localStorage.getItem('savedEvents');
        console.log('Loading events from localStorage...');
        
        if (savedEvents) {
            allEvents = JSON.parse(savedEvents);
            console.log('Loaded', allEvents.length, 'events from localStorage:', allEvents);
        } else {
            console.log('No saved events found, creating sample events');
            // Sample events for demonstration
            allEvents = [
    {
        id: 1,
        name: "Economics Professor Panel",
        type: "Professional",
        date: "2025-09-29",
        time: "19:00",
        status: "planning",
        attendeeCount: 100,
        venue: {
            name: "Dwinelle 155",
            location: "Berkeley, CA"
        },
        totalBudget: 200,
        description: "Panel discussion with economics professors",
        createdAt: "2025-08-01T10:00:00Z"
    },
    {
        id: 2,
        name: "Cornerstone Research Coffee Chats",
        type: "Professional",
        date: "2025-10-30",
        time: "12:30",
        status: "planning",
        attendeeCount: 20,
        venue: {
            name: "Online (Zoom)",
            location: "Virtual"
        },
        totalBudget: 100,
        description: "Informal coffee chat sessions with Cornerstone Research",
        createdAt: "2025-08-15T14:30:00Z"
    },
    {
        id: 3,
        name: "Welcome Night",
        type: "Social",
        date: "2025-09-01",
        time: "19:00",
        status: "planning",
        attendeeCount: 30,
        venue: {
            name: "The Standard",
            location: "Berkeley, CA"
        },
        totalBudget: 200,
        description: "Welcome event for new members",
        createdAt: "2025-07-15T16:00:00Z"
    },
    {
        id: 4,
        name: "Fall Retreat",
        type: "Social",
        date: "2025-10-01",
        time: "17:00",
        status: "planning",
        attendeeCount: 40,
        venue: {
            name: "Yosemite",
            location: "Yosemite National Park, CA"
        },
        totalBudget: 1000,
        description: "Annual fall retreat for team building and networking",
        createdAt: "2025-07-20T11:00:00Z"
    }
];
            saveEvents();
        }
        
        filteredEvents = [...allEvents];
        updateEventDisplay();
        updateStatistics();
        console.log('Events loaded and display updated');
        
    } catch (error) {
        console.error('Error loading events:', error);
        allEvents = [];
        filteredEvents = [];
        updateEventDisplay();
        updateStatistics();
        alert('Error loading events. Starting fresh.');
    }
}

// Save events to localStorage
function saveEvents() {
    try {
        const eventsString = JSON.stringify(allEvents);
        localStorage.setItem('savedEvents', eventsString);
        console.log('Saved events to localStorage:', allEvents.length, 'events');
    } catch (error) {
        console.error('Error saving events to localStorage:', error);
        alert('Failed to save events. Please try again.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Open create event modal (NEW EVENT)
function openCreateEventModal() {
    console.log('=== OPENING CREATE MODAL ===');
    
    // Reset to create mode
    editingEventId = null;
    
    // Reset form
    const form = document.getElementById('createEventForm');
    if (form) {
        form.reset();
    }
    
    // Set default values
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
    
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('eventTime').value = timeString;
    
    document.getElementById('attendeeCount').value = '50';
    document.getElementById('eventBudget').value = '5000';
    
    // Update UI for create mode
    document.getElementById('modalTitle').textContent = 'Create New Event';
    document.getElementById('createEventSubmitBtn').innerHTML = `
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="margin-right: 0.5rem;">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Create Event
    `;
    
    
    // Open modal
    const modal = document.getElementById('createEventModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on the event name field
    setTimeout(() => {
        document.getElementById('eventName').focus();
    }, 300);
    
    console.log('Create modal opened, editingEventId:', editingEventId);
}

// Close create event modal
function closeCreateEventModal() {
    const modal = document.getElementById('createEventModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset editing state
    editingEventId = null;
    
    console.log('Modal closed, reset editingEventId to null');
}

// Start editing an existing event
function startEditingEvent(eventId) {
    console.log('=== STARTING EDIT MODE ===');
    console.log('Event ID to edit:', eventId);
    
    const event = allEvents.find(e => e.id == eventId);
    if (!event) {
        console.error('Event not found for editing:', eventId);
        alert('Event not found!');
        return;
    }
    
    console.log('Found event to edit:', event);
    
    // Set editing mode
    editingEventId = eventId;
    
    // Populate form with event data
    document.getElementById('eventName').value = event.name || '';
    document.getElementById('eventVenue').value = event.venue?.name || '';
    document.getElementById('eventType').value = event.type || '';
    document.getElementById('eventDate').value = event.date || '';
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('attendeeCount').value = event.attendeeCount || 50;
    document.getElementById('eventBudget').value = event.totalBudget || 5000;
    document.getElementById('eventDescription').value = event.description || '';
    
    // Update UI for edit mode
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('createEventSubmitBtn').innerHTML = `
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="margin-right: 0.5rem;">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
        Update Event
    `;
    
    // Open modal
    const modal = document.getElementById('createEventModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('Edit mode activated, editingEventId set to:', editingEventId);
}

// COMPLETELY REWRITTEN SUBMIT FUNCTION
function submitEventForm() {
    console.log('=== SUBMIT FORM CALLED ===');
    console.log('editingEventId:', editingEventId);
    console.log('Is editing mode?', editingEventId !== null);
    
    // Get form values
    const eventName = document.getElementById('eventName').value.trim();
    const eventVenue = document.getElementById('eventVenue').value.trim();
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const attendeeCount = parseInt(document.getElementById('attendeeCount').value) || 50;
    const eventBudget = parseFloat(document.getElementById('eventBudget').value) || 5000;
    const eventDescription = document.getElementById('eventDescription').value.trim();
    
    // Validate required fields
    if (!eventName || !eventVenue || !eventType || !eventDate || !eventTime) {
        alert('Please fill in all required fields!');
        return;
    }
    
    console.log('Form validation passed');
    
    // Disable submit button
    const submitBtn = document.getElementById('createEventSubmitBtn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Saving...';
    submitBtn.disabled = true;
    
    try {
        if (editingEventId !== null) {
            // EDIT MODE - Update existing event
            console.log('=== EDIT MODE - UPDATING EXISTING EVENT ===');
            console.log('Looking for event with ID:', editingEventId);
            console.log('Current allEvents:', allEvents.map(e => ({id: e.id, name: e.name})));
            
            const eventIndex = allEvents.findIndex(e => e.id == editingEventId);
            console.log('Found event at index:', eventIndex);
            
            if (eventIndex === -1) {
                throw new Error(`Event with ID ${editingEventId} not found in allEvents array`);
            }
            
            // Get the original event
            const originalEvent = allEvents[eventIndex];
            console.log('Original event:', originalEvent);
            
            // Update the event (keep original ID and createdAt)
            const updatedEvent = {
                ...originalEvent,
                name: eventName,
                type: eventType,
                date: eventDate,
                time: eventTime,
                attendeeCount: attendeeCount,
                venue: {
                    name: eventVenue,
                    location: originalEvent.venue?.location || 'TBD'
                },
                totalBudget: eventBudget,
                description: eventDescription,
                updatedAt: new Date().toISOString()
            };
            
            console.log('Updated event:', updatedEvent);
            
            // Replace the event in the array
            allEvents[eventIndex] = updatedEvent;
            
            console.log('Event updated in array at index', eventIndex);
            console.log('Updated allEvents:', allEvents.map(e => ({id: e.id, name: e.name})));
            
            // Save to localStorage
            saveEvents();
            
            // Update display
            filteredEvents = [...allEvents];
            updateEventDisplay();
            updateStatistics();
            
            alert('Event updated successfully!');
            
        } else {
            // CREATE MODE - Add new event
            console.log('=== CREATE MODE - ADDING NEW EVENT ===');
            
            const newEvent = {
                id: Date.now(), // Generate unique ID based on timestamp
                name: eventName,
                type: eventType,
                date: eventDate,
                time: eventTime,
                status: 'planning',
                attendeeCount: attendeeCount,
                venue: {
                    name: eventVenue,
                    location: 'TBD'
                },
                totalBudget: eventBudget,
                description: eventDescription,
                createdAt: new Date().toISOString()
            };
            
            console.log('New event created:', newEvent);
            
            // Add to beginning of array
            allEvents.unshift(newEvent);
            
            console.log('Event added to array. Total events:', allEvents.length);
            
            // Save to localStorage
            saveEvents();
            
            // Update display
            filteredEvents = [...allEvents];
            updateEventDisplay();
            updateStatistics();
            
            alert('Event created successfully!');
        }
        
        // Close modal
        closeCreateEventModal();
        
    } catch (error) {
        console.error('Error saving event:', error);
        alert('Failed to save event: ' + error.message);
    } finally {
        // Re-enable submit button
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }
    
    console.log('=== SUBMIT COMPLETED ===');
}

// Open event details modal - FIXED VERSION
function openEventDetailsModal(eventId) {
    const event = allEvents.find(e => e.id == eventId);
    if (!event) return;
    
    console.log('Opening details modal for event:', event.name, 'ID:', eventId);
    
    // Update modal title
    const titleElement = document.getElementById('eventDetailsTitle');
    if (titleElement) {
        titleElement.textContent = event.name;
    }
    
    // Store the event ID in the edit button itself
    const editButton = document.getElementById('editEventBtn');
    if (editButton) {
        editButton.setAttribute('data-event-id', eventId);
        console.log('Stored event ID in edit button:', eventId);
    }
    
    // Create event details content
    const detailsContent = document.getElementById('eventDetailsContent');
    if (detailsContent) {
        detailsContent.innerHTML = `
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Event Type</div>
                    <div class="event-detail-value">${capitalizeFirst(event.type)}</div>
                </div>
            </div>
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Date & Time</div>
                    <div class="event-detail-value">${formatEventDate(event.date)} at ${formatTime(event.time)}</div>
                </div>
            </div>
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Venue</div>
                    <div class="event-detail-value">${event.venue.name}${event.venue.location !== 'TBD' ? ', ' + event.venue.location : ''}</div>
                </div>
            </div>
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Attendees</div>
                    <div class="event-detail-value">
                        <button onclick="showAttendeesForEvent(${event.id})" class="attendee-link-btn">
                            ${(event.attendees && event.attendees.length) || 0} RSVP'd / ${event.attendeeCount} expected
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="margin-left: 0.5rem;">
                                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Budget</div>
                    <div class="event-detail-value">${event.totalBudget.toLocaleString()}</div>
                </div>
            </div>
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Status</div>
                    <div class="event-detail-value">
                        <span class="event-status status-${event.status}">${capitalizeFirst(event.status)}</span>
                    </div>
                </div>
            </div>
            ${event.description ? `
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Description</div>
                    <div class="event-detail-value">${event.description}</div>
                </div>
            </div>
            ` : ''}
            <div class="event-detail-item">
                <svg class="event-detail-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <div class="event-detail-content">
                    <div class="event-detail-label">Created Date</div>
                    <div class="event-detail-value">${formatEventDate(event.createdAt.split('T')[0])}</div>
                </div>
            </div>
        `;
    }
    
    // Show modal
    const modal = document.getElementById('eventDetailsModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close event details modal
function closeEventDetailsModal() {
    const modal = document.getElementById('eventDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Clean up the stored event ID from the edit button
    const editButton = document.getElementById('editEventBtn');
    if (editButton) {
        editButton.removeAttribute('data-event-id');
    }
}

// Edit current event (called from event details modal) - FIXED VERSION
function editCurrentEvent() {
    console.log('=== Edit Current Event Called ===');
    
    // Get the event ID from the edit button's data attribute
    const editButton = document.getElementById('editEventBtn');
    const storedEventId = editButton ? editButton.getAttribute('data-event-id') : null;
    
    console.log('Stored event ID from edit button:', storedEventId);
    
    if (!storedEventId) {
        console.error('No event ID found in edit button data attribute');
        alert('Error: No event ID found. Please close the modal and try again.');
        return;
    }
    
    // Find the event by ID
    const event = allEvents.find(e => e.id == storedEventId);
    
    if (!event) {
        console.error('No event found with ID:', storedEventId);
        console.log('Available events:', allEvents.map(e => ({id: e.id, name: e.name})));
        alert('Event not found! Please close the modal and try again.');
        return;
    }
    
    console.log('Found event to edit:', event.name, 'ID:', event.id);
    
    // Close details modal first
    closeEventDetailsModal();
    
    // Start editing the event
    startEditingEvent(event.id);
}

// Quick edit event (called from event list)
function editEventQuick(eventId) {
    console.log('Quick edit clicked for event ID:', eventId);
    startEditingEvent(eventId);
}

// Close all modals
function closeAllModals() {
    closeCreateEventModal();
    closeEventDetailsModal();
    closeAttendeesModal();  // ADD THIS
}
// View event details (called when clicking on event)
function viewEventDetails(eventId) {
    openEventDetailsModal(eventId);
}

// Delete event
function deleteEvent(eventId) {
    const event = allEvents.find(e => e.id == eventId);
    if (!event) return;

    if (confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
        allEvents = allEvents.filter(e => e.id != eventId);
        saveEvents();
        
        // Update display immediately
        filteredEvents = [...allEvents];
        updateEventDisplay();
        updateStatistics();
        
        alert('Event deleted successfully');
    }
}

// Filter events
function filterEvents() {
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const searchInput = document.getElementById('searchInput');

    const statusValue = statusFilter ? statusFilter.value : '';
    const typeValue = typeFilter ? typeFilter.value : '';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    filteredEvents = allEvents.filter(event => {
        const statusMatch = !statusValue || event.status === statusValue;
        const typeMatch = !typeValue || event.type === typeValue;
        const searchMatch = !searchTerm || 
            event.name.toLowerCase().includes(searchTerm) ||
            event.venue.name.toLowerCase().includes(searchTerm) ||
            (event.description && event.description.toLowerCase().includes(searchTerm));
        
        return statusMatch && typeMatch && searchMatch;
    });

    updateEventDisplay();
}

// Sort events
function sortEvents() {
    const sortBy = document.getElementById('sortBy');
    const sortValue = sortBy ? sortBy.value : 'date';
    
    filteredEvents.sort((a, b) => {
        switch (sortValue) {
            case 'date':
                return new Date(a.date) - new Date(b.date);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'budget':
                return b.totalBudget - a.totalBudget;
            case 'attendees':
                return b.attendeeCount - a.attendeeCount;
            case 'created':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    updateEventDisplay();
}

// Update event display
function updateEventDisplay() {
    console.log('Updating event display with', filteredEvents.length, 'events');
    
    const container = document.getElementById('eventsContainer');
    const noEventsMessage = document.getElementById('noEventsMessage');
    
    if (!container) {
        console.error('Events container not found');
        return;
    }
    
    if (filteredEvents.length === 0) {
        if (noEventsMessage) {
            noEventsMessage.style.display = 'block';
            container.innerHTML = '';
            container.appendChild(noEventsMessage);
        }
        return;
    }

    if (noEventsMessage) {
        noEventsMessage.style.display = 'none';
    }
    
    container.innerHTML = `
        <div class="event-list">
            ${filteredEvents.map(event => createEventListItem(event)).join('')}
        </div>
    `;

    // Add event listeners to newly created elements
    filteredEvents.forEach(event => {
        const eventElement = document.querySelector(`[data-event-id="${event.id}"]`);
        if (eventElement) {
            eventElement.addEventListener('click', (e) => {
                // Don't open details if clicking on action buttons
                if (e.target.closest('.event-actions')) {
                    return;
                }
                viewEventDetails(event.id);
            });
        }
    });
    
    console.log('Event display updated successfully');
}

// Create event list item
function createEventListItem(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    return `
        <div class="event-item" data-event-id="${event.id}">
            <div class="event-info">
                <h4 class="event-name">${event.name}</h4>
                <p class="event-date">📅 ${formattedDate} • ${formatTime(event.time)}</p>
                <p style="font-size: 1rem; color: #9ca3af; margin-top: 0.25rem;">
                            📍 ${event.venue?.name || 'Venue TBD'} • 👥 ${event.attendeeCount || 0} attendees
                        </p>
                         ${event.description ? `<p style="font-size: 1rem; color: #9ca3af; margin-top: 0.25rem; opacity: 0.8;">${event.description.substring(0, 50)}...</p>` : ''}
            </div>
        

            <div class="event-budget">
                <div class="event-amount">${event.totalBudget.toLocaleString()}</div>
                <div class="event-status status-${event.status}">${capitalizeFirst(event.status)}</div>
                <div class="event-actions" onclick="event.stopPropagation()">
                    <button onclick="editEventQuick(${event.id})" class="btn-icon" title="Edit Event">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                    </button>
                    <button onclick="deleteEvent(${event.id})" class="btn-icon btn-danger" title="Delete Event">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update statistics
function updateStatistics() {
    const totalEvents = allEvents.length;
    const eventCountElement = document.getElementById('eventCount');
    if (eventCountElement) {
        eventCountElement.textContent = `${totalEvents} event${totalEvents !== 1 ? 's' : ''} total`;
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

function formatEventDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    if (!timeString) return 'No time';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Add CSS for additional functionality
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .event-item {
        cursor: pointer;
        user-select: none;
    }
    
    .event-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .event-item:hover .event-actions {
        opacity: 1;
    }
    
    .btn-icon {
        background: none;
        border: 1px solid #d1d5db;
        padding: 0.25rem;
        border-radius: 4px;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.3s ease;
    }
    
    .btn-icon:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
        color: #374151;
    }
    
    .btn-icon.btn-danger {
        color: #dc2626;
        border-color: #fecaca;
    }
    
    .btn-icon.btn-danger:hover {
        background: #fef2f2;
        border-color: #fca5a5;
        color: #b91c1c;
    }
    
    .attendee-link-btn {
        background: none;
        border: none;
        color: #3b82f6;
        text-decoration: underline;
        cursor: pointer;
        font-size: inherit;
        display: flex;
        align-items: center;
        padding: 0;
        transition: color 0.3s ease;
    }
    
    .attendee-link-btn:hover {
        color: #1d4ed8;
    }
    
    @media (max-width: 768px) {
        .event-actions {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Show attendees for a specific event
function showAttendeesForEvent(eventId) {
    if (!eventId) {
        const editButton = document.getElementById('editEventBtn');
        eventId = editButton ? editButton.getAttribute('data-event-id') : null;
    }
    
    if (!eventId) {
        alert('Error: No event selected. Please try again.');
        return;
    }
    
    const event = allEvents.find(e => e.id == eventId);
    if (!event) {
        alert('Event not found!');
        return;
    }
    
    currentEventForAttendees = event;
    
    const titleElement = document.getElementById('attendeesModalTitle');
    if (titleElement) {
        titleElement.textContent = `${event.name} - Attendees`;
    }
    
    if (!event.attendees) {
        event.attendees = [];
    }
    
    updateAttendeesModalDisplay();
    
    const modal = document.getElementById('attendeesModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Update attendees modal display
function updateAttendeesModalDisplay() {
    if (!currentEventForAttendees) return;
    
    const attendees = currentEventForAttendees.attendees || [];
    filteredAttendees = [...attendees];
    
    updateAttendeesStats();
    updateAttendeesListDisplay();
}

// Update attendees statistics
function updateAttendeesStats() {
    const attendees = filteredAttendees;
    const confirmedAttendees = attendees.filter(a => a.status === 'confirmed');
    const pendingAttendees = attendees.filter(a => a.status === 'pending');
    const declinedAttendees = attendees.filter(a => a.status === 'declined');
    
    const statsContainer = document.getElementById('attendeesStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${confirmedAttendees.length}</div>
                <div class="stat-label">Confirmed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${pendingAttendees.length}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${declinedAttendees.length}</div>
                <div class="stat-label">Declined</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${attendees.length}</div>
                <div class="stat-label">Total RSVPs</div>
            </div>
        `;
    }
}

// Update attendees list display
function updateAttendeesListDisplay() {
    const container = document.getElementById('attendeesContainer');
    if (!container) return;
    
    if (filteredAttendees.length === 0) {
        container.innerHTML = `
            <div class="no-attendees" style="text-align: center; padding: 3rem; color: #64748b;">
                <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20" style="margin-bottom: 1rem; opacity: 0.5;">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <h3 style="margin-bottom: 0.5rem; color: #374151;">No attendees yet</h3>
                <p>No one has RSVP'd to this event yet.</p>
            </div>
        `;
        return;
    }
    
    const attendeesList = filteredAttendees.map(attendee => createAttendeeCard(attendee)).join('');
    
    container.innerHTML = `
        <div class="attendees-grid">
            ${attendeesList}
        </div>
    `;
}

// Create attendee card HTML
function createAttendeeCard(attendee) {
    const initials = attendee.name ? 
        attendee.name.split(' ').map(n => n[0]).join('').toUpperCase() :
        (attendee.firstName && attendee.lastName ? 
            `${attendee.firstName[0]}${attendee.lastName[0]}`.toUpperCase() :
            'NA');
    
    const fullName = attendee.name || 
        (attendee.firstName && attendee.lastName ? 
            `${attendee.firstName} ${attendee.lastName}` : 
            'Unknown');
    
    const rsvpDate = attendee.rsvpDate ? 
        new Date(attendee.rsvpDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }) : 'N/A';
    
    return `
        <div class="attendee-card">
            <div class="attendee-header">
                <div class="attendee-avatar">
                    <span class="avatar-initials">${initials}</span>
                </div>
                <div class="attendee-basic-info">
                    <h4 class="attendee-name">${fullName}</h4>
                    <p class="attendee-email">${attendee.email}</p>
                </div>
                <div class="attendee-status-badge status-${attendee.status}">
                    ${capitalizeFirst(attendee.status)}
                </div>
            </div>
            
            <div class="attendee-details">
                ${attendee.phone ? `
                <div class="attendee-detail-row">
                    <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <span>${attendee.phone}</span>
                </div>
                ` : ''}
                
                ${attendee.notes ? `
                <div class="attendee-detail-row">
                    <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <span>${attendee.notes}</span>
                </div>
                ` : ''}
                
                <div class="attendee-detail-row">
                    <svg class="detail-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                    <span>RSVP'd ${rsvpDate}</span>
                </div>
            </div>
            
            <div class="attendee-actions">
                <button class="btn-icon btn-delete" onclick="removeAttendeeFromEvent('${attendee.id}')" title="Remove Attendee">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// Filter attendees
function filterAttendees() {
    if (!currentEventForAttendees || !currentEventForAttendees.attendees) return;
    
    const statusFilter = document.getElementById('attendeeStatusFilter').value;
    const searchTerm = document.getElementById('attendeeSearchInput').value.toLowerCase();
    
    filteredAttendees = currentEventForAttendees.attendees.filter(attendee => {
        const statusMatch = !statusFilter || attendee.status === statusFilter;
        
        const fullName = attendee.name || 
            (attendee.firstName && attendee.lastName ? 
                `${attendee.firstName} ${attendee.lastName}` : '');
        
        const searchMatch = !searchTerm || 
            fullName.toLowerCase().includes(searchTerm) ||
            attendee.email.toLowerCase().includes(searchTerm) ||
            (attendee.phone && attendee.phone.toLowerCase().includes(searchTerm));
        
        return statusMatch && searchMatch;
    });
    
    updateAttendeesStats();
    updateAttendeesListDisplay();
}

// Close attendees modal
function closeAttendeesModal() {
    const modal = document.getElementById('attendeesModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Reset filters
    const statusFilter = document.getElementById('attendeeStatusFilter');
    const searchInput = document.getElementById('attendeeSearchInput');
    
    if (statusFilter) statusFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    currentEventForAttendees = null;
}

// Remove attendee from event
function removeAttendeeFromEvent(attendeeId) {
    if (!currentEventForAttendees) return;
    
    const attendee = currentEventForAttendees.attendees.find(a => a.id == attendeeId);
    if (!attendee) return;
    
    const attendeeName = attendee.name || 
        (attendee.firstName && attendee.lastName ? 
            `${attendee.firstName} ${attendee.lastName}` : 
            attendee.email);
    
    if (confirm(`Are you sure you want to remove ${attendeeName} from this event?`)) {
        // Remove from current event
        currentEventForAttendees.attendees = currentEventForAttendees.attendees.filter(a => a.id != attendeeId);
        
        // Update the event in allEvents array
        const eventIndex = allEvents.findIndex(e => e.id === currentEventForAttendees.id);
        if (eventIndex !== -1) {
            allEvents[eventIndex] = currentEventForAttendees;
            saveEvents();
        }
        
        // Update displays
        updateAttendeesModalDisplay();
        updateEventDisplay();
        
        alert(`${attendeeName} has been removed from the event.`);
    }
}

// Export attendee list
function exportAttendeeList() {
    if (!currentEventForAttendees || !currentEventForAttendees.attendees || currentEventForAttendees.attendees.length === 0) {
        alert('No attendees to export.');
        return;
    }
    
    const csvContent = [
        ['Name', 'Email', 'Phone', 'Status', 'RSVP Date', 'Notes'],
        ...currentEventForAttendees.attendees.map(attendee => [
            attendee.name || (attendee.firstName && attendee.lastName ? `${attendee.firstName} ${attendee.lastName}` : ''),
            attendee.email,
            attendee.phone || '',
            attendee.status,
            attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : '',
            attendee.notes || ''
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentEventForAttendees.name}-attendees.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
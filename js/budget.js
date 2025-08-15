// Global variables
        let allEvents = [];
        let budgetSettings = {
            totalBudget: 8000,
            period: 'annual',
            emergencyReserve: 10,
            eventTypeBudgets: {
                corporate: 1000,
                Social: 2000,
                Professional: 2000,
                Outreach: 1000,
                other: 1000
            }
        };

        // Default budget suggestions by event type and attendee count
        const budgetSuggestions = {
            corporate: {
                base: 500,
                perAttendee: 75,
                description: "Corporate events typically include venue rental, networking, company engagement"
            },
            Social: {
                base: 200,
                perAttendee: 40,
                description: "Social events focus on entertainment, food, and venue rental"
            },
            Professional: {
                base: 500,
                perAttendee: 60,
                description: "Professional events include networking, speakers, and business materials"
            },
            Outreach: {
                base: 200,
                perAttendee: 25,
                description: "Outreach events prioritize community engagement and accessibility"
            },
            other: {
                base: 100,
                perAttendee: 30,
                description: "General events with flexible budget allocation"
            }
        };

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Budget page initializing...');
            loadBudgetSettings();
            loadEvents();
            updateBudgetDisplay();
            generateBudgetSuggestions();
            updateBudgetActivity();
        });

        // Load budget settings from localStorage
        function loadBudgetSettings() {
            try {
                const savedSettings = localStorage.getItem('budgetSettings');
                if (savedSettings) {
                    budgetSettings = { ...budgetSettings, ...JSON.parse(savedSettings) };
                    console.log('Loaded budget settings:', budgetSettings);
                }
            } catch (error) {
                console.error('Error loading budget settings:', error);
            }
        }

        // Save budget settings to localStorage
        function saveBudgetSettingsToStorage() {
            try {
                localStorage.setItem('budgetSettings', JSON.stringify(budgetSettings));
                console.log('Budget settings saved:', budgetSettings);
            } catch (error) {
                console.error('Error saving budget settings:', error);
            }
        }

        // Load events from localStorage
        function loadEvents() {
            try {
                const savedEvents = localStorage.getItem('savedEvents');
                if (savedEvents) {
                    allEvents = JSON.parse(savedEvents);
                    console.log('Loaded', allEvents.length, 'events for budget analysis');
                } else {
                    allEvents = [];
                }
            } catch (error) {
                console.error('Error loading events:', error);
                allEvents = [];
            }
        }

        // Update budget display
        function updateBudgetDisplay() {
            const totalBudget = budgetSettings.totalBudget;
            const allocatedBudget = allEvents.reduce((sum, event) => sum + (event.totalBudget || 0), 0);
            const remainingBudget = totalBudget - allocatedBudget;
            const emergencyReserveAmount = (totalBudget * budgetSettings.emergencyReserve) / 100;
            const usableBudget = totalBudget - emergencyReserveAmount;

            // Update main budget cards
            document.getElementById('totalAvailableBudget').textContent = `$${totalBudget.toLocaleString()}`;
            document.getElementById('allocatedBudget').textContent = `$${allocatedBudget.toLocaleString()}`;
            document.getElementById('remainingBudget').textContent = `$${remainingBudget.toLocaleString()}`;

            // Update progress bars
            const allocatedPercentage = totalBudget > 0 ? (allocatedBudget / totalBudget) * 100 : 0;
            const remainingPercentage = totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0;

            document.getElementById('totalBudgetProgress').style.width = `${Math.min(allocatedPercentage, 100)}%`;
            document.getElementById('allocatedProgress').style.width = `${Math.min(allocatedPercentage, 100)}%`;
            document.getElementById('remainingProgress').style.width = `${Math.min(remainingPercentage, 100)}%`;

            document.getElementById('totalBudgetProgressText').textContent = `${Math.round(allocatedPercentage)}% allocated`;
            document.getElementById('allocatedProgressText').textContent = `${Math.round(allocatedPercentage)}% of total budget`;
            document.getElementById('remainingProgressText').textContent = `${Math.round(remainingPercentage)}% remaining`;

            // Update budget warning colors
            if (allocatedPercentage > 90) {
                document.getElementById('totalBudgetProgress').style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            } else if (allocatedPercentage > 75) {
                document.getElementById('totalBudgetProgress').style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
            } else {
                document.getElementById('totalBudgetProgress').style.background = 'linear-gradient(90deg, #10b981, #059669)';
            }
            // Update budget subtitle to show allocated amount (like budget page)
    const totalBudgetCard = document.querySelector('.budget-card:first-child .budget-subtitle');
    if (totalBudgetCard) {
        totalBudgetCard.textContent = `$${allocatedBudget.toLocaleString()} allocated of $${totalBudget.toLocaleString()} total`;
    }

            updateEventTypeGrid();
        }

        // Update event type budget grid
        function updateEventTypeGrid() {
            const eventTypeStats = {};
            
            // Initialize event type stats
            Object.keys(budgetSettings.eventTypeBudgets).forEach(type => {
                eventTypeStats[type] = {
                    allocated: 0,
                    count: 0,
                    suggested: budgetSettings.eventTypeBudgets[type]
                };
            });

            // Calculate actual allocations
            allEvents.forEach(event => {
                const type = event.type || 'other';
                if (!eventTypeStats[type]) {
                    eventTypeStats[type] = { allocated: 0, count: 0, suggested: 3000 };
                }
                eventTypeStats[type].allocated += event.totalBudget || 0;
                eventTypeStats[type].count += 1;
            });

            const grid = document.getElementById('eventTypeGrid');
            grid.innerHTML = Object.entries(eventTypeStats).map(([type, stats]) => {
                const avgBudget = stats.count > 0 ? stats.allocated / stats.count : 0;
                const utilization = stats.suggested > 0 ? (avgBudget / stats.suggested) * 100 : 0;
                
                return `
                    <div class="event-type-card">
                        <div class="event-type-header">
                            <h4 class="event-type-title">${capitalizeFirst(type)} Events</h4>
                            <span class="event-count">${stats.count} events</span>
                        </div>
                        <div class="event-type-stats">
                            <div class="stat-row">
                                <span class="stat-label">Total Allocated:</span>
                                <span class="stat-value">$${stats.allocated.toLocaleString()}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Average per Event:</span>
                                <span class="stat-value">$${Math.round(avgBudget).toLocaleString()}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Suggested Budget:</span>
                                <span class="stat-value suggested">$${stats.suggested.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="utilization-bar">
                            <div class="utilization-fill" style="width: ${Math.min(utilization, 100)}%; background: ${utilization > 120 ? '#ef4444' : utilization > 100 ? '#f59e0b' : '#10b981'}"></div>
                        </div>
                        <div class="utilization-text">${Math.round(utilization)}% of suggested budget</div>
                        <button class="btn btn-outline btn-small" onclick="getSuggestionForEventType('${type}')">
                            Get Suggestion
                        </button>
                    </div>
                `;
            }).join('');
        }

        // Generate budget suggestions
        function generateBudgetSuggestions() {
            const suggestions = [];
            const totalBudget = budgetSettings.totalBudget;
            const allocatedBudget = allEvents.reduce((sum, event) => sum + (event.totalBudget || 0), 0);
            const remainingBudget = totalBudget - allocatedBudget;

            // Budget utilization suggestions
            const utilizationPercentage = totalBudget > 0 ? (allocatedBudget / totalBudget) * 100 : 0;
            
            if (utilizationPercentage > 90) {
                suggestions.push({
                    type: 'warning',
                    title: 'Budget Nearly Exhausted',
                    description: 'You\'ve allocated over 90% of your budget. Consider reviewing upcoming events or increasing your total budget.',
                    action: 'Review Budget',
                    actionFunction: 'openBudgetSettingsModal()'
                });
            } else if (utilizationPercentage < 30) {
                suggestions.push({
                    type: 'opportunity',
                    title: 'Budget Underutilized',
                    description: 'You have significant budget remaining. Consider planning additional events or increasing existing event budgets.',
                    action: 'Plan Events',
                    actionFunction: 'window.location.href = "Events.html"'
                });
            }

            // Event type balance suggestions
            const eventTypeCounts = {};
            allEvents.forEach(event => {
                const type = event.type || 'other';
                eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
            });

            const totalEvents = allEvents.length;
            if (totalEvents > 0) {
                const corporatePercentage = ((eventTypeCounts.corporate || 0) / totalEvents) * 100;
                const socialPercentage = ((eventTypeCounts.Social || 0) / totalEvents) * 100;
                
                if (corporatePercentage > 60) {
                    suggestions.push({
                        type: 'balance',
                        title: 'Consider More Event Variety',
                        description: 'Most of your events are corporate. Consider adding social or community outreach events for better engagement.',
                        action: 'Diversify Events',
                        actionFunction: 'showEventTypeSuggestion("Social")'
                    });
                }

                if (socialPercentage < 10 && totalEvents > 3) {
                    suggestions.push({
                        type: 'opportunity',
                        title: 'Add Social Events',
                        description: 'Social events can boost team morale and community engagement. Consider planning team building or celebration events.',
                        action: 'Plan Social Event',
                        actionFunction: 'showEventTypeSuggestion("Social")'
                    });
                }
            }

            // Seasonal suggestions
            const currentMonth = new Date().getMonth();
            if (currentMonth >= 10 || currentMonth <= 1) { // Nov, Dec, Jan
                suggestions.push({
                    type: 'seasonal',
                    title: 'Holiday Season Planning',
                    description: 'Consider planning holiday parties, year-end celebrations, or New Year networking events.',
                    action: 'Plan Holiday Event',
                    actionFunction: 'showSeasonalSuggestion("holiday")'
                });
            } else if (currentMonth >= 2 && currentMonth <= 4) { // Mar, Apr, May
                suggestions.push({
                    type: 'seasonal',
                    title: 'Spring Event Opportunities',
                    description: 'Spring is perfect for outdoor events, product launches, and team building activities.',
                    action: 'Plan Spring Event',
                    actionFunction: 'showSeasonalSuggestion("spring")'
                });
            }

            // Budget efficiency suggestions
            const avgEventBudget = totalEvents > 0 ? allocatedBudget / totalEvents : 0;
            if (avgEventBudget > 20000) {
                suggestions.push({
                    type: 'efficiency',
                    title: 'High Average Event Cost',
                    description: `Your average event budget is ${Math.round(avgEventBudget).toLocaleString()}. Consider optimizing costs or exploring more cost-effective venues.`,
                    action: 'Optimize Costs',
                    actionFunction: 'showCostOptimizationTips()'
                });
            }

            updateSuggestionsDisplay(suggestions);
        }

        // Update suggestions display
        function updateSuggestionsDisplay(suggestions) {
            const container = document.getElementById('suggestionsContainer');
            
            if (suggestions.length === 0) {
                container.innerHTML = `
                    <div class="no-suggestions">
                        <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20" style="margin-bottom: 1rem; opacity: 0.5; color: #10b981;">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <h3 style="color: #374151; margin-bottom: 0.5rem;">Budget on Track!</h3>
                        <p style="color: #6b7280;">Your budget allocation looks good. No immediate suggestions at this time.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="suggestions-grid">
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-card suggestion-${suggestion.type}">
                            <div class="suggestion-header">
                                <div class="suggestion-icon">
                                    ${getSuggestionIcon(suggestion.type)}
                                </div>
                                <h4 class="suggestion-title">${suggestion.title}</h4>
                            </div>
                            <p class="suggestion-description">${suggestion.description}</p>
                            <button class="btn btn-outline btn-small" onclick="${suggestion.actionFunction}">
                                ${suggestion.action}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Get suggestion icon based on type
        function getSuggestionIcon(type) {
            const icons = {
                warning: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
                opportunity: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>',
                balance: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/></svg>',
                seasonal: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>',
                efficiency: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>'
            };
            return icons[type] || icons.opportunity;
        }

        // Update budget activity
        function updateBudgetActivity() {
            const activities = [];
            
            // Add recent events as activities
            const recentEvents = allEvents
                .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                .slice(0, 10);

            recentEvents.forEach(event => {
                activities.push({
                    type: 'event_created',
                    title: `Event Created: ${event.name}`,
                    amount: event.totalBudget,
                    date: event.createdAt || event.date,
                    description: `Budget allocated for ${event.type} event`
                });
            });

            // Add budget setting changes
            const lastBudgetUpdate = localStorage.getItem('budgetLastUpdated');
            if (lastBudgetUpdate) {
                activities.push({
                    type: 'budget_updated',
                    title: 'Budget Settings Updated',
                    amount: budgetSettings.totalBudget,
                    date: lastBudgetUpdate,
                    description: 'Total budget configuration changed'
                });
            }

            // Sort by date
            activities.sort((a, b) => new Date(b.date) - new Date(a.date));

            const container = document.getElementById('budgetActivityList');
            
            if (activities.length === 0) {
                container.innerHTML = `
                    <div class="no-activity">
                        <p style="color: #6b7280; text-align: center; padding: 2rem;">No recent budget activity to display.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = activities.slice(0, 8).map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        ${getActivityIcon(activity.type)}
                    </div>
                    <div class="activity-content">
                        <h4 class="activity-title">${activity.title}</h4>
                        <p class="activity-description">${activity.description}</p>
                        <span class="activity-date">${formatActivityDate(activity.date)}</span>
                    </div>
                    <div class="activity-amount ${activity.type === 'event_created' ? 'spent' : 'neutral'}">
                        ${activity.amount ? `${activity.amount.toLocaleString()}` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Get activity icon
        function getActivityIcon(type) {
            const icons = {
                event_created: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>',
                budget_updated: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>'
            };
            return icons[type] || icons.event_created;
        }

        // Format activity date
        function formatActivityDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
            
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }

        // Open budget settings modal
        function openBudgetSettingsModal() {
            // Populate form with current settings
            document.getElementById('totalBudgetInput').value = budgetSettings.totalBudget;
            document.getElementById('budgetPeriod').value = budgetSettings.period;
            document.getElementById('emergencyReserve').value = budgetSettings.emergencyReserve;
            
            // Populate event type budgets
            document.getElementById('corporateBudget').value = budgetSettings.eventTypeBudgets.corporate;
            document.getElementById('socialBudget').value = budgetSettings.eventTypeBudgets.Social;
            document.getElementById('professionalBudget').value = budgetSettings.eventTypeBudgets.Professional;
            document.getElementById('outreachBudget').value = budgetSettings.eventTypeBudgets.Outreach;

            // Show modal
            const modal = document.getElementById('budgetSettingsModal');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Close budget settings modal
        function closeBudgetSettingsModal() {
            const modal = document.getElementById('budgetSettingsModal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Save budget settings
        function saveBudgetSettings() {
            try {
                // Get form values
                const totalBudget = parseFloat(document.getElementById('totalBudgetInput').value) || 0;
                const period = document.getElementById('budgetPeriod').value;
                const emergencyReserve = parseFloat(document.getElementById('emergencyReserve').value) || 10;
                
                const eventTypeBudgets = {
                    corporate: parseFloat(document.getElementById('corporateBudget').value) || 15000,
                    Social: parseFloat(document.getElementById('socialBudget').value) || 8000,
                    Professional: parseFloat(document.getElementById('professionalBudget').value) || 12000,
                    Outreach: parseFloat(document.getElementById('outreachBudget').value) || 5000,
                    other: 3000
                };

                // Validate
                if (totalBudget <= 0) {
                    alert('Please enter a valid total budget amount.');
                    return;
                }

                if (emergencyReserve < 0 || emergencyReserve > 50) {
                    alert('Emergency reserve should be between 0% and 50%.');
                    return;
                }

                // Update settings
                budgetSettings = {
                    totalBudget,
                    period,
                    emergencyReserve,
                    eventTypeBudgets
                };

                // Save to localStorage
                saveBudgetSettingsToStorage();
                localStorage.setItem('budgetLastUpdated', new Date().toISOString());

                // Update display
                updateBudgetDisplay();
                generateBudgetSuggestions();
                updateBudgetActivity();

                // Close modal
                closeBudgetSettingsModal();

                alert('Budget settings saved successfully!');

            } catch (error) {
                console.error('Error saving budget settings:', error);
                alert('Failed to save budget settings. Please try again.');
            }
        }

        // Get suggestion for specific event type
        function getSuggestionForEventType(eventType) {
            const suggestion = budgetSuggestions[eventType];
            if (!suggestion) return;

            const attendeeCount = prompt(`How many attendees do you expect for this ${eventType} event?`, '50');
            if (!attendeeCount) return;

            const suggestedBudget = suggestion.base + (parseInt(attendeeCount) * suggestion.perAttendee);
            
            alert(`Budget Suggestion for ${capitalizeFirst(eventType)} Event:\n\n` +
                  `Recommended Budget: ${suggestedBudget.toLocaleString()}\n` +
                  `Base Cost: ${suggestion.base.toLocaleString()}\n` +
                  `Per Attendee: ${suggestion.perAttendee}\n\n` +
                  `${suggestion.description}\n\n` +
                  `This includes typical costs for venue, catering, materials, and logistics.`);
        }

        // Show event type suggestion
        function showEventTypeSuggestion(eventType) {
            getSuggestionForEventType(eventType);
        }

        // Show seasonal suggestion
        function showSeasonalSuggestion(season) {
            const seasonalTips = {
                holiday: 'Holiday events typically cost 20-30% more due to premium pricing. Book venues early and consider alternative dates for better rates.',
                spring: 'Spring events can leverage outdoor venues for cost savings. Weather contingency plans are essential.'
            };
            
            alert(`Seasonal Planning Tip:\n\n${seasonalTips[season] || 'Plan ahead for the best rates and venue availability.'}`);
        }

        // Show cost optimization tips
        function showCostOptimizationTips() {
            alert(`Cost Optimization Tips:\n\n` +
                  `• Consider off-peak dates and times for better venue rates\n` +
                  `• Negotiate package deals with vendors\n` +
                  `• Use in-house catering or food trucks for casual events\n` +
                  `• Leverage technology for registration and check-in\n` +
                  `• Partner with other organizations for shared costs\n` +
                  `• Choose venues with included AV equipment\n` +
                  `• Plan events in advance for early bird discounts`);
        }

        // Refresh budget data
        function refreshBudgetData() {
            loadEvents();
            updateBudgetDisplay();
            generateBudgetSuggestions();
            updateBudgetActivity();
            
            // Show refresh indicator
            const button = event.target;
            const originalHTML = button.innerHTML;
            button.innerHTML = '<svg style="animation: spin 1s linear infinite;" width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg> Refreshing...';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 1000);
        }

        // Mobile sidebar toggle
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        }

        // Utility function
        function capitalizeFirst(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // Close modals when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                closeBudgetSettingsModal();
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeBudgetSettingsModal();
            }
        });
document.addEventListener('DOMContentLoaded', function() {
  // State management
  let currentUser = null;
  let itineraryData = null;
  let flightData = null;
  let accommodationData = null;
  let activityData = null;
  let currentSection = 'welcome';
  
  // UI Elements
  const authModal = document.getElementById('auth-modal');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginBtn = document.getElementById('login-btn');
  const userMenu = document.getElementById('user-menu');
  const logoutBtn = document.getElementById('logout-btn');
  const notification = document.getElementById('notification');
  
  const welcomeSection = document.getElementById('welcome-section');
  const preferencesSection = document.getElementById('preferences-section');
  const loadingSection = document.getElementById('loading-section');
  const resultsSection = document.getElementById('results-section');
  const savedTripsSection = document.getElementById('saved-trips-section');
  const userStatsSection = document.getElementById('user-stats-section');
  
  const preferencesForm = document.getElementById('preferences-form');
  const getStartedBtn = document.getElementById('get-started-btn');
  const editPreferencesBtn = document.getElementById('edit-preferences-btn');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const saveItineraryBtn = document.getElementById('save-itinerary-btn');
  
  // Tab elements
  const itineraryTab = document.getElementById('itinerary-tab');
  const flightsTab = document.getElementById('flights-tab');
  const accommodationsTab = document.getElementById('accommodations-tab');
  const activitiesTab = document.getElementById('activities-tab');
  
  const itineraryContent = document.getElementById('itinerary-content');
  const flightsContent = document.getElementById('flights-content');
  const accommodationsContent = document.getElementById('accommodations-content');
  const activitiesContent = document.getElementById('activities-content');

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  window.navigateToHome = function() {
    showAllSections();
    welcomeSection.classList.remove('hidden');
    currentSection = 'welcome';
    updateBreadcrumb(['Home']);
    updateNavigation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.navigateToPlanTrip = function() {
    if (!currentUser) {
      authModal.classList.remove('hidden');
      showNotification('Please log in to start planning your trip.', 'info');
      return;
    }
    
    showAllSections();
    preferencesSection.classList.remove('hidden');
    currentSection = 'preferences';
    updateBreadcrumb(['Home', 'Plan Trip']);
    updateNavigation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.navigateToSavedTrips = function() {
    if (!currentUser) {
      authModal.classList.remove('hidden');
      showNotification('Please log in to view your saved trips.', 'info');
      return;
    }
    showAllSections();
    savedTripsSection.classList.remove('hidden');
    currentSection = 'saved-trips';
    updateBreadcrumb(['Home', 'Saved Trips']);
    updateNavigation();
    loadSavedTrips();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.showUserStats = function() {
    if (!currentUser) {
      authModal.classList.remove('hidden');
      showNotification('Please log in to view your statistics.', 'info');
      return;
    }
    showAllSections();
    userStatsSection.classList.remove('hidden');
    currentSection = 'user-stats';
    updateBreadcrumb(['Home', 'Travel Statistics']);
    updateNavigation();
    loadUserStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.navigateToResults = function() {
    showAllSections();
    resultsSection.classList.remove('hidden');
    currentSection = 'results';
    updateBreadcrumb(['Home', 'Plan Trip', 'Your Itinerary']);
    updateNavigation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper functions
  window.closeDrawer = function() {
    document.getElementById('main-drawer').checked = false;
  };

  window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.toggleTheme = function() {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.checked = !themeToggle.checked;
    themeToggle.dispatchEvent(new Event('change'));
  };

  window.showHelp = function() {
    showNotification('Help & Support: Contact us at support@aitravelplanner.com', 'info');
  };

  // Update breadcrumb navigation
  function updateBreadcrumb(items) {
    const breadcrumbNav = document.getElementById('breadcrumb-nav');
    const breadcrumbList = document.getElementById('breadcrumb-list');
    
    if (items.length <= 1) {
      breadcrumbNav.classList.add('hidden');
      return;
    }
    
    breadcrumbNav.classList.remove('hidden');
    breadcrumbList.innerHTML = '';
    
    items.forEach((item, index) => {
      const li = document.createElement('li');
      if (index === items.length - 1) {
        li.innerHTML = `<span class="font-semibold text-primary">${item}</span>`;
      } else {
        li.innerHTML = `<a class="cursor-pointer hover:text-primary" onclick="navigateTo${item.replace(' ', '')}">${item}</a>`;
      }
      breadcrumbList.appendChild(li);
    });
  }

  // Update navigation state
  function updateNavigation() {
    // Update desktop navigation
    const navItems = document.querySelectorAll('.nav-button');
    navItems.forEach(item => item.classList.remove('nav-active'));
    
    // Update sidebar navigation
    const sidebarItems = document.querySelectorAll('.drawer-side .menu li a');
    sidebarItems.forEach(item => item.classList.remove('nav-active'));
    
    // Add active class based on current section
    if (currentSection === 'welcome') {
      // Home is active
    } else if (currentSection === 'preferences') {
      document.querySelector('.nav-button[onclick="navigateToPlanTrip()"]')?.classList.add('nav-active');
    } else if (currentSection === 'saved-trips') {
      document.querySelector('.nav-button[onclick="navigateToSavedTrips()"]')?.classList.add('nav-active');
    }
  }

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  function showNotification(message, type = 'info') {
    const notificationText = document.getElementById('notification-text');
    notificationText.textContent = message;
    
    const notificationElement = document.getElementById('notification');
    notificationElement.className = `notification alert ${type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info'}`;
    notificationElement.classList.remove('hidden');
    
    setTimeout(() => {
      notificationElement.classList.add('hidden');
    }, 5000);
  }

  function updateUIForUser(user) {
    currentUser = user;
    loginBtn.classList.add('hidden');
    userMenu.classList.remove('hidden');
    authModal.classList.add('hidden');
    
    // Show navigation items for logged-in users
    document.getElementById('nav-plan-trip').classList.remove('hidden');
    document.getElementById('nav-saved-trips').classList.remove('hidden');
    document.getElementById('sidebar-plan-trip').classList.remove('hidden');
    document.getElementById('sidebar-saved-trips').classList.remove('hidden');
    document.getElementById('sidebar-user-stats').classList.remove('hidden');
    
    // Show quick actions on home page
    document.getElementById('quick-actions').classList.remove('hidden');
    
    updateNavigation();
  }

  function updateUIForLogout() {
    currentUser = null;
    userMenu.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    
    // Hide navigation items for guests
    document.getElementById('nav-plan-trip').classList.add('hidden');
    document.getElementById('nav-saved-trips').classList.add('hidden');
    document.getElementById('sidebar-plan-trip').classList.add('hidden');
    document.getElementById('sidebar-saved-trips').classList.add('hidden');
    document.getElementById('sidebar-user-stats').classList.add('hidden');
    
    // Hide quick actions
    document.getElementById('quick-actions').classList.add('hidden');
    
    navigateToHome();
  }

  // Check if user is logged in on page load
  async function checkAuthStatus() {
    try {
      const result = await apiCall('/api/user');
      
      if (result.success && result.data.user) {
        updateUIForUser(result.data.user);
        console.log('✅ User authenticated:', result.data.user.username);
      } else {
        console.log('👤 No user session found');
      }
    } catch (error) {
      console.log('👤 User not logged in:', error.message);
    }
  }

  // Auth form handlers
  loginBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
  });

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('tab-active');
    registerTab.classList.remove('tab-active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });

  registerTab.addEventListener('click', () => {
    registerTab.classList.add('tab-active');
    loginTab.classList.remove('tab-active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Close modal when clicking outside
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.classList.add('hidden');
    }
  });

  // Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const result = await apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (result.success && result.data.success) {
        updateUIForUser(result.data.user);
        showNotification('Welcome back! You are now logged in.', 'success');
        loginForm.reset();
      } else {
        showNotification(result.data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('Login failed. Please try again.', 'error');
    }
  });

  // Register form submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('register-fullname').value;
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
      const result = await apiCall('/api/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, username, email, password })
      });
      
      if (result.success && result.data.success) {
        updateUIForUser(result.data.user);
        showNotification('Account created successfully! Welcome aboard!', 'success');
        registerForm.reset();
      } else {
        showNotification(result.data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showNotification('Registration failed. Please try again.', 'error');
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', async () => {
    try {
      await apiCall('/api/logout', {
        method: 'POST'
      });
      
      updateUIForLogout();
      showNotification('You have been logged out successfully.', 'success');
    } catch (error) {
      showNotification('Logout failed. Please try again.', 'error');
    }
  });

  // ============================================================================
  // SECTION MANAGEMENT
  // ============================================================================

  function showAllSections() {
    welcomeSection.classList.add('hidden');
    preferencesSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    savedTripsSection.classList.add('hidden');
    userStatsSection.classList.add('hidden');
  }

  // Navigation handlers
  getStartedBtn.addEventListener('click', () => {
    navigateToPlanTrip();
  });

  editPreferencesBtn.addEventListener('click', () => {
    navigateToPlanTrip();
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
  }

  // ============================================================================
  // TAB SWITCHING
  // ============================================================================

  function activateTab(tab, content) {
    [itineraryTab, flightsTab, accommodationsTab, activitiesTab].forEach(t => t.classList.remove('tab-active'));
    [itineraryContent, flightsContent, accommodationsContent, activitiesContent].forEach(c => c.classList.add('hidden'));
    
    tab.classList.add('tab-active');
    content.classList.remove('hidden');
  }

  itineraryTab.addEventListener('click', () => activateTab(itineraryTab, itineraryContent));
  
  flightsTab.addEventListener('click', () => {
    activateTab(flightsTab, flightsContent);
    if (!flightData) fetchFlightData();
  });
  
  accommodationsTab.addEventListener('click', () => {
    activateTab(accommodationsTab, accommodationsContent);
    if (!accommodationData) fetchAccommodationData();
  });
  
  activitiesTab.addEventListener('click', () => {
    activateTab(activitiesTab, activitiesContent);
    if (!activityData) fetchActivityData();
  });

  // ============================================================================
  // FORM SUBMISSION AND API CALLS
  // ============================================================================

  // Form submission
  preferencesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      authModal.classList.remove('hidden');
      showNotification('Please log in to generate an itinerary.', 'info');
      return;
    }
    
    const interestCheckboxes = document.querySelectorAll('.interest-checkbox:checked');
    const interests = Array.from(interestCheckboxes).map(checkbox => checkbox.value);
    if (interests.length === 0) {
      showNotification('Please select at least one interest.', 'error');
      return;
    }
    
    const userPreferences = {
      destination: document.getElementById('destination').value,
      origin: document.getElementById('origin').value,
      startDate: document.getElementById('start-date').value,
      endDate: document.getElementById('end-date').value,
      budget: document.getElementById('budget').value,
      travelers: document.getElementById('travelers').value,
      accommodationType: document.getElementById('accommodation-type').value,
      transportationType: document.getElementById('transportation-type').value,
      interests: interests
    };
    
    showAllSections();
    loadingSection.classList.remove('hidden');
    currentSection = 'loading';
    updateBreadcrumb(['Home', 'Plan Trip', 'Generating...']);
    
    try {
      await generateItinerary(userPreferences);
    } catch (error) {
      navigateToPlanTrip();
      showNotification('Failed to generate itinerary. Please try again.', 'error');
    }
  });

  // Save itinerary
  saveItineraryBtn.addEventListener('click', async () => {
    if (!itineraryData) {
      showNotification('No itinerary to save.', 'error');
      return;
    }
    
    try {
      const result = await apiCall('/api/save-itinerary', {
        method: 'POST',
        body: JSON.stringify({
          itinerary: itineraryData,
          title: `Trip to ${itineraryData.destination}`
        })
      });
      
      if (result.success && result.data.success) {
        showNotification('Itinerary saved successfully!', 'success');
      } else {
        throw new Error(result.data.message || 'Failed to save itinerary');
      }
    } catch (error) {
      showNotification('Failed to save itinerary. Please try again.', 'error');
    }
  });

  // Download PDF
  downloadPdfBtn.addEventListener('click', async () => {
    if (!itineraryData) {
      showNotification('No itinerary to download.', 'error');
      return;
    }
    
    try {
      downloadPdfBtn.disabled = true;
      downloadPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Generating PDF...';
      
      const result = await apiCall('/api/generate-pdf', {
        method: 'POST',
        body: JSON.stringify({ itinerary: itineraryData })
      });
      
      if (result.success && result.data instanceof Blob) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Travel-Itinerary-${itineraryData.destination.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('PDF downloaded successfully!', 'success');
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      showNotification('Failed to download PDF. Please try again.', 'error');
    } finally {
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.innerHTML = '<i class="fas fa-download mr-1"></i>Download PDF';
    }
  });

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  async function generateItinerary(preferences) {
    try {
      const result = await apiCall('/api/generate-itinerary', {
        method: 'POST',
        body: JSON.stringify(preferences)
      });
      
      if (result.success && result.data.success) {
        itineraryData = result.data;
        displayItinerary(result.data);
        
        navigateToResults();
        
        // Reset other data
        flightData = null;
        accommodationData = null;
        activityData = null;
        
        showNotification('Itinerary generated successfully!', 'success');
      } else {
        throw new Error(result.data.message || 'Failed to generate itinerary');
      }
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function fetchFlightData() {
    const container = document.getElementById('flights-container');
    container.innerHTML = '<div class="flex justify-center items-center py-8"><div class="loading-spinner"></div></div>';
    
    try {
      const result = await apiCall('/api/flights', {
        method: 'POST',
        body: JSON.stringify({
          origin: document.getElementById('origin').value,
          destination: document.getElementById('destination').value,
          date: document.getElementById('start-date').value
        })
      });
      
      if (result.success) {
        flightData = result.data;
        displayFlightData(result.data);
      } else {
        throw new Error('Failed to fetch flight data');
      }
    } catch (error) {
      container.innerHTML = '<div class="alert alert-error"><span>Failed to load flight data. Please try again later.</span></div>';
   }
 }

 async function fetchAccommodationData() {
   const container = document.getElementById('accommodations-container');
   container.innerHTML = '<div class="flex justify-center items-center py-8"><div class="loading-spinner"></div></div>';
   
   try {
     const result = await apiCall('/api/accommodations', {
       method: 'POST',
       body: JSON.stringify({
         destination: document.getElementById('destination').value,
         checkIn: document.getElementById('start-date').value,
         checkOut: document.getElementById('end-date').value,
         preferences: document.getElementById('accommodation-type').value
       })
     });
     
     if (result.success) {
       accommodationData = result.data;
       displayAccommodationData(result.data);
     } else {
       throw new Error('Failed to fetch accommodation data');
     }
   } catch (error) {
     container.innerHTML = '<div class="alert alert-error"><span>Failed to load accommodation data. Please try again later.</span></div>';
   }
 }

 async function fetchActivityData() {
   const container = document.getElementById('activities-container');
   container.innerHTML = '<div class="flex justify-center items-center py-8"><div class="loading-spinner"></div></div>';
   
   try {
     const interestCheckboxes = document.querySelectorAll('.interest-checkbox:checked');
     const interests = Array.from(interestCheckboxes).map(checkbox => checkbox.value);
     
     const result = await apiCall('/api/activities', {
       method: 'POST',
       body: JSON.stringify({
         destination: document.getElementById('destination').value,
         interests: interests
       })
     });
     
     if (result.success) {
       activityData = result.data;
       displayActivityData(result.data);
     } else {
       throw new Error('Failed to fetch activity data');
     }
   } catch (error) {
     container.innerHTML = '<div class="alert alert-error"><span>Failed to load activity data. Please try again later.</span></div>';
   }
 }

 // Load saved trips with search and filter
 async function loadSavedTrips() {
   const container = document.getElementById('saved-trips-container');
   container.innerHTML = '<div class="flex justify-center items-center py-8"><div class="loading-spinner"></div></div>';
   
   try {
     const searchTerm = document.getElementById('trip-search')?.value || '';
     const filterStatus = document.getElementById('trip-filter')?.value || '';
     
     let endpoint = '/api/saved-itineraries?';
     if (searchTerm) endpoint += `search=${encodeURIComponent(searchTerm)}&`;
     if (filterStatus) endpoint += `status=${filterStatus}&`;
     
     const result = await apiCall(endpoint);
     
     if (result.response && result.response.status === 401) {
       authModal.classList.remove('hidden');
       showNotification('Please log in to view your saved trips.', 'info');
       container.innerHTML = `
         <div class="col-span-full">
           <div class="alert alert-info">
             <span>Please log in to view your saved trips.</span>
           </div>
         </div>
       `;
       return;
     }
     
     if (result.success && result.data.success) {
       displaySavedTrips(result.data);
     } else {
       throw new Error(result.data.message || 'Failed to load saved trips');
     }
     
   } catch (error) {
     console.error('Error loading saved trips:', error);
     container.innerHTML = `
       <div class="col-span-full">
         <div class="alert alert-error">
           <span>Failed to load saved trips: ${error.message}</span>
           <button class="btn btn-sm btn-outline ml-4" onclick="loadSavedTrips()">
             <i class="fas fa-refresh mr-1"></i>
             Try Again
           </button>
         </div>
       </div>
     `;
     showNotification('Failed to load saved trips. Please try again.', 'error');
   }
 }

 // Make loadSavedTrips globally accessible
 window.loadSavedTrips = loadSavedTrips;

 // Load user statistics
 async function loadUserStats() {
   const container = document.getElementById('user-stats-container');
   container.innerHTML = '<div class="flex justify-center items-center py-8"><div class="loading-spinner"></div></div>';
   
   try {
     const result = await apiCall('/api/user/stats');
     
     if (result.success && result.data.success) {
       displayUserStats(result.data.stats);
     } else {
       throw new Error('Failed to load statistics');
     }
     
   } catch (error) {
     container.innerHTML = `
       <div class="alert alert-error">
         <span>Failed to load statistics: ${error.message}</span>
       </div>
     `;
   }
 }

 // ============================================================================
 // DISPLAY FUNCTIONS
 // ============================================================================

 function displayItinerary(data) {
   // Update overview
   document.getElementById('destination-value').textContent = data.destination;
   document.getElementById('duration-value').textContent = data.duration;
   document.getElementById('budget-value').textContent = data.totalEstimatedCost;
   
   if (data.itinerary && data.itinerary.length > 0) {
     const startDate = new Date(data.itinerary[0].date);
     const endDate = new Date(data.itinerary[data.itinerary.length - 1].date);
     document.getElementById('dates-value').textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
   }
   
   // Generate day buttons
   const dayButtonsContainer = document.getElementById('day-buttons');
   dayButtonsContainer.innerHTML = '';
   
   if (data.itinerary) {
     data.itinerary.forEach((day, index) => {
       const button = document.createElement('button');
       button.classList.add('btn', 'btn-outline', 'btn-sm', 'card-hover');
       button.textContent = `Day ${day.day}`;
       button.addEventListener('click', () => {
         document.querySelectorAll('.day-content').forEach(content => content.classList.add('hidden'));
         document.getElementById(`day-${day.day}`).classList.remove('hidden');
         document.querySelectorAll('#day-buttons .btn').forEach(btn => btn.classList.remove('btn-active'));
         button.classList.add('btn-active');
       });
       
       if (index === 0) button.classList.add('btn-active');
       dayButtonsContainer.appendChild(button);
     });
   }
   
   // Generate itinerary days
   const itineraryDaysContainer = document.getElementById('itinerary-days');
   itineraryDaysContainer.innerHTML = '';
   
   if (data.itinerary) {
     data.itinerary.forEach((day, index) => {
       const dayElement = document.createElement('div');
       dayElement.id = `day-${day.day}`;
       dayElement.classList.add('day-content');
       if (index !== 0) dayElement.classList.add('hidden');
       
       // Day header
       const dayHeader = document.createElement('div');
       dayHeader.classList.add('card', 'bg-gradient-to-r', 'from-primary', 'to-secondary', 'text-primary-content', 'shadow-xl', 'mb-6', 'card-hover');
       dayHeader.innerHTML = `
         <div class="card-body">
           <h3 class="card-title text-2xl">
             <i class="fas fa-calendar-day mr-2"></i>
             Day ${day.day}: ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </h3>
         </div>
       `;
       dayElement.appendChild(dayHeader);
       
       // Activities timeline
       const timelineDiv = document.createElement('div');
       timelineDiv.classList.add('itinerary-day');
       
       // Group activities by time
       if (day.activities) {
         const timeGroups = {
           morning: day.activities.filter(a => a.time && a.time.toLowerCase().includes('morning')),
           afternoon: day.activities.filter(a => a.time && a.time.toLowerCase().includes('afternoon')),
           evening: day.activities.filter(a => a.time && a.time.toLowerCase().includes('evening'))
         };
         
         // Morning
         if (timeGroups.morning.length > 0) {
           const morningSection = createTimeSection('Morning', timeGroups.morning, 'fas fa-sun text-yellow-500');
           timelineDiv.appendChild(morningSection);
         }
         
         // Breakfast
         const breakfast = day.meals?.find(meal => meal.type && meal.type.toLowerCase().includes('breakfast'));
         if (breakfast) {
           timelineDiv.appendChild(createMealCard(breakfast, 'fas fa-coffee'));
         }
         
         // Afternoon
         if (timeGroups.afternoon.length > 0) {
           const afternoonSection = createTimeSection('Afternoon', timeGroups.afternoon, 'fas fa-sun text-orange-500');
           timelineDiv.appendChild(afternoonSection);
         }
         
         // Lunch
         const lunch = day.meals?.find(meal => meal.type && meal.type.toLowerCase().includes('lunch'));
         if (lunch) {
           timelineDiv.appendChild(createMealCard(lunch, 'fas fa-utensils'));
         }
         
         // Evening
         if (timeGroups.evening.length > 0) {
           const eveningSection = createTimeSection('Evening', timeGroups.evening, 'fas fa-moon text-purple-500');
           timelineDiv.appendChild(eveningSection);
         }
         
         // Dinner
         const dinner = day.meals?.find(meal => meal.type && meal.type.toLowerCase().includes('dinner'));
         if (dinner) {
           timelineDiv.appendChild(createMealCard(dinner, 'fas fa-wine-glass'));
         }
       }
       
       // Accommodation
       if (day.accommodation) {
         const accommodationCard = createAccommodationCard(day.accommodation);
         timelineDiv.appendChild(accommodationCard);
       }
       
       dayElement.appendChild(timelineDiv);
       itineraryDaysContainer.appendChild(dayElement);
     });
   }
   
   // Add tips
   const tipsList = document.getElementById('tips-list');
   tipsList.innerHTML = '';
   
   if (data.additionalTips && data.additionalTips.length > 0) {
     data.additionalTips.forEach((tip, index) => {
       const tipItem = document.createElement('li');
       tipItem.classList.add('flex', 'items-start', 'space-x-3', 'p-3', 'bg-base-200', 'rounded-box', 'mb-3', 'card-hover');
       tipItem.innerHTML = `
         <div class="flex-shrink-0">
           <div class="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold text-sm">
             ${index + 1}
           </div>
         </div>
         <div class="flex-1">
           <p class="text-sm">${tip}</p>
         </div>
       `;
       tipsList.appendChild(tipItem);
     });
   }
 }

 function createTimeSection(timeLabel, activities, iconClass) {
   const section = document.createElement('div');
   section.classList.add('time-block');
   
   const header = document.createElement('h4');
   header.classList.add('text-xl', 'font-semibold', 'mb-4', 'flex', 'items-center');
   header.innerHTML = `<i class="${iconClass} mr-2"></i>${timeLabel}`;
   section.appendChild(header);
   
   activities.forEach(activity => {
     const activityCard = createActivityCard(activity);
     section.appendChild(activityCard);
   });
   
   return section;
 }

 function createActivityCard(activity) {
   const card = document.createElement('div');
   card.classList.add('card', 'bg-base-100', 'shadow-md', 'mb-4', 'card-hover');
   
   card.innerHTML = `
     <div class="card-body p-4">
       <div class="flex justify-between items-start mb-2">
         <h5 class="card-title text-lg">${activity.activity || 'Activity'}</h5>
         <div class="badge badge-primary">${activity.estimatedCost || 'TBD'}</div>
       </div>
       <p class="text-sm text-gray-600 mb-2">
         <i class="fas fa-map-marker-alt mr-1"></i>
         ${activity.location || 'Location TBD'}
       </p>
       <p class="text-sm mb-3">${activity.description || 'No description available'}</p>
       ${activity.travelTime ? `
         <div class="flex items-center text-xs text-gray-500">
           <i class="fas fa-clock mr-1"></i>
           Travel time: ${activity.travelTime}
         </div>
       ` : ''}
     </div>
   `;
   
   return card;
 }

 function createMealCard(meal, iconClass) {
   const card = document.createElement('div');
   card.classList.add('card', 'bg-gradient-to-r', 'from-orange-100', 'to-red-100', 'shadow-md', 'mb-4', 'ml-6', 'card-hover');
   
   card.innerHTML = `
     <div class="card-body p-4">
       <div class="flex items-center justify-between mb-2">
         <h5 class="card-title text-lg flex items-center">
           <i class="${iconClass} mr-2 text-orange-600"></i>
           ${meal.type || 'Meal'}
         </h5>
         <div class="badge badge-secondary">${meal.estimatedCost || 'TBD'}</div>
       </div>
       <p class="font-semibold">${meal.recommendation || 'Restaurant TBD'}</p>
       <p class="text-sm text-gray-600">${meal.cuisine || 'Cuisine'} • ${meal.location || 'Location TBD'}</p>
     </div>
   `;
   
   return card;
 }

 function createAccommodationCard(accommodation) {
   const card = document.createElement('div');
   card.classList.add('card', 'bg-gradient-to-r', 'from-blue-100', 'to-purple-100', 'shadow-md', 'mt-6', 'card-hover');
   
   card.innerHTML = `
     <div class="card-body p-4">
       <h5 class="card-title text-lg flex items-center">
         <i class="fas fa-bed mr-2 text-blue-600"></i>
         Tonight's Stay: ${accommodation.name || 'Hotel TBD'}
       </h5>
       <p class="text-sm text-gray-600">${accommodation.type || 'Hotel'} • ${accommodation.location || 'Location TBD'}</p>
       <div class="badge badge-info mt-2">${accommodation.estimatedCost || 'TBD'}</div>
     </div>
   `;
   
   return card;
 }

 function displayFlightData(flights) {
   const container = document.getElementById('flights-container');
   container.innerHTML = '';
   
   if (!flights || flights.length === 0) {
     container.innerHTML = '<div class="alert alert-info"><span>No flight options available at the moment.</span></div>';
     return;
   }
   
   flights.forEach(flight => {
     const flightCard = document.createElement('div');
     flightCard.classList.add('card', 'bg-base-100', 'shadow-lg', 'card-hover');
     
     flightCard.innerHTML = `
       <div class="card-body p-6">
         <div class="flex justify-between items-center mb-4">
           <div class="flex items-center">
             <i class="fas fa-plane text-primary text-2xl mr-3"></i>
             <div>
               <h3 class="font-bold text-lg">${flight.airline || 'Airline'}</h3>
               <p class="text-sm text-gray-500">${flight.flightNumber || 'Flight Number'}</p>
             </div>
           </div>
           <div class="text-right">
             <div class="text-2xl font-bold text-primary">${flight.price || 'Price TBD'}</div>
             <div class="text-sm text-gray-500">${flight.stops === 0 ? 'Non-stop' : (flight.stops || 0) + ' stop(s)'}</div>
           </div>
         </div>
         
         <div class="grid grid-cols-3 gap-4 mb-4">
           <div class="text-center">
             <div class="text-lg font-bold">${flight.departureTime || 'TBD'}</div>
             <div class="text-sm text-gray-500">${flight.departureAirport || 'Origin'}</div>
           </div>
           <div class="text-center">
             <i class="fas fa-arrow-right text-primary"></i>
             <div class="text-sm text-gray-500 mt-1">${flight.duration || 'TBD'}</div>
           </div>
           <div class="text-center">
             <div class="text-lg font-bold">${flight.arrivalTime || 'TBD'}</div>
             <div class="text-sm text-gray-500">${flight.arrivalAirport || 'Destination'}</div>
           </div>
         </div>
         
         <div class="card-actions justify-end">
           <button class="btn btn-outline btn-sm">View Details</button>
           <button class="btn btn-primary btn-sm">Book Now</button>
         </div>
       </div>
     `;
     
     container.appendChild(flightCard);
   });
 }

 function displayAccommodationData(accommodations) {
   const container = document.getElementById('accommodations-container');
   container.innerHTML = '';
   
   if (!accommodations || accommodations.length === 0) {
     container.innerHTML = '<div class="alert alert-info"><span>No accommodation options available at the moment.</span></div>';
     return;
   }
   
   accommodations.forEach(accommodation => {
     const accommodationCard = document.createElement('div');
     accommodationCard.classList.add('card', 'bg-base-100', 'shadow-lg', 'card-hover');
     
     // Generate star rating
     const rating = parseFloat(accommodation.rating || 4.0);
     const fullStars = Math.floor(rating);
     const hasHalfStar = rating % 1 >= 0.5;
     let starsHtml = '';
     
     for (let i = 0; i < fullStars; i++) {
       starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
     }
     if (hasHalfStar) {
       starsHtml += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
     }
     
     accommodationCard.innerHTML = `
       <div class="card-body p-6">
         <h3 class="card-title text-xl mb-2">${accommodation.name || 'Hotel Name'}</h3>
         <div class="flex items-center mb-2">
           <span class="badge badge-outline mr-2">${accommodation.type || 'Hotel'}</span>
           <div class="flex items-center">
             ${starsHtml}
             <span class="ml-2 text-sm text-gray-500">${accommodation.rating || '4.0'}</span>
           </div>
         </div>
         <p class="text-sm text-gray-600 mb-3">
           <i class="fas fa-map-marker-alt mr-1"></i>
           ${accommodation.location || 'Location TBD'}
         </p>
         <p class="text-sm mb-4">${accommodation.description || 'No description available'}</p>
         
         <div class="mb-4">
           <p class="font-semibold mb-2">Amenities:</p>
           <div class="flex flex-wrap gap-1">
             ${(accommodation.amenities || ['WiFi', 'AC']).map(amenity => `<span class="badge badge-sm">${amenity}</span>`).join('')}
           </div>
         </div>
         
         <div class="flex justify-between items-center">
           <div>
             <div class="text-xl font-bold text-primary">${accommodation.pricePerNight || 'Price TBD'}</div>
             <div class="text-sm text-gray-500">per night</div>
           </div>
           <div class="text-right">
             <div class="text-lg font-semibold">${accommodation.totalPrice || 'Total TBD'}</div>
             <div class="text-sm text-gray-500">total</div>
           </div>
         </div>
         
         <div class="card-actions justify-end mt-4">
           <button class="btn btn-outline btn-sm">View Details</button>
           <button class="btn btn-primary btn-sm">Book Now</button>
         </div>
       </div>
     `;
     
     container.appendChild(accommodationCard);
   });
 }

 function displayActivityData(activities) {
   const container = document.getElementById('activities-container');
   container.innerHTML = '';
   
   if (!activities || activities.length === 0) {
     container.innerHTML = '<div class="alert alert-info"><span>No activity recommendations available at the moment.</span></div>';
     return;
   }
   
   activities.forEach(activity => {
     const activityCard = document.createElement('div');
     activityCard.classList.add('card', 'bg-base-100', 'shadow-lg', 'card-hover');
     
     activityCard.innerHTML = `
       <div class="card-body p-6">
         <div class="flex justify-between items-start mb-3">
           <h3 class="card-title text-xl">${activity.name || 'Activity'}</h3>
           <span class="badge badge-primary">${activity.category || 'General'}</span>
         </div>
         
         <p class="text-sm text-gray-600 mb-2">
           <i class="fas fa-map-marker-alt mr-1"></i>
           ${activity.location || 'Location TBD'}
         </p>
         
         <p class="text-sm mb-4">${activity.description || 'No description available'}</p>
         
         <div class="grid grid-cols-3 gap-4 mb-4 text-center">
           <div>
             <div class="text-lg font-bold text-primary">${activity.estimatedCost || 'TBD'}</div>
             <div class="text-xs text-gray-500">Cost</div>
           </div>
           <div>
             <div class="text-lg font-bold text-secondary">${activity.duration || 'TBD'}</div>
             <div class="text-xs text-gray-500">Duration</div>
           </div>
           <div>
             <div class="text-lg font-bold text-accent">${activity.bestTimeToVisit || 'Anytime'}</div>
             <div class="text-xs text-gray-500">Best Time</div>
           </div>
         </div>
         
         <div class="card-actions justify-end">
           <button class="btn btn-outline btn-sm">Learn More</button>
           <button class="btn btn-primary btn-sm">Add to Plan</button>
         </div>
       </div>
     `;
     
     container.appendChild(activityCard);
   });
 }

 function displaySavedTrips(data) {
   const container = document.getElementById('saved-trips-container');
   container.innerHTML = '';
   
   const trips = data.itineraries || data.trips || data || [];
   
   if (!Array.isArray(trips) || trips.length === 0) {
     container.innerHTML = `
       <div class="col-span-full">
         <div class="card bg-base-100 shadow-lg">
           <div class="card-body text-center py-12">
             <i class="fas fa-suitcase text-6xl text-gray-300 mb-4"></i>
             <h3 class="text-2xl font-bold mb-2">No Saved Trips Yet</h3>
             <p class="text-gray-500 mb-6">Start planning your first adventure and save it here!</p>
             <button class="btn btn-primary" onclick="navigateToPlanTrip()">
               <i class="fas fa-plus mr-2"></i>
               Plan New Trip
             </button>
           </div>
         </div>
       </div>
     `;
     return;
   }
   
   trips.forEach(trip => {
     const tripCard = document.createElement('div');
     tripCard.classList.add('card', 'bg-base-100', 'shadow-lg', 'card-hover');
     
     const createdDate = new Date(trip.createdAt).toLocaleDateString();
     const destination = trip.destination || trip.itinerary?.destination || 'Unknown Destination';
     const duration = trip.duration || trip.itinerary?.duration || 'Unknown Duration';
     
     tripCard.innerHTML = `
       <div class="card-body p-6">
         <h3 class="card-title text-xl mb-2">${trip.title || `Trip to ${destination}`}</h3>
         <p class="text-sm text-gray-600 mb-3">
           <i class="fas fa-map-marker-alt mr-1"></i>
           ${destination}
         </p>
         <p class="text-sm text-gray-600 mb-3">
           <i class="fas fa-calendar mr-1"></i>
           ${duration}
         </p>
         <p class="text-sm text-gray-600 mb-4">
           <i class="fas fa-clock mr-1"></i>
           Saved on ${createdDate}
         </p>
         
         <div class="card-actions justify-end">
           <button class="btn btn-outline btn-sm" onclick="viewSavedTrip('${trip._id}')">
             <i class="fas fa-eye mr-1"></i>
             View
           </button>
           <button class="btn btn-primary btn-sm" onclick="downloadSavedTrip('${trip._id}')">
             <i class="fas fa-download mr-1"></i>
             Download
           </button>
           <button class="btn btn-error btn-sm" onclick="deleteSavedTrip('${trip._id}')">
             <i class="fas fa-trash mr-1"></i>
             Delete
           </button>
         </div>
       </div>
     `;
     
     container.appendChild(tripCard);
   });
 }

 function displayUserStats(stats) {
   const container = document.getElementById('user-stats-container');
   
   container.innerHTML = `
     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
       <div class="stat bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-box shadow-lg">
         <div class="stat-figure text-white opacity-80">
           <i class="fas fa-map text-2xl"></i>
         </div>
         <div class="stat-title text-blue-100">Total Trips</div>
         <div class="stat-value">${stats.totalTrips || 0}</div>
         <div class="stat-desc text-blue-100">Planned adventures</div>
       </div>
       
       <div class="stat bg-gradient-to-br from-green-500 to-green-600 text-white rounded-box shadow-lg">
         <div class="stat-figure text-white opacity-80">
           <i class="fas fa-download text-2xl"></i>
         </div>
         <div class="stat-title text-green-100">Downloads</div>
         <div class="stat-value">${stats.totalDownloads || 0}</div>
         <div class="stat-desc text-green-100">PDF itineraries</div>
       </div>
       
       <div class="stat bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-box shadow-lg">
         <div class="stat-figure text-white opacity-80">
           <i class="fas fa-calendar text-2xl"></i>
         </div>
         <div class="stat-title text-purple-100">Member Since</div>
         <div class="stat-value text-lg">${stats.memberSince ? new Date(stats.memberSince).toLocaleDateString() : 'Recently'}</div>
         <div class="stat-desc text-purple-100">Join date</div>
       </div>
       
       <div class="stat bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-box shadow-lg">
         <div class="stat-figure text-white opacity-80">
           <i class="fas fa-clock text-2xl"></i>
         </div>
         <div class="stat-title text-orange-100">Last Login</div>
         <div class="stat-value text-lg">${stats.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : 'Today'}</div>
         <div class="stat-desc text-orange-100">Recent activity</div>
       </div>
     </div>
     
     <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div class="card bg-base-100 shadow-lg">
         <div class="card-body">
           <h3 class="card-title text-xl mb-4">
             <i class="fas fa-chart-pie mr-2 text-primary"></i>
             Travel Insights
           </h3>
           <div class="space-y-4">
             <div class="flex justify-between items-center p-3 bg-base-200 rounded-box">
               <span class="font-medium">Favorite Planning Time</span>
               <span class="badge badge-primary">Evening</span>
             </div>
             <div class="flex justify-between items-center p-3 bg-base-200 rounded-box">
               <span class="font-medium">Average Trip Duration</span>
               <span class="badge badge-secondary">3-5 days</span>
             </div>
             <div class="flex justify-between items-center p-3 bg-base-200 rounded-box">
               <span class="font-medium">Most Popular Interest</span>
               <span class="badge badge-accent">Nature</span>
             </div>
           </div>
         </div>
       </div>
       
       <div class="card bg-base-100 shadow-lg">
         <div class="card-body">
           <h3 class="card-title text-xl mb-4">
             <i class="fas fa-trophy mr-2 text-primary"></i>
             Achievements
           </h3>
           <div class="space-y-3">
             <div class="flex items-center space-x-3 p-3 bg-yellow-50 rounded-box border border-yellow-200">
               <i class="fas fa-star text-yellow-500 text-xl"></i>
               <div>
                 <p class="font-medium">First Trip Planned</p>
                 <p class="text-sm text-gray-600">Welcome to the journey!</p>
               </div>
             </div>
             ${(stats.totalTrips || 0) >= 5 ? `
             <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-box border border-blue-200">
               <i class="fas fa-medal text-blue-500 text-xl"></i>
               <div>
                 <p class="font-medium">Travel Enthusiast</p>
                 <p class="text-sm text-gray-600">Planned 5+ trips</p>
               </div>
             </div>
             ` : ''}
             ${(stats.totalDownloads || 0) >= 3 ? `
             <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-box border border-green-200">
               <i class="fas fa-download text-green-500 text-xl"></i>
               <div>
                 <p class="font-medium">PDF Master</p>
                 <p class="text-sm text-gray-600">Downloaded 3+ itineraries</p>
               </div>
             </div>
             ` : ''}
           </div>
         </div>
       </div>
     </div>
   `;
 }

 // ============================================================================
 // SAVED TRIPS MANAGEMENT
 // ============================================================================

 // Global functions for saved trips management
 window.viewSavedTrip = async function(tripId) {
   try {
     const result = await apiCall(`/api/saved-itineraries/${tripId}`);
     
     if (result.success && result.data.success && result.data.itinerary) {
       // Display the saved trip as current itinerary
       itineraryData = result.data.itinerary.itinerary;
       displayItinerary(result.data.itinerary.itinerary);
       
       navigateToResults();
       showNotification('Trip loaded successfully!', 'success');
     } else {
       throw new Error('Invalid trip data');
     }
   } catch (error) {
     console.error('Error viewing saved trip:', error);
     showNotification('Failed to load trip details.', 'error');
   }
 };

 window.downloadSavedTrip = async function(tripId) {
   try {
     const result = await apiCall(`/api/saved-itineraries/${tripId}`);
     
     if (result.success && result.data.success && result.data.itinerary) {
       // Generate PDF for the saved trip
       const pdfResult = await apiCall('/api/generate-pdf', {
         method: 'POST',
         body: JSON.stringify({ 
           itinerary: result.data.itinerary.itinerary,
           itineraryId: tripId
         })
       });
       
       if (pdfResult.success && pdfResult.data instanceof Blob) {
         const url = window.URL.createObjectURL(pdfResult.data);
         const a = document.createElement('a');
         a.style.display = 'none';
         a.href = url;
         a.download = `${result.data.itinerary.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
         
         showNotification('PDF downloaded successfully!', 'success');
       } else {
         throw new Error('Failed to generate PDF');
       }
     } else {
       throw new Error('Invalid trip data');
     }
   } catch (error) {
     console.error('Error downloading saved trip:', error);
     showNotification('Failed to download trip.', 'error');
   }
 };

 window.deleteSavedTrip = async function(tripId) {
   if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
     return;
   }
   
   try {
     const result = await apiCall(`/api/saved-itineraries/${tripId}`, {
       method: 'DELETE'
     });
     
     if (result.success && result.data.success) {
       showNotification('Trip deleted successfully!', 'success');
       // Reload the saved trips
       loadSavedTrips();
     } else {
       throw new Error(result.data.message || 'Failed to delete trip');
     }
   } catch (error) {
     console.error('Error deleting saved trip:', error);
     showNotification('Failed to delete trip.', 'error');
   }
 };

 // Add search functionality to saved trips
 document.getElementById('trip-search')?.addEventListener('input', function() {
   clearTimeout(this.searchTimeout);
   this.searchTimeout = setTimeout(() => {
     loadSavedTrips();
   }, 500);
 });

 document.getElementById('trip-filter')?.addEventListener('change', function() {
   loadSavedTrips();
 });

 // ============================================================================
 // KEYBOARD NAVIGATION
 // ============================================================================

 // Add keyboard shortcuts
 document.addEventListener('keydown', function(e) {
   // Only activate shortcuts when not typing in inputs
   if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
     return;
   }
   
   // Alt + H - Home
   if (e.altKey && e.key === 'h') {
     e.preventDefault();
     navigateToHome();
   }
   
   // Alt + P - Plan Trip
   if (e.altKey && e.key === 'p') {
     e.preventDefault();
     navigateToPlanTrip();
   }
   
   // Alt + S - Saved Trips
   if (e.altKey && e.key === 's') {
     e.preventDefault();
     navigateToSavedTrips();
   }
   
   // Alt + T - Theme Toggle
   if (e.altKey && e.key === 't') {
     e.preventDefault();
     toggleTheme();
   }
   
   // Escape - Close modals/drawers
   if (e.key === 'Escape') {
     authModal.classList.add('hidden');
     document.getElementById('main-drawer').checked = false;
   }
 });

 // ============================================================================
 // ENHANCED FEATURES
 // ============================================================================

 // Auto-save form data to localStorage
 function saveFormData() {
   const formData = {
     destination: document.getElementById('destination')?.value || '',
     origin: document.getElementById('origin')?.value || '',
     startDate: document.getElementById('start-date')?.value || '',
     endDate: document.getElementById('end-date')?.value || '',
     budget: document.getElementById('budget')?.value || '',
     travelers: document.getElementById('travelers')?.value || '1',
     accommodationType: document.getElementById('accommodation-type')?.value || 'Mid-range',
     transportationType: document.getElementById('transportation-type')?.value || 'Public Transport',
     interests: Array.from(document.querySelectorAll('.interest-checkbox:checked')).map(cb => cb.value)
   };
   localStorage.setItem('travelPlannerFormData', JSON.stringify(formData));
 }

 // Load form data from localStorage
 function loadFormData() {
   const savedData = localStorage.getItem('travelPlannerFormData');
   if (savedData) {
     try {
       const formData = JSON.parse(savedData);
       
       if (document.getElementById('destination')) document.getElementById('destination').value = formData.destination || '';
       if (document.getElementById('origin')) document.getElementById('origin').value = formData.origin || '';
       if (document.getElementById('start-date')) document.getElementById('start-date').value = formData.startDate || '';
       if (document.getElementById('end-date')) document.getElementById('end-date').value = formData.endDate || '';
       if (document.getElementById('budget')) document.getElementById('budget').value = formData.budget || '';
       if (document.getElementById('travelers')) document.getElementById('travelers').value = formData.travelers || '1';
       if (document.getElementById('accommodation-type')) document.getElementById('accommodation-type').value = formData.accommodationType || 'Mid-range';
       if (document.getElementById('transportation-type')) document.getElementById('transportation-type').value = formData.transportationType || 'Public Transport';
       
       // Restore interest selections
       if (formData.interests) {
         formData.interests.forEach(interest => {
           const checkbox = document.querySelector(`.interest-checkbox[value="${interest}"]`);
           if (checkbox) checkbox.checked = true;
         });
       }
     } catch (error) {
       console.error('Error loading saved form data:', error);
     }
   }
 }

 // Auto-save form data on input changes
 document.addEventListener('input', function(e) {
   if (e.target.closest('#preferences-form')) {
     clearTimeout(window.formSaveTimeout);
     window.formSaveTimeout = setTimeout(saveFormData, 1000);
   }
 });

 // Set minimum date to today
 const today = new Date().toISOString().split('T')[0];
 if (document.getElementById('start-date')) {
   document.getElementById('start-date').min = today;
 }
 if (document.getElementById('end-date')) {
   document.getElementById('end-date').min = today;
 }

 // Update end date minimum when start date changes
 document.getElementById('start-date')?.addEventListener('change', function() {
   if (document.getElementById('end-date')) {
     document.getElementById('end-date').min = this.value;
   }
 });

 // ============================================================================
 // INITIALIZATION
 // ============================================================================

 // Initialize the app
 checkAuthStatus();
 loadFormData();
 
 // Set initial navigation state
 updateNavigation();
 
 console.log('🎉 AI Travel Planner initialized successfully!');
 console.log('📋 Keyboard shortcuts:');
 console.log('   Alt + H: Home');
 console.log('   Alt + P: Plan Trip');
 console.log('   Alt + S: Saved Trips');
 console.log('   Alt + T: Toggle Theme');
 console.log('   Escape: Close modals');
});
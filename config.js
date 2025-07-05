// config.js - API Configuration
const API_CONFIG = {
  // Backend URL configuration
  BASE_URL: (() => {
    // Check if we're in production (deployed on Vercel)
    if (window.location.hostname === 'travel-planner-weld-gamma.vercel.app') {
      return 'https://my-backend-h171.onrender.com';
    }
    // Check if we're on localhost
    else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    // Default to production backend
    else {
      return 'https://my-backend-h171.onrender.com';
    }
  })(),
  
  // Default fetch options
  defaultOptions: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
};

// Global API helper function
window.apiCall = async function(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config = {
    ...API_CONFIG.defaultOptions,
    ...options,
    headers: {
      ...API_CONFIG.defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    console.log(`🌐 Making ${config.method || 'GET'} request to: ${url}`);
    
    const response = await fetch(url, config);
    
    // Handle different content types
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { response, data, success: response.ok };
    } else if (contentType && contentType.includes('application/pdf')) {
      const blob = await response.blob();
      return { response, data: blob, success: response.ok };
    } else {
      const text = await response.text();
      return { response, data: text, success: response.ok };
    }
  } catch (error) {
    console.error('❌ API call failed:', error);
    return { 
      response: null, 
      data: { message: 'Network error occurred', error: error.message }, 
      success: false 
    };
  }
};

// Connection test function
window.testConnection = async function() {
  try {
    console.log('🔍 Testing connection to backend...');
    const result = await apiCall('/api/health');
    
    if (result.success) {
      console.log('✅ Backend connection successful:', result.data);
      return true;
    } else {
      console.error('❌ Backend connection failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

// Initialize connection test on page load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    testConnection();
  }, 1000);
});

console.log('🔧 API Configuration loaded');
console.log('📡 Backend URL:', API_CONFIG.BASE_URL);
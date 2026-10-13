/**
 * FoodNest - Reusable REST API Client
 * Centralizes all communication with Java Spring Boot backend (port 8080).
 */
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('foodnest_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('foodnest_user') || 'null');
  }

  setAuth(token, user) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('foodnest_token', token);
    localStorage.setItem('foodnest_user', JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('foodnest_token');
    localStorage.removeItem('foodnest_user');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `HTTP ${response.status}: Request failed`;
        if (response.status === 401) {
          this.clearAuth();
          if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html?expired=true';
          }
        }
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // Auth Endpoints
  async register(data) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  async login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  async getMe() {
    return this.request('/auth/me', { method: 'GET' });
  }

  // Restaurant Endpoints
  async getRestaurants(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/restaurants${query ? '?' + query : ''}`);
  }

  async getRestaurantById(id) {
    return this.request(`/restaurants/${id}`);
  }

  async getRestaurantMenu(id) {
    return this.request(`/restaurants/${id}/menu`);
  }

  // Food Item Endpoints
  async getFood(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/food${query ? '?' + query : ''}`);
  }

  async searchFood(query) {
    return this.request(`/food/search?q=${encodeURIComponent(query)}`);
  }

  async getFoodByCategory(cat) {
    return this.request(`/food/category/${encodeURIComponent(cat)}`);
  }

  // SmartBite Recommendation Endpoint (Redis Cached)
  async getSmartBiteRecommendations(mood, maxBudget, vegOnly, cuisine) {
    const params = new URLSearchParams();
    if (mood) params.append('mood', mood);
    if (maxBudget) params.append('maxBudget', maxBudget);
    if (vegOnly) params.append('vegetarianOnly', vegOnly);
    if (cuisine && cuisine !== 'all') params.append('cuisine', cuisine);
    return this.request(`/smartbite/recommendations?${params.toString()}`);
  }

  // Coupon Validation
  async validateCoupon(code, subtotal) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });
  }

  // Order Endpoints
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getMyOrders() {
    return this.request('/orders/my');
  }

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(id, reason) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }

  // Admin Endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminOrders() {
    return this.request('/admin/orders');
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async updateFoodAvailability(foodId, available) {
    return this.request(`/admin/food/${foodId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available })
    });
  }

  async updateFoodPrice(foodId, price) {
    return this.request(`/admin/food/${foodId}/price`, {
      method: 'PATCH',
      body: JSON.stringify({ price })
    });
  }

  async clearRedisCache() {
    return this.request('/admin/cache/clear', { method: 'POST' });
  }

  // Performance Benchmark Experiment (MongoDB vs Redis)
  async runBenchmark(iterations = 10) {
    return this.request(`/benchmark/run?iterations=${iterations}`);
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }
}

// Global API instance
const api = new ApiClient();

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.background = '#dc2626';
  } else if (type === 'success') {
    toast.style.background = '#15803d';
  }

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

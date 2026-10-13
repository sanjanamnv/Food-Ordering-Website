/**
 * FoodNest - Core Client Cart & Session Manager
 */
class CartManager {
  constructor() {
    this.storageKey = 'foodnest_cart';
    this.cart = this.load();
    this.listeners = [];
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.cart);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.cart));
    this.updateBadge();
  }

  updateBadge() {
    const badges = document.querySelectorAll('.cart-count');
    const count = this.getCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  getCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return Math.round(this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100) / 100;
  }

  addItem(food, quantity = 1) {
    const existing = this.cart.find(i => i.id === food.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        id: food.id,
        restaurantId: food.restaurantId,
        restaurantName: food.restaurantName,
        name: food.name,
        price: food.price,
        imageUrl: food.imageUrl,
        vegetarian: food.vegetarian,
        quantity: quantity
      });
    }
    this.save();
    showToast(`Added "${food.name}" to cart!`, 'success');
  }

  updateQuantity(foodId, newQty) {
    if (newQty <= 0) {
      this.removeItem(foodId);
      return;
    }
    const item = this.cart.find(i => i.id === foodId);
    if (item) {
      item.quantity = newQty;
      this.save();
    }
  }

  removeItem(foodId) {
    this.cart = this.cart.filter(i => i.id !== foodId);
    this.save();
    showToast('Item removed from cart', 'info');
  }

  clear() {
    this.cart = [];
    this.save();
  }
}

const cart = new CartManager();

// Setup common header/navbar state
document.addEventListener('DOMContentLoaded', () => {
  cart.updateBadge();
  renderUserNav();
});

function renderUserNav() {
  const userActions = document.getElementById('user-nav-actions');
  if (!userActions) return;

  const user = api.currentUser;
  if (user) {
    userActions.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:0.88rem; font-weight:600; color:var(--charcoal);">
          Hi, ${user.name.split(' ')[0]} ${user.role === 'ADMIN' ? '<span style="background:#ea580c; color:white; font-size:0.7rem; padding:2px 6px; border-radius:4px; margin-left:4px;">ADMIN</span>' : ''}
        </span>
        ${user.role === 'ADMIN' ? '<a href="admin.html" class="btn btn-sm btn-outline">Dashboard</a>' : '<a href="orders.html" class="btn btn-sm btn-secondary">My Orders</a>'}
        <button id="logout-btn" class="btn btn-sm btn-secondary">Logout</button>
      </div>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      api.clearAuth();
      showToast('Logged out successfully', 'info');
      setTimeout(() => window.location.href = 'index.html', 500);
    });
  } else {
    userActions.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-secondary">Sign In</a>
      <a href="signup.html" class="btn btn-sm btn-primary">Sign Up</a>
    `;
  }
}

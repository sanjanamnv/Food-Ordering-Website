# FoodNest — Laboratory Demonstration & Viva Guide

This checklist provides a step-by-step demonstration walkthrough for your College NoSQL Database Lab examination, viva voce, and project evaluation.

---

## Pre-Demonstration Checklist
- [ ] Ensure Java 21 is installed (`java -version`).
- [ ] Ensure Maven is available (`mvn -version`).
- [ ] Ensure MongoDB Atlas connection URI is configured in environment variables or `application.yml`.
- [ ] Ensure Redis Cloud connection details (host, port, password) are set.
- [ ] Have **MongoDB Compass** and **Redis Insight / Redis CLI** ready to inspect live data during the viva.

---

## Step-by-Step Demonstration Script (15 Steps)

### Step 1: Start the Spring Boot Backend
In the VS Code terminal:
```powershell
cd backend
mvn clean spring-boot:run
```
**Verification**: Check console output for:
- `Started FoodNestApplication in X.XXX seconds`
- `Seeded initial Admin: admin@foodnest.com`
- `Successfully seeded 42 authentic food items into MongoDB Atlas.`

---

### Step 2: Verify MongoDB Atlas Connectivity
Open browser or use curl to query the health endpoint:
```text
GET http://localhost:8080/api/health
```
**Response**:
```json
{
  "status": "UP",
  "mongodb": "CONNECTED",
  "redis": "CONNECTED (ping=PONG)"
}
```
**MongoDB Compass Verification**: Connect to your Atlas cluster. Open database `foodnest_db` and show the examiner the 6 collections: `users`, `restaurants`, `food_items`, `orders`, `coupons`, `reviews`.

---

### Step 3: Verify Redis Cloud Connectivity
In the terminal, run Redis CLI or inspect Redis Insight:
```bash
redis-cli -h <redis-host> -p <port> -a <password> PING
# Expected: PONG
```
Show the examiner that the database is reachable.

---

### Step 4: Open FoodNest in the Browser
Open `http://localhost:3000` (or `frontend/index.html` via Live Server, or the AI Studio preview).
Showcase:
- Warm orange branding and modern restaurant layout.
- Hero headline: *"Good Food. Great Mood."*
- Food categories: Biryani, South Indian, North Indian, Pizza, Chinese, Burgers, Desserts.

---

### Step 5: User Registration & Login Demonstration
1. Click **Sign Up** (`signup.html`).
2. Register a new student account (e.g., `sanjana@college.edu`).
3. Verify password confirmation check (try entering mismatched passwords to demonstrate client/server validation).
4. Log in as `sanjana@college.edu`.
5. Point out to the examiner:
   - In MongoDB Compass: View the new user document in `users` collection. Emphasize that `passwordHash` is a BCrypt encrypted string and plain-text passwords are never stored.
   - Redis Feature 3: Attempt 6 consecutive failed logins to show the rate limiter returning HTTP 429.

---

### Step 6: Browse Restaurants & Menus (Redis Feature 1)
1. Click **Restaurants** (`restaurants.html`).
2. Filter by cuisine (e.g. *Biryani* or *South Indian*).
3. Click **Paradise Biryani Darbar** to open its menu (`menu.html`).
4. Point out to the examiner:
   - In Redis CLI / Redis Insight: Show the generated cache keys:
     ```text
     foodnest:restaurants:all
     foodnest:menu:rest-1
     ```
   - Check TTL: `TTL foodnest:menu:rest-1` shows countdown from 600 seconds.

---

### Step 7: Add Items to Basket & Dynamic Calculations
1. Toggle **Veg Only** switch to filter vegetarian dishes.
2. Add dishes to cart:
   - 2 × *Hyderabadi Chicken Dum Biryani* (₹299 each)
   - 1 × *Mirchi Ka Salan & Raita* (₹99)
3. Open Cart (`cart.html`).
4. Demonstrate quantity steppers (+ / -) updating item totals reactively.

---

### Step 8: Apply Promo Code & Authoritative Recalculations
1. Enter coupon code `WELCOME50` or `FLAT100` and click **Apply**.
2. Observe savings applied immediately.
3. Show the examiner that all totals are recalculated by the backend rather than trusting client-supplied values.

---

### Step 9: Place an Order & Verify MongoDB Persistence
1. Click **Proceed to Checkout** (`checkout.html`).
2. Confirm delivery address and choose **Cash on Delivery (COD)**.
3. Click **Place Order Now**.
4. Note the generated Order Number (e.g. `FN-20261012-7842`).
5. Open **MongoDB Compass** → `orders` collection:
   - Find the newly inserted order.
   - Show the examiner the **embedded `items` array snapshot**, preserving unit prices and item names at the exact time of order. Explain why document modeling prevents historical order records from breaking if restaurant prices change later.

---

### Step 10: Live Order Tracking Timeline
1. Navigate to **My Orders** (`orders.html`).
2. Show the active order on the 5-stage timeline:
   ```text
   [Order Placed] ──► [Confirmed] ──► [Preparing] ──► [Out for Delivery] ──► [Delivered]
   ```
3. Test order cancellation rules (orders in `ORDER_PLACED` can be cancelled; terminal orders cannot).

---

### Step 11: SmartBite Recommendation Engine (Feature 2)
1. Click **SmartBite** (`smartbite.html`).
2. Select Craving Mood: **Spicy Cravings** 🌶️.
3. Set Budget: **Under ₹300**, and Cuisine: **Biryani**.
4. Click **Find My Meals**.
5. Observe the live **Redis Cache Telemetry Monitor**:
   - 1st Request: Badge shows `🔍 MONGODB CACHE MISS` (Latency: ~35ms).
   - Redis key created: `foodnest:recommendations:spicy:300:any:biryani`.
   - Dishes returned include personalized reasons (e.g., *"Matches your fiery spicy craving"*).

---

### Step 12: Demonstrate Redis Cache Hit (Sub-Millisecond Speed)
1. Without altering the filters, click **Find My Meals** again (or select the same mood).
2. Observe the badge immediately flip to:
   ```text
   ⚡ REDIS CACHE HIT (Latency: ~1ms to 2ms)
   ```
3. Show the examiner that subsequent identical queries are served directly from RAM without touching MongoDB Atlas.

---

### Step 13: Targeted Cache Invalidation (Admin Action)
1. Sign in as Admin (`admin@foodnest.com` / `Admin@12345`) and open **Admin Dashboard** (`admin.html`).
2. Go to **Food Catalog & Cache Invalidation Controls**.
3. Locate *Hyderabadi Chicken Dum Biryani*:
   - Click **Edit Price** and change price to ₹319 (or click **Toggle Stock** to mark out of stock).
4. Explain to the examiner:
   - `FoodService.java` immediately calls `redisCacheService.evictRestaurantCaches(restaurantId)` and `evictAllRecommendations()`.
5. Return to `smartbite.html` or `menu.html`:
   - Querying the item again shows a fresh cache miss reading the newly updated price ₹319 from MongoDB Atlas, proving cache consistency!

---

### Step 14: Role-Based Authorization Enforcement
1. While logged in as a normal customer, attempt to access `/api/admin/dashboard` or perform admin actions.
2. Show that Spring Security intercepts the request with **HTTP 403 Forbidden**.
3. Show that only authenticated users possessing `ROLE_ADMIN` can modify catalogs or update order statuses.

---

### Step 15: Controlled Performance Demonstration (Lab Experiment #13)
1. In the Admin Dashboard, switch to **Lab Benchmark: MongoDB vs Redis**.
2. Select **10 Iterations** and click **Execute Lab Benchmark**.
3. The experiment runs 10 identical fetches:
   - Direct MongoDB Atlas query time: recorded per iteration (~35ms to 50ms).
   - Redis Cloud in-memory cache hit: recorded per iteration (~1ms to 3ms).
4. Review the generated table and average latency reduction percentage (typically **85%–95% faster**).
5. Explain to the examiner how network latency, serialization, and memory caching govern these numbers.

---

## Viva Voce Expected Questions & Answers

**Q1: Why use MongoDB instead of MySQL for this food ordering system?**  
*Answer*: MongoDB is document-oriented and naturally models hierarchical, nested data such as multi-course menus, embedded user delivery addresses, and immutable historical order items without requiring multi-table SQL joins.

**Q2: What is the Cache-Aside pattern used in FoodNest?**  
*Answer*: The application first inspects Redis for requested data. If present (cache hit), it returns it immediately. If missing (cache miss), it queries MongoDB, populates Redis with a defined TTL, and returns the data to the client.

**Q3: How is cache invalidation handled when a restaurant changes prices?**  
*Answer*: Upon saving the update in MongoDB, `RedisCacheService` explicitly purges `foodnest:menu:{restaurantId}`, `foodnest:restaurants:all`, and all recommendation keys under `foodnest:recommendations:*` using targeted key eviction.

**Q4: Why does SmartBite normalize cache keys?**  
*Answer*: Keys like `foodnest:recommendations:spicy:250:veg:indian` are lowercased and stripped of whitespace to avoid duplicate cache entries for equivalent filters and ensure consistent cache hits.

**Q5: How does Redis rate limiting protect the application?**  
*Answer*: It increments an atomic key `foodnest:ratelimit:login:{email}` with a 60-second TTL. If attempts exceed 5 within the window, the request is rejected with HTTP 429, preventing brute-force password guessing without burdening MongoDB.

# FoodNest — Full-Stack Food Ordering Platform

> **College NoSQL Database Management Lab Project**  
> Demonstrating practical integration of **MongoDB Atlas** (Document Database) and **Redis Cloud** (In-Memory Caching & Temporary Data Layer) in an enterprise-grade Java 21 Spring Boot 3.3 web application.

---

## 1. Project Overview & Objectives

FoodNest is a full-featured, commercial-grade food delivery web application that simulates platforms like Swiggy and Zomato while meeting academic lab requirements for NoSQL database systems.

### Key Objectives
1. **MongoDB Atlas Integration**: Utilize a flexible document store for restaurants, hierarchical food menus, immutable historical order snapshots, user profiles, and coupons.
2. **Redis Cloud Integration**: Implement low-latency in-memory operations across three distinct features:
   - **Feature 1**: Restaurant catalog and menu caching with TTL and targeted invalidation.
   - **Feature 2**: **SmartBite** — Personalized mood-based food recommendations with normalized cache keys and sub-millisecond retrieval.
   - **Feature 3**: Redis atomic rate limiter on login endpoints (`foodnest:ratelimit:login:{email}`) to prevent brute-force attacks.
3. **Controlled Performance Demonstration**: Measure and compare direct MongoDB query response times against Redis in-memory cache hit latencies.
4. **Data Integrity & Security**: Enforce authoritative server-side price recalculation, BCrypt password hashing, and role-based access control (CUSTOMER & ADMIN).

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, Fetch API, Tailwind CSS, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3.3.4, Maven, Spring Web, Spring Security, Jakarta Validation |
| **Primary Database** | MongoDB Atlas (Cloud NoSQL Document Store) |
| **Caching Layer** | Redis Cloud (In-Memory Key-Value Store with Lettuce Driver) |
| **Security** | JWT (JSON Web Tokens with HMAC-SHA256), BCrypt (10 rounds) |
| **Build & Test** | Maven 3.9+, JUnit 5, Mockito |

---

## 3. Project Architecture & Directory Structure

```text
foodnest/
├── backend/
│   ├── pom.xml                               # Maven build configuration
│   ├── .env.example                          # Environment template
│   └── src/
│       ├── main/
│       │   ├── java/com/foodnest/
│       │   │   ├── FoodNestApplication.java   # Spring Boot entry point
│       │   │   ├── config/
│       │   │   │   ├── MongoConfig.java       # Auditing & MongoDB settings
│       │   │   │   ├── RedisConfig.java       # Lettuce serializer & template
│       │   │   │   └── DataSeeder.java        # Idempotent database seeder
│       │   │   ├── model/
│       │   │   │   ├── User.java              # User document model
│       │   │   │   ├── Restaurant.java        # Restaurant document model
│       │   │   │   ├── FoodItem.java          # Food item document model
│       │   │   │   ├── Order.java             # Order document snapshot model
│       │   │   │   ├── OrderItem.java         # Embedded order snapshot item
│       │   │   │   ├── Coupon.java            # Discount voucher model
│       │   │   │   ├── Review.java            # Ratings and reviews model
│       │   │   │   ├── Address.java           # Embedded address model
│       │   │   │   ├── Role.java              # CUSTOMER, ADMIN
│       │   │   │   └── OrderStatus.java       # 5-stage order lifecycle
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── RestaurantRepository.java
│       │   │   │   ├── FoodItemRepository.java
│       │   │   │   ├── OrderRepository.java
│       │   │   │   ├── CouponRepository.java
│       │   │   │   └── ReviewRepository.java
│       │   │   ├── service/
│       │   │   │   ├── RedisCacheService.java # Caching operations & metrics
│       │   │   │   ├── RateLimiterService.java# Redis atomic rate limiter
│       │   │   │   ├── AuthService.java       # Registration & authentication
│       │   │   │   ├── RestaurantService.java # Restaurant queries & caching
│       │   │   │   ├── FoodService.java       # Menu queries & invalidation
│       │   │   │   ├── OrderService.java      # Server-side order calculations
│       │   │   │   ├── SmartBiteService.java  # Recommendation algorithm
│       │   │   │   ├── AdminService.java      # Dashboard metrics & orders
│       │   │   │   └── BenchmarkService.java  # MongoDB vs Redis benchmark
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── RestaurantController.java
│       │   │   │   ├── FoodController.java
│       │   │   │   ├── OrderController.java
│       │   │   │   ├── SmartBiteController.java
│       │   │   │   ├── CouponController.java
│       │   │   │   ├── AdminController.java
│       │   │   │   ├── HealthController.java
│       │   │   │   └── BenchmarkController.java
│       │   │   ├── dto/                       # Request & Response DTOs
│       │   │   ├── security/                  # JWT Service & Spring Filters
│       │   │   └── exception/                 # GlobalExceptionHandler
│       │   └── resources/
│       │       └── application.yml            # Config & environment mappings
│       └── test/java/com/foodnest/
│           ├── FoodNestApplicationTests.java
│           └── service/
│               ├── SmartBiteServiceTest.java
│               └── RedisCacheServiceTest.java
├── frontend/
│   ├── css/style.css                          # Modern food ordering styling
│   ├── js/api.js                              # Centralized REST API helper
│   ├── js/app.js                              # Cart & session manager
│   ├── index.html                             # Home Page
│   ├── restaurants.html                       # Restaurant listing & filters
│   ├── menu.html                              # Restaurant Menu & item cart
│   ├── cart.html                              # Cart management & coupons
│   ├── checkout.html                          # Checkout & address entry
│   ├── login.html                             # User sign-in
│   ├── signup.html                            # User registration
│   ├── orders.html                            # Order history & 5-stage timeline
│   ├── smartbite.html                         # SmartBite recommendation engine
│   └── admin.html                             # Admin dashboard & benchmark tool
├── LAB_REPORT.md                              # College Laboratory Report
├── DEMO_GUIDE.md                              # Step-by-Step Viva & Demo Guide
└── README.md                                  # This documentation
```

---

## 4. MongoDB Database Design

MongoDB is utilized as the primary authoritative data store. Document-based schemas are optimal because restaurant menus, user address books, and order snapshots contain nested collections naturally modeled as embedded JSON-like documents.

### Collections & Fields
1. **`users`**
   - `_id`: ObjectId
   - `name`: String
   - `email`: String (Unique index)
   - `passwordHash`: String (BCrypt)
   - `phone`: String
   - `role`: String (`CUSTOMER` or `ADMIN`)
   - `addresses`: Array of embedded `Address` objects
   - `createdAt`: ISO Date

2. **`restaurants`**
   - `_id`: ObjectId
   - `name`: String (Indexed)
   - `description`: String
   - `imageUrl`: String
   - `cuisineTypes`: Array of Strings
   - `rating`: Double
   - `deliveryEstimateMinutes`: Integer
   - `addressCity`: String
   - `active`: Boolean

3. **`food_items`**
   - `_id`: ObjectId
   - `restaurantId`: String (Indexed)
   - `name`: String (Indexed)
   - `description`: String
   - `imageUrl`: String
   - `price`: Double (in ₹)
   - `category`: String (Biryani, Pizza, South Indian, etc.)
   - `cuisine`: String
   - `vegetarian`: Boolean
   - `tags`: Array of Strings (`spicy`, `comfort`, `budget`, `healthy`, `sweet`, `quick`, `bestseller`)
   - `available`: Boolean
   - `preparationTimeMinutes`: Integer

4. **`orders`**
   - `_id`: ObjectId
   - `orderNumber`: String (Unique Index, e.g. `FN-20261012-7842`)
   - `userId`: String (Indexed)
   - `customerName`, `customerPhone`: Strings
   - `restaurantName`: String
   - `items`: Array of embedded `OrderItem` snapshots (immutable records of prices and items at time of purchase)
   - `deliveryAddress`: Embedded `Address`
   - `subtotal`, `deliveryFee`, `discount`, `tax`, `totalAmount`: Doubles (in ₹)
   - `couponCode`: String
   - `paymentMethod`: `CASH_ON_DELIVERY` or `SIMULATED_ONLINE_UPI`
   - `paymentStatus`: `PENDING` or `PAID`
   - `orderStatus`: `ORDER_PLACED` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED` (or `CANCELLED`)
   - `createdAt`, `updatedAt`: ISO Dates

5. **`coupons`**
   - `_id`: ObjectId
   - `code`: String (Unique, e.g. `WELCOME50`, `TASTY20`, `FLAT100`)
   - `discountType`: `PERCENTAGE` or `FLAT`
   - `discountValue`: Double
   - `minimumOrderAmount`: Double
   - `maximumDiscount`: Double
   - `active`: Boolean

---

## 5. Redis Implementation Details

Redis is integrated as a high-performance in-memory cache and temporary store.

### Feature 1: Restaurant and Menu Caching
- Key prefixes:
  - `foodnest:restaurants:all` (TTL: 600s / 10 mins)
  - `foodnest:restaurant:{id}` (TTL: 600s)
  - `foodnest:menu:{restaurantId}` (TTL: 600s)
- **Invalidation Strategy**: When an admin updates a food item's price, marks an item out of stock, or modifies a restaurant, `RedisCacheService.evictRestaurantCaches(restaurantId)` purges the corresponding restaurant and menu keys, as well as recommendation keys.

### Feature 2: SmartBite Recommendation Caching
- Key schema:
  ```text
  foodnest:recommendations:{mood}:{budget}:{vegetarian}:{cuisine}
  ```
- **Example**: `foodnest:recommendations:spicy:250:veg:indian`
- **TTL**: 300s (5 minutes)
- **Key Normalization**: All filter parameters are lowercased, trimmed, and normalized to prevent cache key fragmentation or collisions between filter sets.

### Feature 3: Login Rate Limiting
- Key schema: `foodnest:ratelimit:login:{email}`
- **Mechanism**: Atomic Redis `INCR` operation combined with `EXPIRE` set to 60 seconds on the first attempt.
- **Enforcement**: If `count > 5` within the 60-second window, the request is blocked with HTTP 429 Too Many Requests, protecting user accounts from brute-force password guessing.
- **Reset**: Successful authentication automatically clears the rate limit counter.

---

## 6. REST API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user with Redis rate limiter |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/restaurants` | Public | List active restaurants (Cached in Redis) |
| `GET` | `/api/restaurants/{id}` | Public | Get single restaurant |
| `GET` | `/api/restaurants/{id}/menu`| Public | Get restaurant dishes (Cached in Redis) |
| `GET` | `/api/food` | Public | Get all available food items |
| `GET` | `/api/food/search?q=...` | Public | Full-text query on food items |
| `GET` | `/api/smartbite/recommendations` | Public | Get mood-based recommendations (Redis cached) |
| `POST` | `/api/coupons/validate` | Public | Validate promo codes |
| `POST` | `/api/orders` | Customer/Admin | Create order with server price recalculation |
| `GET` | `/api/orders/my` | Customer/Admin | List user's previous orders |
| `PATCH`| `/api/orders/{id}/cancel` | Customer/Admin | Cancel order if placed or confirmed |
| `GET` | `/api/admin/dashboard` | Admin Only | KPI statistics & Redis hit/miss counters |
| `GET` | `/api/admin/orders` | Admin Only | List all platform orders |
| `PATCH`| `/api/admin/orders/{id}/status` | Admin Only | Advance order in 5-stage lifecycle |
| `PATCH`| `/api/admin/food/{id}/availability` | Admin Only | Toggle stock & invalidate Redis cache |
| `PATCH`| `/api/admin/food/{id}/price` | Admin Only | Update price & invalidate Redis cache |
| `POST` | `/api/admin/cache/clear` | Admin Only | Evict all FoodNest Redis keys |
| `GET` | `/api/benchmark/run?iterations=10`| Public | Run MongoDB vs Redis latency experiment |
| `GET` | `/api/health` | Public | Health status check for MongoDB and Redis |

---

## 7. Windows Installation & Setup Guide

### Prerequisites
1. **Java Development Kit (JDK) 21**: Download and install Eclipse Temurin 21 or Oracle JDK 21.
2. **Apache Maven 3.9+**: Ensure `mvn -v` works in terminal.
3. **VS Code**: With the "Extension Pack for Java" installed.
4. **MongoDB Atlas Account**: Free tier cluster.
5. **Redis Cloud Account**: Free tier 30MB database.

### Step 1: Configure MongoDB Atlas
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster.
3. Under **Database Access**, create a user (e.g. `foodnest_user` with password `StrongPassword123`).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere for development).
5. Click **Connect** → **Drivers** (Java) and copy your connection URI:
   ```text
   mongodb+srv://foodnest_user:StrongPassword123@cluster0.abcde.mongodb.net/foodnest_db?retryWrites=true&w=majority
   ```

### Step 2: Configure Redis Cloud
1. Sign up at [redis.io/cloud](https://redis.io/try-free/).
2. Create a free subscription (e.g. Asia or US region).
3. In the database details, note down:
   - **Endpoint / Host**: e.g. `redis-12345.c256.us-east-1-2.ec2.redislabs.com`
   - **Port**: e.g. `12345`
   - **Password**: Found under the "Security" section.

### Step 3: Set Environment Variables on Windows
Open PowerShell in VS Code:
```powershell
$env:MONGODB_URI="mongodb+srv://foodnest_user:StrongPassword123@cluster0.abcde.mongodb.net/foodnest_db?retryWrites=true&w=majority"
$env:MONGODB_DATABASE="foodnest_db"
$env:REDIS_HOST="redis-12345.c256.us-east-1-2.ec2.redislabs.com"
$env:REDIS_PORT="12345"
$env:REDIS_PASSWORD="YourRedisCloudPasswordHere"
$env:REDIS_SSL_ENABLED="false"
$env:JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
```

*(On Windows Command Prompt CMD, use `set MONGODB_URI=...` instead)*.

### Step 4: Build and Run Spring Boot Backend
Navigate to the backend directory:
```powershell
cd backend
mvn clean spring-boot:run
```
The application will boot on port `8080`.
Observe console logs:
- `Seeded initial Admin: admin@foodnest.com`
- `Seeded sample Customer: customer@foodnest.com`
- `Successfully seeded 42 authentic food items into MongoDB Atlas.`

### Step 5: Run the Frontend
You can serve the `frontend/` directory using any static web server:
```powershell
# Option A: Python HTTP server
python -m http.server 3000 --directory frontend

# Option B: VS Code "Live Server" extension
# Right-click frontend/index.html -> "Open with Live Server"
```
Or use the live interactive application in AI Studio preview.

---

## 8. Default Credentials for Evaluation

- **Administrator**:
  - Email: `admin@foodnest.com`
  - Password: `Admin@12345`
  - Role: `ADMIN`
- **Customer**:
  - Email: `customer@foodnest.com`
  - Password: `Customer@12345`
  - Role: `CUSTOMER`

---

## 9. Performance Demonstration: MongoDB vs Redis

To demonstrate why Redis is essential for high-throughput food ordering platforms:
1. Open the Admin Console (`admin.html` or the interactive preview tab).
2. Navigate to **Lab Benchmark: MongoDB vs Redis**.
3. Select **10 Iterations** and click **Execute Lab Benchmark**.
4. The benchmark will fetch the food items collection:
   - **MongoDB Direct Query**: ~30ms to 50ms average network round-trip.
   - **Redis In-Memory Cache Hit**: ~1ms to 3ms.
   - **Measured Latency Reduction**: Typically **85% to 95% faster** with Redis caching!

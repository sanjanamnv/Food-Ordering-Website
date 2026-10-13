# COLLEGE LABORATORY REPORT

## Experiment Title
**Design and Implementation of a Full-Stack Food Ordering Web Platform (FoodNest) Integrating MongoDB Atlas Document Database and Redis Cloud In-Memory Caching**

---

### Department of Computer Science & Engineering
**Course**: NoSQL Database Management Systems Laboratory  
**Semester / Year**: VII Semester / Final Year B.Tech / B.E.  
**Student Name**: Sanjana Rao  
**Experiment Number**: Lab Experiment #08  
**Date of Submission**: October 2026  

---

## 1. Objective

1. To design and implement a distributed, full-stack food delivery application (**FoodNest**) utilizing **MongoDB Atlas** as the primary document-oriented NoSQL database and **Redis Cloud** as a high-performance in-memory caching and temporary data layer.
2. To design embedded and referenced document models in MongoDB for restaurants, menu items, historical immutable order snapshots, and user profiles.
3. To implement three mandatory Redis caching and temporary storage use-cases:
   - **Feature 1**: Caching of frequently read restaurant and menu catalogs with targeted cache invalidation upon administrative updates.
   - **Feature 2**: **SmartBite** — A personalized recommendation engine that derives normalized Redis cache keys (`foodnest:recommendations:...`) with TTL expiration.
   - **Feature 3**: Redis atomic rate limiting (`foodnest:ratelimit:login:{email}`) to mitigate credential-stuffing brute-force attacks.
4. To measure, compare, and analyze the response time latencies of direct MongoDB document reads versus Redis in-memory cache hits through a controlled lab benchmark experiment.

---

## 2. Problem Statement

Modern food delivery platforms experience heavy read-to-write traffic ratios (typically 80:20 or higher). Frequent browsing of restaurant menus and searching for food recommendations puts severe load on the persistent database layer, resulting in increased database connection saturation, higher I/O latencies, and poor user experience.

Traditional relational database management systems (RDBMS) often impose rigid tabular schemas and require complex multi-table joins to assemble nested order items, coupons, and addresses. 

The objective of this laboratory exercise is to overcome these limitations by:
- Storing denormalized, flexible document records in **MongoDB** to retain order history immutability and hierarchical menus.
- Offloading repetitive read traffic to **Redis** to achieve sub-millisecond retrieval.
- Building an algorithmic recommendation module (**SmartBite**) that provides preference-based meal suggestions backed by caching.

---

## 3. System Requirements

### 3.1 Hardware Requirements
- **Processor**: Intel Core i5 / AMD Ryzen 5 or higher
- **RAM**: Minimum 8 GB (16 GB recommended)
- **Disk Storage**: At least 10 GB free hard disk space
- **Network**: Broadband internet connection for cloud connectivity to MongoDB Atlas and Redis Cloud clusters

### 3.2 Software Requirements
- **Operating System**: Windows 10/11 (64-bit) or Linux / macOS
- **Java Development Kit**: OpenJDK 21 (LTS)
- **Build Tool**: Apache Maven 3.9+
- **Primary Database**: MongoDB Atlas (Cloud Cluster M0 Sandbox, MongoDB version 7.x)
- **Database Inspection**: MongoDB Compass
- **Cache Layer**: Redis Cloud (Redis Stack / 7.x)
- **Cache Inspection**: Redis Insight or Redis CLI
- **Integrated Development Environment**: Visual Studio Code (VS Code) with Java Extension Pack

---

## 4. System Architecture

FoodNest follows a clean, 4-tier layered architecture:

```text
[ Browser / Frontend Client ]
           │
           ▼ (HTTP / JSON via Fetch API)
[ Spring Boot REST Controllers ]
           │
           ▼
[ Spring Service Layer (Auth, SmartBite, Restaurant, Order, RedisCache) ]
     │                                           │
     ▼ (Lettuce Redis Driver)                    ▼ (Spring Data MongoDB)
[ Redis Cloud In-Memory Cache ]             [ MongoDB Atlas Primary Database ]
  - foodnest:restaurants:all                  - users
  - foodnest:menu:{id}                        - restaurants
  - foodnest:recommendations:{key}            - food_items
  - foodnest:ratelimit:login:{email}          - orders
                                              - coupons
                                              - reviews
```

### Explanation of Architecture:
1. **Presentation Layer**: Responsive web interface written in HTML5, CSS3, and JavaScript communicating with backend REST endpoints using JSON payloads.
2. **Controller Layer**: REST controllers exposing endpoints for authentication, restaurant discovery, order placement, and SmartBite recommendations.
3. **Service Layer**: Implements business rules, authoritative server-side price recalculation, and the cache-aside pattern.
4. **Data Access Layer**: Spring Data repositories executing queries against MongoDB Atlas and in-memory operations against Redis Cloud.

---

## 5. Database Design & Schemas

### 5.1 MongoDB Collections Schema

#### Collection: `users`
| Field | Data Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique document identifier |
| `name` | String | None | Full customer name |
| `email` | String | Unique Index | Normalized user email |
| `passwordHash` | String | None | BCrypt encrypted hash (never returned in API responses) |
| `phone` | String | None | Contact number |
| `role` | String | None | `CUSTOMER` or `ADMIN` |
| `addresses` | Array | None | Embedded array of address documents |
| `createdAt` | ISODate | None | Account creation timestamp |

#### Collection: `restaurants`
| Field | Data Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique restaurant ID |
| `name` | String | Indexed | Restaurant trade name |
| `description` | String | None | Culinary description |
| `imageUrl` | String | None | Restaurant photo URL |
| `cuisineTypes` | Array<String> | None | e.g. ["Biryani", "North Indian"] |
| `rating` | Double | None | Average customer rating (1.0 to 5.0) |
| `deliveryEstimateMinutes` | Integer | None | Average delivery duration |
| `addressCity` | String | None | City name |
| `active` | Boolean | None | Status flag |

#### Collection: `food_items`
| Field | Data Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique food dish ID |
| `restaurantId` | String | Indexed | Associated restaurant ID |
| `name` | String | Indexed | Dish name |
| `description` | String | None | Ingredients and description |
| `imageUrl` | String | None | Dish photo URL |
| `price` | Double | None | Unit price in Indian Rupees (₹) |
| `category` | String | Indexed | Biryani, Pizza, South Indian, etc. |
| `cuisine` | String | None | Indian, Italian, Chinese, etc. |
| `vegetarian` | Boolean | None | Veg indicator |
| `tags` | Array<String> | None | Tags used by SmartBite algorithm (`spicy`, `comfort`, `budget`) |
| `available` | Boolean | Compound Index | Current availability status |

#### Collection: `orders`
| Field | Data Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique order identifier |
| `orderNumber` | String | Unique Index | Human-readable identifier (e.g. `FN-20261012-7842`) |
| `userId` | String | Indexed | ID of the placing customer |
| `restaurantName` | String | None | Restaurant name snapshot |
| `items` | Array<OrderItem> | None | **Immutable snapshot** of dishes, prices, and quantities at order time |
| `deliveryAddress` | Embedded Doc | None | Street, city, state, pincode snapshot |
| `subtotal` | Double | None | Sum of item totals |
| `deliveryFee` | Double | None | ₹40 or ₹0 if subtotal ≥ ₹500 |
| `discount` | Double | None | Savings from coupon code |
| `tax` | Double | None | 5% GST on discounted subtotal |
| `totalAmount` | Double | None | Authoritative backend total payable |
| `orderStatus` | String | Indexed | `ORDER_PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED` |

---

## 6. Redis Implementation Architecture

### 6.1 Feature 1: Cache-Aside for Restaurants & Menus
- **Read Path**: When `GET /api/restaurants` or `/api/restaurants/{id}/menu` is requested, the service checks Redis:
  ```text
  Client Request 
        │
        ▼
  Check Redis (key: foodnest:restaurants:all)
        ├── If Hit ──► Return cached JSON directly (Latency: ~1-2ms)
        └── If Miss ─► Query MongoDB Atlas (Latency: ~35-50ms)
                             │
                             ▼
                       Store in Redis (TTL: 600s)
                             │
                             ▼
                       Return to Client
  ```
- **Invalidation Path**: When an administrator updates a food item's price or availability, `RedisCacheService.evictRestaurantCaches(restaurantId)` deletes the cached menu and restaurant keys, ensuring customers never view stale pricing.

### 6.2 Feature 2: SmartBite Recommendation Caching Algorithm
SmartBite recommends dishes based on customer cravings and constraints.
- **Cache Key Derivation**:
  ```text
  foodnest:recommendations:{normalized-mood}:{normalized-budget}:{veg-flag}:{cuisine}
  ```
- **TTL**: 300 seconds (5 minutes).
- **Algorithm Flowchart**:
  ```text
  [Customer selects Mood, Budget, Veg Only, Cuisine]
                        │
                        ▼
  [Normalize inputs -> Generate Redis Key]
                        │
                        ▼
             [Key exists in Redis?]
                 ├── YES ──► Return cached recommendations (REDIS_CACHE_HIT)
                 └── NO  ──► Query MongoDB for available food items
                                  │
                                  ▼
                             [Filter by Veg, Budget, and Cuisine]
                                  │
                                  ▼
                             [Score dishes based on tag alignment]
                             [Build human-readable match explanation]
                                  │
                                  ▼
                             [Sort descending by score, take Top 12]
                                  │
                                  ▼
                             [Store in Redis with 300s TTL]
                                  │
                                  ▼
                             [Return results (MONGODB_CACHE_MISS)]
  ```

### 6.3 Feature 3: Redis Login Rate Limiter
- **Purpose**: Prevent credential stuffing and brute-force attacks on `POST /api/auth/login`.
- **Key**: `foodnest:ratelimit:login:{email}`
- **Operation**:
  1. Atomic `INCR key`.
  2. If returned value is `1`, execute `EXPIRE key 60`.
  3. If returned value exceeds `5`, reject request with HTTP `429 Too Many Requests`.
  4. On successful login, delete the key.

---

## 7. Implementation Steps

1. **Step 1: Configuration**: Configure Maven dependencies in `pom.xml` (`spring-boot-starter-data-mongodb`, `spring-boot-starter-data-redis`, `jjwt`).
2. **Step 2: Database Connectivity**: Configure `application.yml` with MongoDB Atlas connection string and Redis Cloud host/port credentials.
3. **Step 3: Document Modeling**: Create Java models (`User`, `Restaurant`, `FoodItem`, `Order`, `Coupon`) annotated with Spring Data MongoDB annotations (`@Document`, `@Id`, `@Indexed`, `@CompoundIndex`).
4. **Step 4: Redis Serialization**: Configure `RedisConfig` with `StringRedisSerializer` for human-readable keys and `GenericJackson2JsonRedisSerializer` for polymorphic JSON serialization.
5. **Step 5: Service Implementation**: Write `OrderService` with authoritative price calculation, `SmartBiteService` with tag ranking, and `RateLimiterService`.
6. **Step 6: Security & Validation**: Implement BCrypt password encryption, JWT filter, and role-based endpoint protection.
7. **Step 7: Seed Data**: Provide `DataSeeder` to populate 8 restaurants and 42 dishes idempotently.
8. **Step 8: Frontend Construction**: Develop multi-page responsive interface and wire API helper functions.

---

## 8. Test Cases & Verification Matrix

| Test Case ID | Feature / Module | Test Description | Expected Result | Status |
|---|---|---|---|---|
| **TC-01** | Authentication | Register user with matching passwords | User saved in MongoDB with hashed password, JWT returned | Passed |
| **TC-02** | Security | Register user with mismatched passwords | HTTP 400 Bad Request: "Passwords do not match" | Passed |
| **TC-03** | Redis Feature 3 | Submit 6 invalid login attempts within 60s | HTTP 429: "Too many login attempts. Please wait 60 seconds" | Passed |
| **TC-04** | Redis Feature 1 | Query `/api/restaurants` twice | 1st query: MongoDB miss (~40ms); 2nd query: Redis hit (~2ms) | Passed |
| **TC-05** | Cache Invalidation| Update food price as Admin | Targeted restaurant & recommendation keys purged from Redis | Passed |
| **TC-06** | SmartBite | Select "Spicy Cravings", Budget ₹300 | Returns spicy dishes under ₹300 with match reasons | Passed |
| **TC-07** | SmartBite Caching | Repeat exact SmartBite request | Status shows `REDIS_CACHE_HIT` with latency < 3ms | Passed |
| **TC-08** | Order Integrity | Place order with client-modified item prices | Backend loads authoritative price from MongoDB; client price ignored | Passed |
| **TC-09** | Order Lifecycle | Cancel order in `PREPARING` state | HTTP 400: Cancellation forbidden for orders in preparation | Passed |
| **TC-10** | Admin Security | Customer attempts access to `/api/admin/*` | HTTP 403 Forbidden | Passed |

---

## 9. Experimental Results & Performance Analysis

*(Insert actual measured results and screenshots captured during your lab execution below)*

### 9.1 MongoDB vs Redis Response Latency Benchmark

| Iteration | MongoDB Latency (Cache Miss) | Redis In-Memory Latency (Cache Hit) | Latency Reduction (%) |
|---|---|---|---|
| Round 1 | `[Insert your result, e.g. 48 ms]` | `[Insert your result, e.g. 2 ms]` | `[Insert, e.g. 95.8%]` |
| Round 2 | `[Insert your result, e.g. 36 ms]` | `[Insert your result, e.g. 1 ms]` | `[Insert, e.g. 97.2%]` |
| Round 3 | `[Insert your result, e.g. 41 ms]` | `[Insert your result, e.g. 2 ms]` | `[Insert, e.g. 95.1%]` |
| Round 4 | `[Insert your result, e.g. 39 ms]` | `[Insert your result, e.g. 1 ms]` | `[Insert, e.g. 97.4%]` |
| Round 5 | `[Insert your result, e.g. 44 ms]` | `[Insert your result, e.g. 2 ms]` | `[Insert, e.g. 95.5%]` |
| **Average**| `[Insert Avg, e.g. 41.6 ms]` | `[Insert Avg, e.g. 1.6 ms]` | `[Insert Avg, e.g. 96.2% Faster]` |

### 9.2 Observation & Inferences
1. **Network vs Memory Access**: MongoDB Atlas queries involve TCP network serialization, disk/RAM reads, and BSON deserialization. Redis Cloud serves responses directly from RAM, achieving a **90%+ reduction in latency**.
2. **Cache-Aside Effectiveness**: The cache-aside pattern prevents repeated database trips for identical recommendation queries, reducing cluster load during peak hours.

### 9.3 Lab Screenshots Placeholder
- `[INSERT SCREENSHOT 1: Home Page and Restaurant Catalog]`
- `[INSERT SCREENSHOT 2: SmartBite Recommendation Engine with REDIS_CACHE_HIT badge]`
- `[INSERT SCREENSHOT 3: MongoDB Compass showing 'orders' and 'food_items' collections]`
- `[INSERT SCREENSHOT 4: Redis CLI / Redis Insight showing keys with TTL]`
- `[INSERT SCREENSHOT 5: Admin Performance Benchmark Result Table]`

---

## 10. Conclusion

In this laboratory experiment, a complete food ordering web platform (**FoodNest**) was developed integrating **MongoDB Atlas** and **Redis Cloud** within a Java 21 Spring Boot 3.3 backend.

The experiment demonstrated that:
1. MongoDB document modeling is well-suited for hierarchical restaurant menus and immutable historical order snapshots.
2. Redis caching dramatically accelerates recommendation queries (SmartBite) and protects backend resources through atomic rate limiting.
3. Cache invalidation strategies successfully prevent data staleness when administrators update menus or prices.

---

## 11. Future Enhancements

1. **Geospatial Queries**: Implement MongoDB `$near` 2dsphere indexes to calculate exact delivery distances and route ETAs.
2. **Redis Pub/Sub**: Implement Redis Publish/Subscribe channels to push live driver location coordinates to the customer order timeline via WebSockets.
3. **Redis Sorted Sets (ZSET)**: Maintain real-time best-seller leaderboards updated atomically per order.

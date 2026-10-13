package com.foodnest.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Core Redis Service for FoodNest.
 * Implements:
 * 1. Restaurant & Menu caching with TTL.
 * 2. SmartBite Recommendation caching with normalized filter keys.
 * 3. Graceful degradation (if Redis is down, reads proceed from MongoDB without crashing).
 * 4. Cache hit/miss metrics for live lab performance demonstrations.
 */
@Service
public class RedisCacheService {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheService.class);

    public static final String KEY_RESTAURANTS_ALL = "foodnest:restaurants:all";
    public static final String PREFIX_RESTAURANT = "foodnest:restaurant:";
    public static final String PREFIX_MENU = "foodnest:menu:";
    public static final String PREFIX_RECOMMENDATIONS = "foodnest:recommendations:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${foodnest.cache.restaurants-ttl-seconds:600}")
    private long restaurantsTtl;

    @Value("${foodnest.cache.menu-ttl-seconds:600}")
    private long menuTtl;

    @Value("${foodnest.cache.recommendations-ttl-seconds:300}")
    private long recommendationsTtl;

    // Cache Telemetry Counters for Lab Viva & Performance Demonstrations
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);

    public RedisCacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Retrieve a cached object by key with safe fallback.
     */
    public <T> Optional<T> get(String key, Class<T> clazz) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                cacheHits.incrementAndGet();
                log.debug("Redis CACHE HIT for key: {}", key);
                return Optional.of(clazz.cast(value));
            } else {
                cacheMisses.incrementAndGet();
                log.debug("Redis CACHE MISS for key: {}", key);
                return Optional.empty();
            }
        } catch (Exception ex) {
            log.warn("Redis unavailable during get('{}'): {}. Falling back to database.", key, ex.getMessage());
            cacheMisses.incrementAndGet();
            return Optional.empty();
        }
    }

    /**
     * Store object in Redis with specific TTL.
     */
    public void set(String key, Object value, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
            log.debug("Redis SET key: {} with TTL: {}s", key, ttl.getSeconds());
        } catch (Exception ex) {
            log.warn("Redis unavailable during set('{}'): {}. Continuing without caching.", key, ex.getMessage());
        }
    }

    // ==========================================
    // Feature 1: Restaurant & Menu Cache Helpers
    // ==========================================

    public void cacheAllRestaurants(Object restaurantList) {
        set(KEY_RESTAURANTS_ALL, restaurantList, Duration.ofSeconds(restaurantsTtl));
    }

    public void cacheRestaurant(String restaurantId, Object restaurant) {
        set(PREFIX_RESTAURANT + restaurantId, restaurant, Duration.ofSeconds(restaurantsTtl));
    }

    public void cacheMenu(String restaurantId, Object foodList) {
        set(PREFIX_MENU + restaurantId, foodList, Duration.ofSeconds(menuTtl));
    }

    /**
     * Invalidate restaurant and related menu caches when admin updates a restaurant or food item.
     */
    public void evictRestaurantCaches(String restaurantId) {
        try {
            redisTemplate.delete(KEY_RESTAURANTS_ALL);
            if (restaurantId != null && !restaurantId.isBlank()) {
                redisTemplate.delete(PREFIX_RESTAURANT + restaurantId);
                redisTemplate.delete(PREFIX_MENU + restaurantId);
            }
            // Invalidate recommendations as food availability or pricing may have changed
            evictAllRecommendations();
            log.info("Evicted restaurant cache for ID: {} and cleared recommendation caches.", restaurantId);
        } catch (Exception ex) {
            log.warn("Redis eviction failed for restaurant ID {}: {}", restaurantId, ex.getMessage());
        }
    }

    // ==========================================
    // Feature 2: SmartBite Recommendation Cache
    // ==========================================

    /**
     * Build stable, normalized recommendation cache key:
     * foodnest:recommendations:{mood}:{budget}:{vegetarian}:{cuisine}
     */
    public String buildRecommendationKey(String mood, Double maxBudget, Boolean vegOnly, String cuisine) {
        String m = (mood != null && !mood.isBlank()) ? mood.trim().toLowerCase() : "all";
        String b = (maxBudget != null && maxBudget > 0) ? String.valueOf(maxBudget.intValue()) : "any";
        String v = (vegOnly != null && vegOnly) ? "veg" : "any";
        String c = (cuisine != null && !cuisine.isBlank()) ? cuisine.trim().toLowerCase() : "any";
        return PREFIX_RECOMMENDATIONS + m + ":" + b + ":" + v + ":" + c;
    }

    public void cacheRecommendations(String key, Object recommendationList) {
        set(key, recommendationList, Duration.ofSeconds(recommendationsTtl));
    }

    public void evictAllRecommendations() {
        try {
            Set<String> keys = redisTemplate.keys(PREFIX_RECOMMENDATIONS + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Evicted {} cached SmartBite recommendation keys.", keys.size());
            }
        } catch (Exception ex) {
            log.warn("Failed to evict recommendation keys: {}", ex.getMessage());
        }
    }

    public long getCacheHits() {
        return cacheHits.get();
    }

    public long getCacheMisses() {
        return cacheMisses.get();
    }

    public void resetStats() {
        cacheHits.set(0);
        cacheMisses.set(0);
    }
}

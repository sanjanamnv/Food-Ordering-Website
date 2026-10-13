package com.foodnest.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Feature 3: Redis-backed Rate Limiter.
 * Uses atomic Redis INCR and EXPIRE operations to limit failed/frequent login attempts.
 * Prevents brute-force credential stuffing without locking up MongoDB.
 */
@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);
    private static final String KEY_PREFIX = "foodnest:ratelimit:login:";

    private final StringRedisTemplate stringRedisTemplate;

    @Value("${foodnest.cache.rate-limit-window-seconds:60}")
    private long windowSeconds;

    @Value("${foodnest.cache.rate-limit-max-attempts:5}")
    private int maxAttempts;

    public RateLimiterService(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    /**
     * Checks if an identifier (e.g. email or client IP) is rate-limited.
     * Increments attempt count atomically.
     *
     * @param identifier user email or IP address
     * @return true if allowed, false if limit exceeded
     */
    public boolean allowRequest(String identifier) {
        String key = KEY_PREFIX + identifier.toLowerCase().trim();
        try {
            Long count = stringRedisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                stringRedisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
            }
            if (count != null && count > maxAttempts) {
                log.warn("Rate limit exceeded for {}: attempt {}/{}", identifier, count, maxAttempts);
                return false;
            }
            return true;
        } catch (Exception ex) {
            // Documented fail-open policy with fallback logging in case Redis network is interrupted
            log.warn("Rate limiter failed to communicate with Redis: {}. Failing open for availability.", ex.getMessage());
            return true;
        }
    }

    /**
     * Clear rate limit on successful authentication.
     */
    public void resetLimit(String identifier) {
        String key = KEY_PREFIX + identifier.toLowerCase().trim();
        try {
            stringRedisTemplate.delete(key);
        } catch (Exception ex) {
            log.warn("Failed to clear rate limit key {}: {}", key, ex.getMessage());
        }
    }
}

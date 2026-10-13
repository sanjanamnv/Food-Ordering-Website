package com.foodnest.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisCacheServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private RedisCacheService redisCacheService;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testBuildRecommendationKey_Normalized() {
        String key1 = redisCacheService.buildRecommendationKey("Spicy ", 250.0, true, "Indian ");
        assertEquals("foodnest:recommendations:spicy:250:veg:indian", key1);

        String key2 = redisCacheService.buildRecommendationKey(null, null, false, null);
        assertEquals("foodnest:recommendations:all:any:any:any", key2);
    }

    @Test
    void testGet_CacheHitIncrementsTelemetry() {
        when(valueOperations.get("test-key")).thenReturn("CachedValue");

        Optional<String> result = redisCacheService.get("test-key", String.class);

        assertTrue(result.isPresent());
        assertEquals("CachedValue", result.get());
        assertTrue(redisCacheService.getCacheHits() >= 1);
    }

    @Test
    void testGet_CacheMissIncrementsTelemetry() {
        when(valueOperations.get("missing-key")).thenReturn(null);

        Optional<String> result = redisCacheService.get("missing-key", String.class);

        assertFalse(result.isPresent());
        assertTrue(redisCacheService.getCacheMisses() >= 1);
    }
}

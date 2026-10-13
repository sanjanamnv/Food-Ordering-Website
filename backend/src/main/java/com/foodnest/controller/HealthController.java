package com.foodnest.controller;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final MongoTemplate mongoTemplate;
    private final RedisConnectionFactory redisConnectionFactory;

    public HealthController(MongoTemplate mongoTemplate, RedisConnectionFactory redisConnectionFactory) {
        this.mongoTemplate = mongoTemplate;
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("application", "FoodNest Spring Boot 3.3.4");

        // MongoDB check
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            status.put("mongodb", "CONNECTED");
        } catch (Exception e) {
            status.put("mongodb", "DISCONNECTED: " + e.getMessage());
        }

        // Redis check
        try (RedisConnection conn = redisConnectionFactory.getConnection()) {
            String pingResult = conn.ping();
            status.put("redis", "CONNECTED (ping=" + pingResult + ")");
        } catch (Exception e) {
            status.put("redis", "DISCONNECTED: " + e.getMessage());
        }

        return ResponseEntity.ok(status);
    }
}

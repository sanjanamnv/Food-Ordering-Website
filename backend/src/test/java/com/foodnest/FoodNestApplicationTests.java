package com.foodnest;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/test_foodnest",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379",
    "foodnest.seeding.enabled=false"
})
class FoodNestApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring Boot 3 context configuration
    }
}

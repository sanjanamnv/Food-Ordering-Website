package com.foodnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * FoodNest - Full-Stack Food Ordering Platform
 * Demonstrates MongoDB Atlas (Primary Document Database) & Redis Cloud (Caching & Temporary Layer).
 */
@SpringBootApplication
@EnableMongoRepositories
public class FoodNestApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodNestApplication.java, args);
    }
}

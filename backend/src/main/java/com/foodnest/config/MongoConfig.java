package com.foodnest.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB Configuration.
 * Enables @CreatedDate and @LastModifiedDate auditing on document models.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}

package com.foodnest.service;

import com.foodnest.dto.SmartBiteDtos.*;
import com.foodnest.model.FoodItem;
import com.foodnest.repository.FoodItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SmartBiteService {

    private static final Logger log = LoggerFactory.getLogger(SmartBiteService.class);

    private final FoodItemRepository foodItemRepository;
    private final RedisCacheService redisCacheService;

    public SmartBiteService(FoodItemRepository foodItemRepository, RedisCacheService redisCacheService) {
        this.foodItemRepository = foodItemRepository;
        this.redisCacheService = redisCacheService;
    }

    /**
     * Feature 2: SmartBite Personalized Recommendations with Redis Caching.
     * Normalized key prevents collisions between differing filter sets.
     */
    public RecommendationResponse getRecommendations(String mood, Double maxBudget, Boolean vegOnly, String cuisine) {
        long startTime = System.currentTimeMillis();

        String cacheKey = redisCacheService.buildRecommendationKey(mood, maxBudget, vegOnly, cuisine);

        // Step 1: Check Redis cache
        Optional<List> cached = redisCacheService.get(cacheKey, List.class);
        if (cached.isPresent()) {
            long duration = System.currentTimeMillis() - startTime;
            log.info("SmartBite REDIS CACHE HIT for key: {} ({}ms)", cacheKey, duration);
            @SuppressWarnings("unchecked")
            List<RecommendationItemDto> items = (List<RecommendationItemDto>) cached.get();
            return new RecommendationResponse(items, "REDIS_CACHE_HIT", cacheKey, duration, items.size());
        }

        // Step 2: Cache Miss - Query MongoDB for real food records
        log.info("SmartBite REDIS CACHE MISS for key: {}. Querying MongoDB...", cacheKey);
        List<FoodItem> allAvailable = foodItemRepository.findByAvailableTrue();
        List<RecommendationItemDto> recommended = new ArrayList<>();

        String normalizedMood = (mood != null) ? mood.trim().toLowerCase() : "comfort";

        for (FoodItem item : allAvailable) {
            // Filter 1: Vegetarian Only
            if (vegOnly != null && vegOnly && !item.isVegetarian()) {
                continue;
            }

            // Filter 2: Maximum Budget
            if (maxBudget != null && maxBudget > 0 && item.getPrice() > maxBudget) {
                continue;
            }

            // Filter 3: Preferred Cuisine
            if (cuisine != null && !cuisine.isBlank() && !cuisine.equalsIgnoreCase("all")) {
                if (!cuisine.equalsIgnoreCase(item.getCuisine()) && !cuisine.equalsIgnoreCase(item.getCategory())) {
                    continue;
                }
            }

            // Scoring and Tag Matching
            double score = 1.0;
            StringBuilder reasonBuilder = new StringBuilder();

            List<String> tags = item.getTags();
            if (tags == null) tags = new ArrayList<>();

            boolean matchedMood = false;
            if (normalizedMood.contains("spicy") && tags.contains("spicy")) {
                score += 3.0;
                reasonBuilder.append("Matches your fiery spicy craving. ");
                matchedMood = true;
            } else if (normalizedMood.contains("comfort") && tags.contains("comfort")) {
                score += 3.0;
                reasonBuilder.append("Rich comforting flavors. ");
                matchedMood = true;
            } else if (normalizedMood.contains("healthy") && tags.contains("healthy")) {
                score += 3.5;
                reasonBuilder.append("Nutrient-rich healthy choice. ");
                matchedMood = true;
            } else if (normalizedMood.contains("budget") && (tags.contains("budget") || item.getPrice() <= 150)) {
                score += 3.0;
                reasonBuilder.append("Great value within your budget. ");
                matchedMood = true;
            } else if (normalizedMood.contains("quick") && (tags.contains("quick") || item.getPreparationTimeMinutes() <= 20)) {
                score += 2.5;
                reasonBuilder.append("Fast prep under 20 mins. ");
                matchedMood = true;
            } else if (normalizedMood.contains("sweet") && tags.contains("sweet")) {
                score += 3.0;
                reasonBuilder.append("Satisfies your sweet tooth. ");
                matchedMood = true;
            } else if (normalizedMood.contains("vegetarian") && item.isVegetarian()) {
                score += 3.0;
                reasonBuilder.append("100% vegetarian favorite. ");
                matchedMood = true;
            }

            if (tags.contains("bestseller")) {
                score += 1.5;
                reasonBuilder.append("Customer bestseller! ");
            }

            if (maxBudget != null && maxBudget > 0) {
                reasonBuilder.append(String.format("Fits within ₹%.0f limit. ", maxBudget));
            }

            if (item.isVegetarian()) {
                reasonBuilder.append("Pure veg dish.");
            }

            // Include if mood matched or general query
            if (matchedMood || normalizedMood.equals("all") || score > 1.5) {
                recommended.add(new RecommendationItemDto(item, reasonBuilder.toString().trim(), score));
            }
        }

        // Sort descending by calculated score
        recommended.sort(Comparator.comparingDouble(RecommendationItemDto::getMatchScore).reversed());

        // Cap to top 12 recommendations
        if (recommended.size() > 12) {
            recommended = new ArrayList<>(recommended.subList(0, 12));
        }

        // Cache recommendation results in Redis with TTL (5 minutes)
        if (!recommended.isEmpty()) {
            redisCacheService.cacheRecommendations(cacheKey, recommended);
        }

        long duration = System.currentTimeMillis() - startTime;
        return new RecommendationResponse(recommended, "MONGODB_CACHE_MISS", cacheKey, duration, recommended.size());
    }
}

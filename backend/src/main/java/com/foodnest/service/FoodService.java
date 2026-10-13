package com.foodnest.service;

import com.foodnest.exception.ResourceNotFoundException;
import com.foodnest.model.FoodItem;
import com.foodnest.repository.FoodItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class FoodService {

    private static final Logger log = LoggerFactory.getLogger(FoodService.class);

    private final FoodItemRepository foodItemRepository;
    private final RedisCacheService redisCacheService;

    public FoodService(FoodItemRepository foodItemRepository, RedisCacheService redisCacheService) {
        this.foodItemRepository = foodItemRepository;
        this.redisCacheService = redisCacheService;
    }

    /**
     * Feature 1: Menu Caching in Redis.
     * Checks Redis key 'foodnest:menu:{restaurantId}'.
     */
    public List<FoodItem> getMenuByRestaurant(String restaurantId) {
        String cacheKey = RedisCacheService.PREFIX_MENU + restaurantId;
        Optional<List> cached = redisCacheService.get(cacheKey, List.class);
        if (cached.isPresent()) {
            log.info("Returned menu for restaurant {} from REDIS cache", restaurantId);
            return cached.get();
        }

        log.info("REDIS cache miss. Querying MongoDB for restaurant {} menu items", restaurantId);
        List<FoodItem> items = foodItemRepository.findByRestaurantIdAndAvailableTrue(restaurantId);
        if (!items.isEmpty()) {
            redisCacheService.cacheMenu(restaurantId, items);
        }
        return items;
    }

    public List<FoodItem> getAllAvailableFood() {
        return foodItemRepository.findByAvailableTrue();
    }

    public FoodItem getFoodById(String id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
    }

    public List<FoodItem> searchFood(String query) {
        if (query == null || query.isBlank()) {
            return foodItemRepository.findByAvailableTrue();
        }
        return foodItemRepository.searchAvailableFood(query.trim());
    }

    public List<FoodItem> getFoodByCategory(String category) {
        return foodItemRepository.findByCategoryIgnoreCaseAndAvailableTrue(category);
    }

    public FoodItem createFoodItem(FoodItem item) {
        FoodItem saved = foodItemRepository.save(item);
        redisCacheService.evictRestaurantCaches(saved.getRestaurantId());
        return saved;
    }

    public FoodItem updateFoodItem(String id, FoodItem updated) {
        FoodItem existing = getFoodById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setCuisine(updated.getCuisine());
        existing.setVegetarian(updated.isVegetarian());
        existing.setTags(updated.getTags());
        existing.setAvailable(updated.isAvailable());
        existing.setPreparationTimeMinutes(updated.getPreparationTimeMinutes());
        existing.setUpdatedAt(Instant.now());

        FoodItem saved = foodItemRepository.save(existing);
        redisCacheService.evictRestaurantCaches(saved.getRestaurantId());
        return saved;
    }

    public FoodItem updateAvailability(String id, boolean available) {
        FoodItem existing = getFoodById(id);
        existing.setAvailable(available);
        existing.setUpdatedAt(Instant.now());
        FoodItem saved = foodItemRepository.save(existing);
        redisCacheService.evictRestaurantCaches(saved.getRestaurantId());
        return saved;
    }

    public FoodItem updatePrice(String id, double price) {
        FoodItem existing = getFoodById(id);
        existing.setPrice(price);
        existing.setUpdatedAt(Instant.now());
        FoodItem saved = foodItemRepository.save(existing);
        redisCacheService.evictRestaurantCaches(saved.getRestaurantId());
        return saved;
    }

    public void deleteFoodItem(String id) {
        FoodItem existing = getFoodById(id);
        foodItemRepository.delete(existing);
        redisCacheService.evictRestaurantCaches(existing.getRestaurantId());
    }
}

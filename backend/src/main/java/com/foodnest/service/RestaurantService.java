package com.foodnest.service;

import com.foodnest.exception.ResourceNotFoundException;
import com.foodnest.model.Restaurant;
import com.foodnest.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    private static final Logger log = LoggerFactory.getLogger(RestaurantService.class);

    private final RestaurantRepository restaurantRepository;
    private final RedisCacheService redisCacheService;

    public RestaurantService(RestaurantRepository restaurantRepository, RedisCacheService redisCacheService) {
        this.restaurantRepository = restaurantRepository;
        this.redisCacheService = redisCacheService;
    }

    /**
     * Feature 1: Restaurant Caching.
     * Checks Redis key 'foodnest:restaurants:all'. If cache miss, queries MongoDB and saves into Redis.
     */
    public List<Restaurant> getAllActiveRestaurants() {
        Optional<List> cached = redisCacheService.get(RedisCacheService.KEY_RESTAURANTS_ALL, List.class);
        if (cached.isPresent()) {
            log.info("Returned restaurants from REDIS cache");
            return cached.get();
        }

        log.info("REDIS cache miss. Querying MongoDB for active restaurants");
        List<Restaurant> list = restaurantRepository.findByActiveTrue();
        if (!list.isEmpty()) {
            redisCacheService.cacheAllRestaurants(list);
        }
        return list;
    }

    public Restaurant getRestaurantById(String id) {
        String cacheKey = RedisCacheService.PREFIX_RESTAURANT + id;
        Optional<Restaurant> cached = redisCacheService.get(cacheKey, Restaurant.class);
        if (cached.isPresent()) {
            return cached.get();
        }

        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));
        redisCacheService.cacheRestaurant(id, r);
        return r;
    }

    public List<Restaurant> searchRestaurants(String query, String cuisine, Double minRating) {
        if (query != null && !query.isBlank()) {
            return restaurantRepository.findByActiveTrueAndNameContainingIgnoreCase(query);
        }
        if (cuisine != null && !cuisine.isBlank()) {
            return restaurantRepository.findByActiveTrueAndCuisineTypesContaining(cuisine);
        }
        if (minRating != null && minRating > 0) {
            return restaurantRepository.findByActiveTrueAndRatingGreaterThanEqual(minRating);
        }
        return getAllActiveRestaurants();
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        Restaurant saved = restaurantRepository.save(restaurant);
        redisCacheService.evictRestaurantCaches(saved.getId());
        return saved;
    }

    public Restaurant updateRestaurant(String id, Restaurant updated) {
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setCuisineTypes(updated.getCuisineTypes());
        existing.setDeliveryEstimateMinutes(updated.getDeliveryEstimateMinutes());
        existing.setRating(updated.getRating());
        existing.setActive(updated.isActive());

        Restaurant saved = restaurantRepository.save(existing);
        redisCacheService.evictRestaurantCaches(id);
        return saved;
    }

    public void deleteRestaurant(String id) {
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));
        existing.setActive(false);
        restaurantRepository.save(existing);
        redisCacheService.evictRestaurantCaches(id);
    }
}

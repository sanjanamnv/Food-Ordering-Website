package com.foodnest.controller;

import com.foodnest.model.FoodItem;
import com.foodnest.model.Restaurant;
import com.foodnest.service.FoodService;
import com.foodnest.service.RestaurantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final FoodService foodService;

    public RestaurantController(RestaurantService restaurantService, FoodService foodService) {
        this.restaurantService = restaurantService;
        this.foodService = foodService;
    }

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) Double minRating) {
        if (search != null || cuisine != null || minRating != null) {
            return ResponseEntity.ok(restaurantService.searchRestaurants(search, cuisine, minRating));
        }
        return ResponseEntity.ok(restaurantService.getAllActiveRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable String id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @GetMapping("/{id}/menu")
    public ResponseEntity<List<FoodItem>> getRestaurantMenu(@PathVariable String id) {
        return ResponseEntity.ok(foodService.getMenuByRestaurant(id));
    }
}

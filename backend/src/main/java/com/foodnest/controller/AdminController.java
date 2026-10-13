package com.foodnest.controller;

import com.foodnest.dto.AdminDtos.*;
import com.foodnest.model.FoodItem;
import com.foodnest.model.Order;
import com.foodnest.model.Restaurant;
import com.foodnest.service.AdminService;
import com.foodnest.service.FoodService;
import com.foodnest.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final RestaurantService restaurantService;
    private final FoodService foodService;

    public AdminController(AdminService adminService,
                           RestaurantService restaurantService,
                           FoodService foodService) {
        this.adminService = adminService;
        this.restaurantService = restaurantService;
        this.foodService = foodService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable String id,
                                                   @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(adminService.updateOrderStatus(id, request.getStatus()));
    }

    // Restaurant Management
    @PostMapping("/restaurants")
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.createRestaurant(restaurant));
    }

    @PutMapping("/restaurants/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable String id, @RequestBody Restaurant restaurant) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, restaurant));
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Map<String, String>> deleteRestaurant(@PathVariable String id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.ok(Map.of("message", "Restaurant deactivated and evicted from cache successfully"));
    }

    // Food Item Management
    @PostMapping("/food")
    public ResponseEntity<FoodItem> createFoodItem(@RequestBody FoodItem foodItem) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodService.createFoodItem(foodItem));
    }

    @PutMapping("/food/{id}")
    public ResponseEntity<FoodItem> updateFoodItem(@PathVariable String id, @RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(foodService.updateFoodItem(id, foodItem));
    }

    @PatchMapping("/food/{id}/availability")
    public ResponseEntity<FoodItem> updateAvailability(@PathVariable String id,
                                                       @RequestBody UpdateAvailabilityRequest request) {
        return ResponseEntity.ok(foodService.updateAvailability(id, request.isAvailable()));
    }

    @PatchMapping("/food/{id}/price")
    public ResponseEntity<FoodItem> updatePrice(@PathVariable String id,
                                                @RequestBody UpdatePriceRequest request) {
        return ResponseEntity.ok(foodService.updatePrice(id, request.getPrice()));
    }

    @DeleteMapping("/food/{id}")
    public ResponseEntity<Map<String, String>> deleteFoodItem(@PathVariable String id) {
        foodService.deleteFoodItem(id);
        return ResponseEntity.ok(Map.of("message", "Food item deleted and related Redis caches evicted successfully"));
    }

    // Cache Diagnostics
    @PostMapping("/cache/clear")
    public ResponseEntity<Map<String, String>> clearRedisCache() {
        adminService.clearRedisCache();
        return ResponseEntity.ok(Map.of("message", "Redis caches cleared successfully"));
    }
}

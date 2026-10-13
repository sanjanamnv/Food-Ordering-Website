package com.foodnest.controller;

import com.foodnest.model.FoodItem;
import com.foodnest.service.FoodService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping
    public ResponseEntity<List<FoodItem>> getAllFood() {
        return ResponseEntity.ok(foodService.getAllAvailableFood());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodById(@PathVariable String id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodItem>> searchFood(@RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(foodService.searchFood(q));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FoodItem>> getFoodByCategory(@PathVariable String category) {
        return ResponseEntity.ok(foodService.getFoodByCategory(category));
    }
}

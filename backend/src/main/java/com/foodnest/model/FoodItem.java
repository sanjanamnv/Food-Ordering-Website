package com.foodnest.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB collection 'food_items'.
 * Indexed by restaurantId, category, and tags for optimal SmartBite recommendation queries.
 */
@Document(collection = "food_items")
@CompoundIndexes({
    @CompoundIndex(name = "restaurant_category_idx", def = "{'restaurantId': 1, 'category': 1}"),
    @CompoundIndex(name = "available_category_idx", def = "{'available': 1, 'category': 1}")
})
public class FoodItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Indexed
    private String restaurantId;

    private String restaurantName;

    @Indexed
    private String name;

    private String description;

    private String imageUrl;

    private double price; // in INR (₹)

    @Indexed
    private String category; // Biryani, Pizza, Burgers, South Indian, North Indian, Chinese, Desserts, Beverages, Healthy Food

    private String cuisine; // Indian, Italian, American, Chinese, Continental, etc.

    private boolean vegetarian;

    private List<String> tags = new ArrayList<>(); // e.g. "spicy", "comfort", "budget", "healthy", "sweet", "quick", "bestseller"

    private boolean available = true;

    private int preparationTimeMinutes = 20;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public FoodItem() {
    }

    public FoodItem(String restaurantId, String restaurantName, String name, String description,
                    String imageUrl, double price, String category, String cuisine,
                    boolean vegetarian, List<String> tags, boolean available) {
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.category = category;
        this.cuisine = cuisine;
        this.vegetarian = vegetarian;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.available = available;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public boolean isVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        this.vegetarian = vegetarian;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }

    public void setPreparationTimeMinutes(int preparationTimeMinutes) {
        this.preparationTimeMinutes = preparationTimeMinutes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

package com.foodnest.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.Instant;

/**
 * MongoDB collection 'reviews'.
 */
@Document(collection = "reviews")
@CompoundIndex(name = "restaurant_rating_idx", def = "{'restaurantId': 1, 'rating': -1}")
public class Review implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    private String userId;
    private String userName;
    private String restaurantId;
    private String foodItemId;
    private int rating; // 1 to 5
    private String comment;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public Review() {
    }

    public Review(String userId, String userName, String restaurantId, String foodItemId, int rating, String comment) {
        this.userId = userId;
        this.userName = userName;
        this.restaurantId = restaurantId;
        this.foodItemId = foodItemId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(String foodItemId) {
        this.foodItemId = foodItemId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

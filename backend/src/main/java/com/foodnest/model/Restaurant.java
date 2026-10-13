package com.foodnest.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB collection 'restaurants'.
 * Frequently read and cached in Redis with key prefix 'foodnest:restaurants:all' and 'foodnest:restaurant:{id}'.
 */
@Document(collection = "restaurants")
public class Restaurant implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    private String imageUrl;

    private List<String> cuisineTypes = new ArrayList<>();

    private double rating = 4.5;

    private int reviewCount = 0;

    private int deliveryEstimateMinutes = 30;

    private double minimumOrderAmount = 0.0;

    private String addressCity;

    private boolean active = true;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public Restaurant() {
    }

    public Restaurant(String name, String description, String imageUrl, List<String> cuisineTypes,
                      double rating, int deliveryEstimateMinutes, String addressCity) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.cuisineTypes = cuisineTypes;
        this.rating = rating;
        this.deliveryEstimateMinutes = deliveryEstimateMinutes;
        this.addressCity = addressCity;
        this.active = true;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public List<String> getCuisineTypes() {
        return cuisineTypes;
    }

    public void setCuisineTypes(List<String> cuisineTypes) {
        this.cuisineTypes = cuisineTypes;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public int getDeliveryEstimateMinutes() {
        return deliveryEstimateMinutes;
    }

    public void setDeliveryEstimateMinutes(int deliveryEstimateMinutes) {
        this.deliveryEstimateMinutes = deliveryEstimateMinutes;
    }

    public double getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(double minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }

    public String getAddressCity() {
        return addressCity;
    }

    public void setAddressCity(String addressCity) {
        this.addressCity = addressCity;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

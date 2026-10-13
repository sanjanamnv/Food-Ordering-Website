package com.foodnest.repository;

import com.foodnest.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);
    List<Review> findByFoodItemIdOrderByCreatedAtDesc(String foodItemId);
}

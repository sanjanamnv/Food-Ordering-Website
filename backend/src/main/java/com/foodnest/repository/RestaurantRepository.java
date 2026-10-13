package com.foodnest.repository;

import com.foodnest.model.Restaurant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends MongoRepository<Restaurant, String> {
    List<Restaurant> findByActiveTrue();
    List<Restaurant> findByActiveTrueAndNameContainingIgnoreCase(String name);
    List<Restaurant> findByActiveTrueAndCuisineTypesContaining(String cuisine);
    List<Restaurant> findByActiveTrueAndRatingGreaterThanEqual(double minRating);
}

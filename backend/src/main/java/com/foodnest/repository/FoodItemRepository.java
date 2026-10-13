package com.foodnest.repository;

import com.foodnest.model.FoodItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends MongoRepository<FoodItem, String> {

    List<FoodItem> findByRestaurantIdAndAvailableTrue(String restaurantId);

    List<FoodItem> findByRestaurantId(String restaurantId);

    List<FoodItem> findByAvailableTrue();

    List<FoodItem> findByCategoryIgnoreCaseAndAvailableTrue(String category);

    @Query("{ 'available': true, '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'description': { '$regex': ?0, '$options': 'i' } }, { 'category': { '$regex': ?0, '$options': 'i' } } ] }")
    List<FoodItem> searchAvailableFood(String query);

    List<FoodItem> findByTagsContainingAndAvailableTrue(String tag);

    List<FoodItem> findByVegetarianAndAvailableTrue(boolean vegetarian);

    List<FoodItem> findByPriceLessThanEqualAndAvailableTrue(double maxPrice);
}

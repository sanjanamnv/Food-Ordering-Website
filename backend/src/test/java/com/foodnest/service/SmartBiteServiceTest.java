package com.foodnest.service;

import com.foodnest.dto.SmartBiteDtos.RecommendationResponse;
import com.foodnest.model.FoodItem;
import com.foodnest.repository.FoodItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SmartBiteServiceTest {

    @Mock
    private FoodItemRepository foodItemRepository;

    @Mock
    private RedisCacheService redisCacheService;

    @InjectMocks
    private SmartBiteService smartBiteService;

    private FoodItem spicyChickenBiryani;
    private FoodItem vegDosa;

    @BeforeEach
    void setUp() {
        spicyChickenBiryani = new FoodItem(
                "rest-1", "Paradise Biryani", "Spicy Chicken Biryani",
                "Spicy aromatic dum biryani", "url1", 280.0,
                "Biryani", "Indian", false, Arrays.asList("spicy", "comfort"), true
        );

        vegDosa = new FoodItem(
                "rest-2", "Udupi Bhavan", "Mysore Masala Dosa",
                "Crispy golden crepe with potato filling", "url2", 120.0,
                "South Indian", "Indian", true, Arrays.asList("vegetarian", "budget", "quick"), true
        );
    }

    @Test
    void testGetRecommendations_CacheMiss_ReturnsCalculatedFromMongo() {
        // Given Redis cache returns empty
        when(redisCacheService.buildRecommendationKey(any(), any(), any(), any()))
                .thenReturn("foodnest:recommendations:spicy:any:any:any");
        when(redisCacheService.get("foodnest:recommendations:spicy:any:any:any", List.class))
                .thenReturn(Optional.empty());

        when(foodItemRepository.findByAvailableTrue())
                .thenReturn(Arrays.asList(spicyChickenBiryani, vegDosa));

        // When
        RecommendationResponse response = smartBiteService.getRecommendations("spicy", null, false, null);

        // Then
        assertNotNull(response);
        assertEquals("MONGODB_CACHE_MISS", response.getCacheSource());
        assertFalse(response.getRecommendations().isEmpty());
        assertEquals("Spicy Chicken Biryani", response.getRecommendations().get(0).getFoodItem().getName());
        assertTrue(response.getRecommendations().get(0).getMatchReason().contains("fiery spicy"));

        // Verify result was stored in Redis
        verify(redisCacheService, times(1)).cacheRecommendations(eq("foodnest:recommendations:spicy:any:any:any"), any());
    }

    @Test
    void testGetRecommendations_VegetarianFilterEnforced() {
        when(redisCacheService.buildRecommendationKey(any(), any(), any(), any()))
                .thenReturn("foodnest:recommendations:all:any:veg:any");
        when(redisCacheService.get(anyString(), eq(List.class))).thenReturn(Optional.empty());
        when(foodItemRepository.findByAvailableTrue()).thenReturn(Arrays.asList(spicyChickenBiryani, vegDosa));

        // When
        RecommendationResponse response = smartBiteService.getRecommendations("all", null, true, null);

        // Then
        for (var rec : response.getRecommendations()) {
            assertTrue(rec.getFoodItem().isVegetarian(), "All recommended items must be vegetarian when filter is true");
        }
    }
}

package com.foodnest.dto;

import com.foodnest.model.FoodItem;

import java.io.Serializable;
import java.util.List;

public class SmartBiteDtos {

    public static class RecommendationItemDto implements Serializable {
        private static final long serialVersionUID = 1L;

        private FoodItem foodItem;
        private String matchReason; // Explains WHY this was recommended based on filter/mood
        private double matchScore;

        public RecommendationItemDto() {}

        public RecommendationItemDto(FoodItem foodItem, String matchReason, double matchScore) {
            this.foodItem = foodItem;
            this.matchReason = matchReason;
            this.matchScore = matchScore;
        }

        public FoodItem getFoodItem() { return foodItem; }
        public void setFoodItem(FoodItem foodItem) { this.foodItem = foodItem; }
        public String getMatchReason() { return matchReason; }
        public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
        public double getMatchScore() { return matchScore; }
        public void setMatchScore(double matchScore) { this.matchScore = matchScore; }
    }

    public static class RecommendationResponse implements Serializable {
        private static final long serialVersionUID = 1L;

        private List<RecommendationItemDto> recommendations;
        private String cacheSource; // "REDIS_CACHE_HIT" or "MONGODB_CACHE_MISS"
        private String cacheKey;
        private long responseTimeMs;
        private int totalFound;

        public RecommendationResponse() {}

        public RecommendationResponse(List<RecommendationItemDto> recommendations, String cacheSource,
                                      String cacheKey, long responseTimeMs, int totalFound) {
            this.recommendations = recommendations;
            this.cacheSource = cacheSource;
            this.cacheKey = cacheKey;
            this.responseTimeMs = responseTimeMs;
            this.totalFound = totalFound;
        }

        public List<RecommendationItemDto> getRecommendations() { return recommendations; }
        public void setRecommendations(List<RecommendationItemDto> recommendations) { this.recommendations = recommendations; }
        public String getCacheSource() { return cacheSource; }
        public void setCacheSource(String cacheSource) { this.cacheSource = cacheSource; }
        public String getCacheKey() { return cacheKey; }
        public void setCacheKey(String cacheKey) { this.cacheKey = cacheKey; }
        public long getResponseTimeMs() { return responseTimeMs; }
        public void setResponseTimeMs(long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
        public int getTotalFound() { return totalFound; }
        public void setTotalFound(int totalFound) { this.totalFound = totalFound; }
    }
}

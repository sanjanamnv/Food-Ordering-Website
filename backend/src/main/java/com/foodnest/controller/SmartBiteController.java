package com.foodnest.controller;

import com.foodnest.dto.SmartBiteDtos.RecommendationResponse;
import com.foodnest.service.SmartBiteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/smartbite")
public class SmartBiteController {

    private final SmartBiteService smartBiteService;

    public SmartBiteController(SmartBiteService smartBiteService) {
        this.smartBiteService = smartBiteService;
    }

    /**
     * SmartBite Personalized Recommendation REST API.
     * Integrates MongoDB document filtering with Redis TTL caching.
     */
    @GetMapping("/recommendations")
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @RequestParam(required = false, defaultValue = "comfort") String mood,
            @RequestParam(required = false) Double maxBudget,
            @RequestParam(required = false) Boolean vegetarianOnly,
            @RequestParam(required = false) String cuisine) {

        RecommendationResponse response = smartBiteService.getRecommendations(mood, maxBudget, vegetarianOnly, cuisine);
        return ResponseEntity.ok(response);
    }
}

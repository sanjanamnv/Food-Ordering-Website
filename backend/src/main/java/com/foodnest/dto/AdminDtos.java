package com.foodnest.dto;

import com.foodnest.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class AdminDtos {

    public static class DashboardStatsDto {
        private long totalOrders;
        private long totalCustomers;
        private long totalRestaurants;
        private long totalFoodItems;
        private double totalRevenue;
        private long activeOrders;
        private long redisCacheHits;
        private long redisCacheMisses;

        public DashboardStatsDto() {}

        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
        public long getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
        public long getTotalRestaurants() { return totalRestaurants; }
        public void setTotalRestaurants(long totalRestaurants) { this.totalRestaurants = totalRestaurants; }
        public long getTotalFoodItems() { return totalFoodItems; }
        public void setTotalFoodItems(long totalFoodItems) { this.totalFoodItems = totalFoodItems; }
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        public long getActiveOrders() { return activeOrders; }
        public void setActiveOrders(long activeOrders) { this.activeOrders = activeOrders; }
        public long getRedisCacheHits() { return redisCacheHits; }
        public void setRedisCacheHits(long redisCacheHits) { this.redisCacheHits = redisCacheHits; }
        public long getRedisCacheMisses() { return redisCacheMisses; }
        public void setRedisCacheMisses(long redisCacheMisses) { this.redisCacheMisses = redisCacheMisses; }
    }

    public static class UpdateOrderStatusRequest {
        @NotNull(message = "Order status is required")
        private OrderStatus status;

        public UpdateOrderStatusRequest() {}

        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
    }

    public static class UpdateAvailabilityRequest {
        private boolean available;

        public UpdateAvailabilityRequest() {}

        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }

    public static class UpdatePriceRequest {
        private double price;

        public UpdatePriceRequest() {}

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
    }
}

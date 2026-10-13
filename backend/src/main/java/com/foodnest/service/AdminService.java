package com.foodnest.service;

import com.foodnest.dto.AdminDtos.*;
import com.foodnest.exception.BadRequestException;
import com.foodnest.exception.ResourceNotFoundException;
import com.foodnest.model.Order;
import com.foodnest.model.OrderStatus;
import com.foodnest.model.Role;
import com.foodnest.repository.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final RedisCacheService redisCacheService;

    public AdminService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        RestaurantRepository restaurantRepository,
                        FoodItemRepository foodItemRepository,
                        RedisCacheService redisCacheService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.redisCacheService = redisCacheService;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalCustomers(userRepository.count());
        stats.setTotalRestaurants(restaurantRepository.count());
        stats.setTotalFoodItems(foodItemRepository.count());

        List<Order> allOrders = orderRepository.findAll();
        double revenue = allOrders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();
        stats.setTotalRevenue(Math.round(revenue * 100.0) / 100.0);

        long active = allOrders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.DELIVERED && o.getOrderStatus() != OrderStatus.CANCELLED)
                .count();
        stats.setActiveOrders(active);

        stats.setRedisCacheHits(redisCacheService.getCacheHits());
        stats.setRedisCacheMisses(redisCacheService.getCacheMisses());

        return stats;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus current = order.getOrderStatus();
        if (current == OrderStatus.DELIVERED || current == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot update terminal order status: " + current);
        }

        order.setOrderStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setPaymentStatus("PAID");
        }
        order.setUpdatedAt(Instant.now());

        return orderRepository.save(order);
    }

    public void clearRedisCache() {
        redisCacheService.evictRestaurantCaches(null);
        redisCacheService.evictAllRecommendations();
    }
}

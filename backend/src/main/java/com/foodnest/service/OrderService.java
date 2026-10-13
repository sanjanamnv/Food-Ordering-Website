package com.foodnest.service;

import com.foodnest.dto.OrderDtos.*;
import com.foodnest.exception.BadRequestException;
import com.foodnest.exception.ResourceNotFoundException;
import com.foodnest.model.*;
import com.foodnest.repository.CouponRepository;
import com.foodnest.repository.FoodItemRepository;
import com.foodnest.repository.OrderRepository;
import com.foodnest.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        FoodItemRepository foodItemRepository,
                        CouponRepository couponRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
    }

    /**
     * Safe Server-Side Order Processing.
     * Prices and totals are recalculated authoritatively from MongoDB.
     */
    public Order createOrder(String userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one food item.");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0.0;
        String restaurantId = null;
        String restaurantName = null;

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Item quantity must be greater than zero.");
            }

            FoodItem food = foodItemRepository.findById(itemReq.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found: " + itemReq.getFoodItemId()));

            if (!food.isAvailable()) {
                throw new BadRequestException("Item '" + food.getName() + "' is currently unavailable. Please remove it from your cart.");
            }

            if (restaurantId == null) {
                restaurantId = food.getRestaurantId();
                restaurantName = food.getRestaurantName();
            }

            OrderItem orderItem = new OrderItem(
                    food.getId(),
                    food.getName(),
                    food.getImageUrl(),
                    food.getPrice(),
                    itemReq.getQuantity(),
                    food.isVegetarian()
            );

            subtotal += orderItem.getItemTotal();
            orderItems.add(orderItem);
        }

        subtotal = Math.round(subtotal * 100.0) / 100.0;

        // Delivery Fee calculation (₹40, free if subtotal > ₹500)
        double deliveryFee = (subtotal >= 500.0) ? 0.0 : 40.0;

        // Coupon calculation
        double discount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndActiveTrue(request.getCouponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                discount = coupon.calculateDiscount(subtotal);
            }
        }

        // Tax calculation (5% GST on discounted subtotal)
        double taxableAmount = Math.max(0.0, subtotal - discount);
        double tax = Math.round((taxableAmount * 0.05) * 100.0) / 100.0;

        double totalAmount = Math.round((taxableAmount + deliveryFee + tax) * 100.0) / 100.0;

        // Build unique human-readable order number (e.g. FN-20261012-7842)
        String orderNumber = "FN-" + DateTimeFormatter.BASIC_ISO_DATE.format(Instant.now().atZone(java.time.ZoneOffset.UTC))
                + "-" + ThreadLocalRandom.current().nextInt(1000, 9999);

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUserId(userId);
        order.setCustomerName(user.getName());
        order.setCustomerEmail(user.getEmail());
        order.setCustomerPhone(user.getPhone());
        order.setRestaurantId(restaurantId);
        order.setRestaurantName(restaurantName != null ? restaurantName : "FoodNest Kitchen");
        order.setItems(orderItems);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setDiscount(discount);
        order.setTax(tax);
        order.setTotalAmount(totalAmount);
        order.setCouponCode(request.getCouponCode());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH_ON_DELIVERY");
        order.setPaymentStatus("CASH_ON_DELIVERY".equalsIgnoreCase(order.getPaymentMethod()) ? "PENDING" : "PAID");
        order.setOrderStatus(OrderStatus.ORDER_PLACED);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        Order saved = orderRepository.save(order);
        log.info("Successfully placed order {} for user {} with total ₹{}", saved.getOrderNumber(), userId, saved.getTotalAmount());
        return saved;
    }

    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderById(String orderId, String userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You do not have permission to view this order.");
        }
        return order;
    }

    public Order cancelOrder(String orderId, String userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You can only cancel your own orders.");
        }

        // Cancellation rules: only ORDER_PLACED or CONFIRMED can be cancelled
        if (order.getOrderStatus() != OrderStatus.ORDER_PLACED && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in state '" + order.getOrderStatus() + "'. It is already being prepared or out for delivery.");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason != null ? reason : "Cancelled by customer");
        order.setUpdatedAt(Instant.now());

        return orderRepository.save(order);
    }
}

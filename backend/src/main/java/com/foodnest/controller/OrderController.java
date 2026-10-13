package com.foodnest.controller;

import com.foodnest.dto.OrderDtos.CreateOrderRequest;
import com.foodnest.model.Order;
import com.foodnest.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Order created = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getOrderById(id, userId, isAdmin));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable String id,
                                            @RequestBody(required = false) Map<String, String> body,
                                            Authentication auth) {
        String userId = (String) auth.getPrincipal();
        String reason = (body != null) ? body.get("reason") : "Customer requested cancellation";
        return ResponseEntity.ok(orderService.cancelOrder(id, userId, reason));
    }
}

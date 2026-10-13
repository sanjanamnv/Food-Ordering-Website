package com.foodnest.dto;

import com.foodnest.model.Address;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OrderDtos {

    public static class CreateOrderItemRequest {
        @NotNull(message = "Food item ID is required")
        private String foodItemId;

        private int quantity = 1;

        public CreateOrderItemRequest() {}

        public String getFoodItemId() { return foodItemId; }
        public void setFoodItemId(String foodItemId) { this.foodItemId = foodItemId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class CreateOrderRequest {
        @NotEmpty(message = "Cart cannot be empty")
        @Valid
        private List<CreateOrderItemRequest> items;

        @NotNull(message = "Delivery address is required")
        @Valid
        private Address deliveryAddress;

        private String couponCode;

        private String paymentMethod = "CASH_ON_DELIVERY"; // or "SIMULATED_ONLINE_UPI"

        public CreateOrderRequest() {}

        public List<CreateOrderItemRequest> getItems() { return items; }
        public void setItems(List<CreateOrderItemRequest> items) { this.items = items; }
        public Address getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(Address deliveryAddress) { this.deliveryAddress = deliveryAddress; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }
}

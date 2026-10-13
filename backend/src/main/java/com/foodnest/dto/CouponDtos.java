package com.foodnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class CouponDtos {

    public static class ValidateCouponRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;

        @Positive(message = "Subtotal must be positive")
        private double subtotal;

        public ValidateCouponRequest() {}

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public double getSubtotal() { return subtotal; }
        public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
    }

    public static class CouponValidationResponse {
        private boolean valid;
        private String code;
        private String message;
        private double discount;
        private double finalTotal;

        public CouponValidationResponse() {}

        public CouponValidationResponse(boolean valid, String code, String message, double discount, double finalTotal) {
            this.valid = valid;
            this.code = code;
            this.message = message;
            this.discount = discount;
            this.finalTotal = finalTotal;
        }

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public double getDiscount() { return discount; }
        public void setDiscount(double discount) { this.discount = discount; }
        public double getFinalTotal() { return finalTotal; }
        public void setFinalTotal(double finalTotal) { this.finalTotal = finalTotal; }
    }
}

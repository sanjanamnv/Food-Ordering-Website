package com.foodnest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.Instant;

/**
 * MongoDB collection 'coupons'.
 * Stores discount configurations such as percentage or flat amount off.
 */
@Document(collection = "coupons")
public class Coupon implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Indexed(unique = true)
    private String code; // e.g., "WELCOME50", "TASTY20", "FLAT100"

    private String description;

    private String discountType; // "PERCENTAGE" or "FLAT"

    private double discountValue; // e.g. 50% or 100 INR

    private double minimumOrderAmount; // Minimum basket size to qualify

    private double maximumDiscount; // Cap for percentage discounts

    private boolean active = true;

    private Instant validFrom = Instant.now();

    private Instant validUntil = Instant.now().plusSeconds(86400 * 365); // 1 year default

    public Coupon() {
    }

    public Coupon(String code, String description, String discountType, double discountValue,
                  double minimumOrderAmount, double maximumDiscount, boolean active) {
        this.code = code != null ? code.toUpperCase().trim() : null;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.minimumOrderAmount = minimumOrderAmount;
        this.maximumDiscount = maximumDiscount;
        this.active = active;
        this.validFrom = Instant.now();
        this.validUntil = Instant.now().plusSeconds(86400 * 365);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code != null ? code.toUpperCase().trim() : null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(double discountValue) {
        this.discountValue = discountValue;
    }

    public double getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(double minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }

    public double getMaximumDiscount() {
        return maximumDiscount;
    }

    public void setMaximumDiscount(double maximumDiscount) {
        this.maximumDiscount = maximumDiscount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(Instant validFrom) {
        this.validFrom = validFrom;
    }

    public Instant getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(Instant validUntil) {
        this.validUntil = validUntil;
    }

    /**
     * Compute actual discount on given subtotal according to business rules.
     */
    public double calculateDiscount(double subtotal) {
        if (!active || subtotal < minimumOrderAmount) {
            return 0.0;
        }
        Instant now = Instant.now();
        if (validFrom != null && now.isBefore(validFrom)) return 0.0;
        if (validUntil != null && now.isAfter(validUntil)) return 0.0;

        double disc = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
            disc = (subtotal * discountValue) / 100.0;
            if (maximumDiscount > 0 && disc > maximumDiscount) {
                disc = maximumDiscount;
            }
        } else if ("FLAT".equalsIgnoreCase(discountType)) {
            disc = Math.min(discountValue, subtotal);
        }
        return Math.round(disc * 100.0) / 100.0;
    }
}

package com.foodnest.model;

/**
 * 5-Stage Order Lifecycle Status:
 * ORDER_PLACED -> CONFIRMED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED (or CANCELLED)
 */
public enum OrderStatus {
    ORDER_PLACED,
    CONFIRMED,
    PREPARING,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}

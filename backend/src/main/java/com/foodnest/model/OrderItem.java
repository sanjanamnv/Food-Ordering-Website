package com.foodnest.model;

import java.io.Serializable;

/**
 * Embedded snapshot of ordered item.
 * Preserves the exact name, unit price, quantity, and subtotal at the moment of checkout,
 * ensuring historical order audits remain immutable even if the restaurant subsequently modifies prices.
 */
public class OrderItem implements Serializable {

    private static final long serialVersionUID = 1L;

    private String foodItemId;
    private String name;
    private String imageUrl;
    private double unitPrice; // in INR (₹)
    private int quantity;
    private double itemTotal;
    private boolean vegetarian;

    public OrderItem() {
    }

    public OrderItem(String foodItemId, String name, String imageUrl, double unitPrice, int quantity, boolean vegetarian) {
        this.foodItemId = foodItemId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.itemTotal = unitPrice * quantity;
        this.vegetarian = vegetarian;
    }

    public String getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(String foodItemId) {
        this.foodItemId = foodItemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
        this.itemTotal = this.unitPrice * quantity;
    }

    public double getItemTotal() {
        return itemTotal;
    }

    public void setItemTotal(double itemTotal) {
        this.itemTotal = itemTotal;
    }

    public boolean isVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        this.vegetarian = vegetarian;
    }
}

package com.foodnest.model;

import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

/**
 * Embedded document inside User profile and Order snapshots.
 * Demonstrates document modeling for nested customer addresses in MongoDB.
 */
public class Address implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Street address is required")
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pin code / Postal code is required")
    private String pincode;

    private String landmark;

    public Address() {
    }

    public Address(String street, String city, String state, String pincode, String landmark) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.landmark = landmark;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getFullFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        if (street != null) sb.append(street).append(", ");
        if (landmark != null && !landmark.isBlank()) sb.append(landmark).append(", ");
        if (city != null) sb.append(city).append(", ");
        if (state != null) sb.append(state).append(" - ");
        if (pincode != null) sb.append(pincode);
        return sb.toString();
    }
}

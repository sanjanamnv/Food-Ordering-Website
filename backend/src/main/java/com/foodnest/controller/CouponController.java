package com.foodnest.controller;

import com.foodnest.dto.CouponDtos.*;
import com.foodnest.model.Coupon;
import com.foodnest.repository.CouponRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponRepository couponRepository;

    public CouponController(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validateCoupon(@Valid @RequestBody ValidateCouponRequest request) {
        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCaseAndActiveTrue(request.getCode().trim());
        if (opt.isEmpty()) {
            return ResponseEntity.ok(new CouponValidationResponse(
                    false, request.getCode(), "Invalid or expired coupon code", 0.0, request.getSubtotal()
            ));
        }

        Coupon coupon = opt.get();
        if (request.getSubtotal() < coupon.getMinimumOrderAmount()) {
            return ResponseEntity.ok(new CouponValidationResponse(
                    false, request.getCode(),
                    "Minimum order of ₹" + coupon.getMinimumOrderAmount() + " required to apply this coupon",
                    0.0, request.getSubtotal()
            ));
        }

        double discount = coupon.calculateDiscount(request.getSubtotal());
        double finalTotal = Math.max(0.0, request.getSubtotal() - discount);

        return ResponseEntity.ok(new CouponValidationResponse(
                true, coupon.getCode(), "Coupon applied successfully!", discount, finalTotal
        ));
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }
}

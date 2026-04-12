package com.resumebuilder.controller;

import com.resumebuilder.dto.request.PaymentRequest;
import com.resumebuilder.dto.request.PaymentVerificationRequest;
import com.resumebuilder.dto.response.ApiResponse;
import com.resumebuilder.dto.response.PaymentResponse;
import com.resumebuilder.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse> createOrder(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Payment create-order request received for user: {}", userDetails != null ? userDetails.getUsername() : "null");
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
            }
            PaymentResponse response = paymentService.createOrder(request, userDetails.getUsername());
            log.info("Order created: {}", response.getRazorpayOrderId());
            return ResponseEntity.ok(ApiResponse.success("Order created successfully", response));
        } catch (Throwable e) {
            log.error("Error in create-order: {} - {}", e.getClass().getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Payment verify request for order: {}", request.getRazorpayOrderId());
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
            }
            paymentService.verifyPayment(request, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully"));
        } catch (Throwable e) {
            log.error("Error in verify-payment: {} - {}", e.getClass().getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Payment verification failed: " + e.getMessage()));
        }
    }
}

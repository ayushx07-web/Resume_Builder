package com.resumebuilder.service;

import com.resumebuilder.dto.request.PaymentRequest;
import com.resumebuilder.dto.request.PaymentVerificationRequest;
import com.resumebuilder.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse createOrder(PaymentRequest request, String username) throws Exception;
    void verifyPayment(PaymentVerificationRequest request, String username) throws Exception;
}

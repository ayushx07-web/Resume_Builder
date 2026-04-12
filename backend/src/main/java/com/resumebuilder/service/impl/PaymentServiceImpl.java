package com.resumebuilder.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.resumebuilder.dto.request.PaymentRequest;
import com.resumebuilder.dto.request.PaymentVerificationRequest;
import com.resumebuilder.dto.response.PaymentResponse;
import com.resumebuilder.entity.Payment;
import com.resumebuilder.entity.Subscription;
import com.resumebuilder.entity.User;
import com.resumebuilder.repository.PaymentRepository;
import com.resumebuilder.repository.SubscriptionRepository;
import com.resumebuilder.repository.UserRepository;
import com.resumebuilder.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;


@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    @Transactional
    public PaymentResponse createOrder(PaymentRequest request, String username) throws Exception {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create Order Request in Razorpay
        JSONObject orderRequest = new JSONObject();
        // Razorpay accepts amount in subunits (paise for INR)
        int amountInPaise = request.getAmount().multiply(new BigDecimal(100)).intValue();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", request.getCurrency() != null ? request.getCurrency() : "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        // Save Payment details in our Database
        Payment payment = Payment.builder()
                .user(user)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .razorpayOrderId(razorpayOrder.get("id"))
                .status(Payment.PaymentStatus.PENDING)
                .paymentType(Payment.PaymentType.valueOf(request.getPaymentType()))
                .templateId(request.getTemplateId())
                .description(request.getDescription())
                .build();
        
        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(user.getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .status(payment.getStatus().name())
                .paymentType(payment.getPaymentType().name())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void verifyPayment(PaymentVerificationRequest request, String username) throws Exception {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment record not found mapping to order id"));

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to verify this payment");
        }

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        boolean isValidSignature = Utils.verifyPaymentSignature(options, keySecret);

        if (isValidSignature) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.markAsSuccess();
            paymentRepository.save(payment);

            // If it's a subscription, activate or update subscription
            if (payment.getPaymentType() == Payment.PaymentType.SUBSCRIPTION && payment.getDescription() != null) {
                Subscription.SubscriptionPlan plan;
                if (payment.getDescription().contains("Yearly")) {
                    plan = Subscription.SubscriptionPlan.YEARLY;
                } else if (payment.getDescription().contains("Quarterly")) {
                    plan = Subscription.SubscriptionPlan.QUARTERLY;
                } else {
                    plan = Subscription.SubscriptionPlan.MONTHLY;
                }

                Subscription subscription = user.getSubscription();
                if (subscription == null) {
                    subscription = Subscription.builder()
                            .user(user)
                            .plan(plan)
                            .status(Subscription.SubscriptionStatus.ACTIVE)
                            .price(payment.getAmount())
                            .build();
                    subscription.renew();
                } else {
                    subscription.setPlan(plan);
                    subscription.renew();
                }
                subscriptionRepository.save(subscription);
            }
        } else {
            payment.markAsFailed("Invalid Razorpay Signature");
            paymentRepository.save(payment);
            throw new RuntimeException("Invalid payment signature");
        }
    }
}

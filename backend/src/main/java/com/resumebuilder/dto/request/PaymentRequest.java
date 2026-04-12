package com.resumebuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    
    private String currency = "INR";
    
    @NotBlank(message = "Payment type is required")
    private String paymentType;
    
    private Long templateId;
    
    private String subscriptionPlan;
    
    private String description;
}

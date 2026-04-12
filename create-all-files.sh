#!/bin/bash

# This script creates all remaining backend files for the Resume Builder application

# Create remaining Request DTOs
cat > backend/src/main/java/com/resumebuilder/dto/request/ResumeRequest.java << 'EOF'
package com.resumebuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private Long templateId;

    @NotBlank(message = "Content is required")
    private String content;

    private Boolean isDraft = true;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/request/ForgotPasswordRequest.java << 'EOF'
package com.resumebuilder.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/request/ResetPasswordRequest.java << 'EOF'
package com.resumebuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordRequest {

    @NotBlank(message = "Token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String newPassword;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/request/TemplateRequest.java << 'EOF'
package com.resumebuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String previewImageUrl;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Premium status is required")
    private Boolean isPremium;

    private BigDecimal price;

    private String configuration;

    private Boolean isActive = true;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/request/PaymentRequest.java << 'EOF'
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
EOF

cat > backend/src/main/java/com/resumebuilder/dto/request/PaymentVerificationRequest.java << 'EOF'
package com.resumebuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerificationRequest {

    @NotBlank(message = "Razorpay order ID is required")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay signature is required")
    private String razorpaySignature;
}
EOF

# Create Response DTOs
cat > backend/src/main/java/com/resumebuilder/dto/response/AuthResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/response/UserResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private Boolean active;
    private Boolean hasPremiumAccess;
    private LocalDateTime createdAt;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/response/ResumeResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeResponse {
    private Long id;
    private String title;
    private Long userId;
    private Long templateId;
    private String templateName;
    private String content;
    private Boolean isDraft;
    private LocalDateTime lastSavedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/response/TemplateResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateResponse {
    private Long id;
    private String name;
    private String description;
    private String previewImageUrl;
    private String category;
    private Boolean isPremium;
    private BigDecimal price;
    private Boolean isActive;
    private Long downloadCount;
    private String configuration;
    private LocalDateTime createdAt;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/response/PaymentResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String status;
    private String paymentType;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/response/SubscriptionResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponse {
    private Long id;
    private Long userId;
    private String plan;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean autoRenew;
    private BigDecimal price;
    private Boolean isActive;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/response/ApiResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse {
    private Boolean success;
    private String message;
    private Object data;
}
EOF

cat > backend/src/main/java/com/resumebuilder/dto/response/PageResponse.java << 'EOF'
package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
EOF

echo "All DTO files created successfully!"


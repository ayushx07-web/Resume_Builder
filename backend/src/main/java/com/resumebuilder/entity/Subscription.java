package com.resumebuilder.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Subscription entity for premium membership management
 * Tracks subscription periods and renewal dates
 */
@Entity
@Table(name = "subscriptions", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_end_date", columnList = "end_date")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "auto_renew")
    @Builder.Default
    private Boolean autoRenew = false;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "razorpay_subscription_id")
    private String razorpaySubscriptionId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SubscriptionPlan {
        MONTHLY,
        QUARTERLY,
        YEARLY
    }

    public enum SubscriptionStatus {
        ACTIVE,
        EXPIRED,
        CANCELLED
    }

    /**
     * Check if subscription is currently active
     */
    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE && 
               LocalDateTime.now().isBefore(endDate);
    }

    /**
     * Check if subscription has expired
     */
    public boolean hasExpired() {
        return LocalDateTime.now().isAfter(endDate);
    }

    /**
     * Cancel subscription
     */
    public void cancel() {
        this.status = SubscriptionStatus.CANCELLED;
        this.autoRenew = false;
    }

    /**
     * Renew subscription for the plan duration
     */
    public void renew() {
        this.startDate = LocalDateTime.now();
        this.endDate = calculateEndDate(this.plan);
        this.status = SubscriptionStatus.ACTIVE;
    }

    /**
     * Calculate end date based on plan
     */
    private LocalDateTime calculateEndDate(SubscriptionPlan plan) {
        LocalDateTime now = LocalDateTime.now();
        return switch (plan) {
            case MONTHLY -> now.plusMonths(1);
            case QUARTERLY -> now.plusMonths(3);
            case YEARLY -> now.plusYears(1);
        };
    }
}

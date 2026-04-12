package com.resumebuilder.repository;

import com.resumebuilder.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Payment entity operations
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Find payment by Razorpay order ID
     */
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    /**
     * Find payment by Razorpay payment ID
     */
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    /**
     * Find all payments by user ID
     */
    Page<Payment> findByUserId(Long userId, Pageable pageable);

    /**
     * Find payments by user ID and status
     */
    List<Payment> findByUserIdAndStatus(Long userId, Payment.PaymentStatus status);

    /**
     * Find payments by status
     */
    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);

    /**
     * Find successful payments by user
     */
    List<Payment> findByUserIdAndStatus(Long userId, Payment.PaymentStatus status, Pageable pageable);

    /**
     * Count payments by status
     */
    long countByStatus(Payment.PaymentStatus status);

    /**
     * Calculate total revenue
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    Double calculateTotalRevenue(Payment.PaymentStatus status);

    /**
     * Find payments within date range
     */
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    List<Payment> findPaymentsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find recent successful payments
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'SUCCESS' ORDER BY p.completedAt DESC")
    List<Payment> findRecentSuccessfulPayments(Pageable pageable);
}

package com.resumebuilder.repository;

import com.resumebuilder.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findByUserId(Long userId);

    Page<Subscription> findByStatus(Subscription.SubscriptionStatus status, Pageable pageable);

    List<Subscription> findByPlan(Subscription.SubscriptionPlan plan);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate > :now")
    List<Subscription> findActiveSubscriptions(LocalDateTime now);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate BETWEEN :now AND :expiryDate")
    List<Subscription> findExpiringSubscriptions(LocalDateTime now, LocalDateTime expiryDate);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate < :now")
    List<Subscription> findExpiredActiveSubscriptions(LocalDateTime now);

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate > :now")
    long countActiveSubscriptions(LocalDateTime now);

    long countByPlan(Subscription.SubscriptionPlan plan);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Subscription s WHERE s.user.id = :userId AND s.status = 'ACTIVE' AND s.endDate > :now")
    boolean hasActiveSubscription(Long userId, LocalDateTime now);
}
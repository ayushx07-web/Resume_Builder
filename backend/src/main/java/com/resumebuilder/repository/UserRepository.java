package com.resumebuilder.repository;

import com.resumebuilder.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity operations
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by username
     */
    Optional<User> findByUsername(String username);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Find user by reset token
     */
    Optional<User> findByResetToken(String resetToken);

    /**
     * Find all active users with pagination
     */
    Page<User> findByActive(Boolean active, Pageable pageable);

    /**
     * Find users by role with pagination
     */
    Page<User> findByRole(User.Role role, Pageable pageable);

    /**
     * Search users by email or username
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(String searchTerm, Pageable pageable);

    /**
     * Count active users
     */
    long countByActive(Boolean active);

    /**
     * Count users by role
     */
    long countByRole(User.Role role);
}

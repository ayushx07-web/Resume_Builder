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
import java.util.HashSet;
import java.util.Set;

/**
 * Template entity for resume templates
 * Supports both free and premium templates
 */
@Entity
@Table(name = "templates", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_is_premium", columnList = "is_premium")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @Column(nullable = false)
    private String category;

    @Column(name = "is_premium", nullable = false)
    private Boolean isPremium = false;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "download_count")
    private Long downloadCount = 0L;

    /**
     * JSON configuration for template styling
     * Contains colors, fonts, spacing rules
     */
    @Column(columnDefinition = "TEXT")
    private String configuration;

    @OneToMany(mappedBy = "template")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Resume> resumes = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Increment download count
     */
    public void incrementDownloadCount() {
        this.downloadCount++;
    }
}

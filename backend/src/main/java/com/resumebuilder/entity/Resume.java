package com.resumebuilder.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Resume entity storing user resume data
 * Content stored as JSON for flexibility
 */
@Entity
@Table(name = "resumes", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_template_id", columnList = "template_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Template template;

    /**
     * JSON content structure:
     * {
     *   "personal": {"name": "", "email": "", "phone": "", "address": "", "summary": ""},
     *   "education": [{"institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": ""}],
     *   "experience": [{"company": "", "position": "", "location": "", "startDate": "", "endDate": "", "description": []}],
     *   "skills": {"technical": [], "languages": [], "soft": []},
     *   "projects": [{"name": "", "description": "", "technologies": [], "link": ""}],
     *   "certifications": [{"name": "", "issuer": "", "date": ""}],
     *   "achievements": []
     * }
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    @Builder.Default
    private String content = "{}";

    @Column(name = "is_draft")
    @Builder.Default
    private Boolean isDraft = true;

    @Column(name = "last_saved_at")
    private LocalDateTime lastSavedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Auto-save timestamp update
     */
    public void markSaved() {
        this.lastSavedAt = LocalDateTime.now();
    }
}

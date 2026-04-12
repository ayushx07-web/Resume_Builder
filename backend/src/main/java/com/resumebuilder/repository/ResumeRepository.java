package com.resumebuilder.repository;

import com.resumebuilder.entity.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    Page<Resume> findByUserId(Long userId, Pageable pageable);

    List<Resume> findByUserId(Long userId);

    Optional<Resume> findByIdAndUserId(Long id, Long userId);

    List<Resume> findByUserIdAndIsDraft(Long userId, Boolean isDraft);

    List<Resume> findByTemplateId(Long templateId);

    long countByUserId(Long userId);

    long countByUserIdAndIsDraft(Long userId, Boolean isDraft);

    @Query("SELECT r FROM Resume r WHERE r.user.id = :userId AND LOWER(r.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Resume> searchUserResumes(Long userId, String searchTerm, Pageable pageable);

    @Query("SELECT r FROM Resume r WHERE r.user.id = :userId ORDER BY r.updatedAt DESC")
    List<Resume> findRecentlyUpdatedByUser(Long userId, Pageable pageable);
}

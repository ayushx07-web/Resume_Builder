package com.resumebuilder.repository;

import com.resumebuilder.entity.Template;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {

    List<Template> findByIsActive(Boolean isActive);

    Page<Template> findByIsActive(Boolean isActive, Pageable pageable);

    List<Template> findByIsPremiumAndIsActive(Boolean isPremium, Boolean isActive);

    List<Template> findByCategoryAndIsActive(String category, Boolean isActive);

    Page<Template> findByCategoryAndIsActive(String category, Boolean isActive, Pageable pageable);

    @Query("SELECT DISTINCT t.category FROM Template t")
    List<String> findDistinctCategory();

    long countByIsPremium(Boolean isPremium);

    long countByIsActive(Boolean isActive);
}
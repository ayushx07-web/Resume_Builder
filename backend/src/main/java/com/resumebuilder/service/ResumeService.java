package com.resumebuilder.service;

import com.resumebuilder.dto.request.ResumeRequest;
import com.resumebuilder.entity.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ResumeService {
    Resume createResume(ResumeRequest request, String userEmail);
    Resume updateResume(Long id, ResumeRequest request, String userEmail);
    Resume getResume(Long id, String userEmail);
    Page<Resume> getUserResumes(String userEmail, Pageable pageable);
    void deleteResume(Long id, String userEmail);
    byte[] generatePdf(Long id, String userEmail);
}

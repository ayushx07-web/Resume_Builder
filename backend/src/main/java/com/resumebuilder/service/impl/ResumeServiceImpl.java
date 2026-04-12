package com.resumebuilder.service.impl;

import com.resumebuilder.dto.request.ResumeRequest;
import com.resumebuilder.entity.Resume;
import com.resumebuilder.entity.User;
import com.resumebuilder.exception.ResourceNotFoundException;
import com.resumebuilder.repository.ResumeRepository;
import com.resumebuilder.repository.UserRepository;
import com.resumebuilder.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Resume createResume(ResumeRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        Resume resume = Resume.builder()
                .title(request.getTitle() != null ? request.getTitle() : "My Resume")
                .content(request.getContent() != null ? request.getContent() : "{}")
                .user(user)
                .isDraft(request.getIsDraft() != null ? request.getIsDraft() : true)
                .lastSavedAt(LocalDateTime.now())
                .build();

        return resumeRepository.save(resume);
    }

    @Override
    @Transactional
    public Resume updateResume(Long id, ResumeRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        if (request.getTitle() != null) resume.setTitle(request.getTitle());
        if (request.getContent() != null) resume.setContent(request.getContent());
        if (request.getIsDraft() != null) resume.setIsDraft(request.getIsDraft());
        resume.setLastSavedAt(LocalDateTime.now());

        return resumeRepository.save(resume);
    }

    @Override
    public Resume getResume(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));
    }

    @Override
    public Page<Resume> getUserResumes(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return resumeRepository.findByUserId(user.getId(), pageable);
    }

    @Override
    @Transactional
    public void deleteResume(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        resumeRepository.delete(resume);
    }

    @Override
    public byte[] generatePdf(Long id, String userEmail) {
        Resume resume = getResume(id, userEmail);
        // Simple HTML to PDF placeholder - returns basic HTML as bytes
        String html = "<html><body><h1>" + resume.getTitle() + "</h1><pre>" + resume.getContent() + "</pre></body></html>";
        return html.getBytes();
    }
}

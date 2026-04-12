package com.resumebuilder.controller;

import com.resumebuilder.dto.request.ResumeRequest;
import com.resumebuilder.dto.response.ApiResponse;
import com.resumebuilder.entity.Resume;
import com.resumebuilder.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeService resumeService;

    @GetMapping
    public ResponseEntity<ApiResponse> getResumes(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        Page<Resume> resumes = resumeService.getUserResumes(
                userDetails.getUsername(),
                PageRequest.of(page, size, Sort.by("updatedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Resumes fetched", resumes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        Resume resume = resumeService.getResume(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume fetched", resume));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createResume(
            @Valid @RequestBody ResumeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        Resume resume = resumeService.createResume(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume created", resume));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateResume(
            @PathVariable Long id,
            @RequestBody ResumeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        Resume resume = resumeService.updateResume(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume updated", resume));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        resumeService.deleteResume(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume deleted"));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        byte[] pdf = resumeService.generatePdf(id, userDetails.getUsername());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "resume.pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

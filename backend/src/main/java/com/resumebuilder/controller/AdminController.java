package com.resumebuilder.controller;

import com.resumebuilder.dto.response.ApiResponse;
import com.resumebuilder.entity.User;
import com.resumebuilder.exception.ResourceNotFoundException;
import com.resumebuilder.repository.ResumeRepository;
import com.resumebuilder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<User> users = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Users fetched", users));
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse> toggleBlock(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(!user.getActive());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(
                user.getActive() ? "User unblocked" : "User blocked", null));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalResumes", resumeRepository.count());
        stats.put("activeUsers", userRepository.countByActive(true));
        stats.put("totalRevenue", 0);
        stats.put("totalPayments", 0);
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched", stats));
    }
}

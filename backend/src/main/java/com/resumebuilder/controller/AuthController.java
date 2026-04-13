package com.resumebuilder.controller;

import com.resumebuilder.dto.request.LoginRequest;
import com.resumebuilder.dto.request.SignupRequest;
import com.resumebuilder.dto.response.ApiResponse;
import com.resumebuilder.dto.response.AuthResponse;
import com.resumebuilder.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and user registration endpoints")
public class AuthController {

    private final AuthService authService;
    private final org.springframework.mail.javamail.JavaMailSender javaMailSender;

    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestParam String to, @Value("${spring.mail.from:ayushkandpal68@gmail.com}") String from) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject("SMTP Diagnostic Test");
            message.setText("If you are receiving this, your Render SMTP settings are 100% correct!");
            javaMailSender.send(message);
            return ResponseEntity.ok("Email sent successfully to " + to + ". Check your inbox!");
        } catch (Exception e) {
            StringBuilder error = new StringBuilder(e.getMessage() + "\n");
            Throwable cause = e.getCause();
            while (cause != null) {
                error.append("Caused by: ").append(cause.getMessage()).append("\n");
                cause = cause.getCause();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("SMTP FAILURE DIAGNOSTIC:\n\n" + error.toString());
        }
    }

    @PostMapping("/signup")
    @Operation(summary = "Register new user", description = "Create a new user account and send verification email")
    public ResponseEntity<ApiResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully. Please verify your email.", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and get JWT token")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verify user email with the 6-digit code")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email and code are required"));
        }
        try {
            authService.verifyEmail(email, code);
            return ResponseEntity.ok(ApiResponse.success("Email verified successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification code", description = "Resend the email verification code")
    public ResponseEntity<ApiResponse> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }
        try {
            authService.resendVerificationCode(email);
            return ResponseEntity.ok(ApiResponse.success("Verification code resent!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

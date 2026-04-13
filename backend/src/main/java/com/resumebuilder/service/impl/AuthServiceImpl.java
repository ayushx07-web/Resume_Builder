package com.resumebuilder.service.impl;

import com.resumebuilder.dto.request.LoginRequest;
import com.resumebuilder.dto.request.SignupRequest;
import com.resumebuilder.dto.response.AuthResponse;
import com.resumebuilder.entity.User;
import com.resumebuilder.repository.UserRepository;
import com.resumebuilder.service.AuthService;
import com.resumebuilder.service.EmailService;
import com.resumebuilder.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final EmailService emailService;

    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        String verificationCode = generateVerificationCode();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(User.Role.USER)
                .active(true)
                .emailVerified(false)
                .resetToken(verificationCode)
                .resetTokenExpiry(LocalDateTime.now().plusMinutes(15))
                .build();

        user = userRepository.save(user);

        // Send verification email synchronously so errors are visible
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationCode);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .hasPremiumAccess(user.hasPremiumAccess())
                .emailVerified(false)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmailOrUsername(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userDetailsService.loadUserEntity(userDetails.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .hasPremiumAccess(user.hasPremiumAccess())
                .emailVerified(user.getEmailVerified() != null && user.getEmailVerified())
                .build();
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        if (user.getResetToken() == null || !user.getResetToken().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        String newCode = generateVerificationCode();
        user.setResetToken(newCode);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), newCode);
        } catch (Exception e) {
            // Log but don't fail the request since email sending is now async/background
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
    }
}

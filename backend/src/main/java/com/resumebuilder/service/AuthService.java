package com.resumebuilder.service;

import com.resumebuilder.dto.request.LoginRequest;
import com.resumebuilder.dto.request.SignupRequest;
import com.resumebuilder.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
    void verifyEmail(String email, String code);
    void resendVerificationCode(String email);
}

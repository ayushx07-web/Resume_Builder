package com.resumebuilder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @Value("${app.name:Resume Builder}")
    private String appName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(String toEmail, String username, String verificationCode) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email - " + appName);

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                    <div style="background: linear-gradient(135deg, #2563eb 0%%, #7c3aed 100%%); padding: 40px 32px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">%s</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Email Verification</p>
                    </div>
                    <div style="padding: 32px;">
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hello <strong>%s</strong>,</p>
                        <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Welcome! Please use the verification code below to confirm your email address:</p>
                        <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">%s</span>
                        </div>
                        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0 0 16px;">This code expires in <strong>15 minutes</strong>.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                </div>
                """.formatted(appName, username, verificationCode);

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            System.out.println("Verification email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("CRITICAL: MessagingException while sending email to " + toEmail);
            System.err.println("Error Message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send verification email: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("CRITICAL: Unexpected error while sending email to " + toEmail);
            System.err.println("Error details: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}

package com.resumebuilder.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        // Fallback to valid strings if environment variables failed to inject properly to avoid crash on startup 
        // We will catch integration errors during the actual request later
        if (keyId == null || keyId.isEmpty() || keyId.equals("your_razorpay_key_id")) {
             return new RazorpayClient("dummy_id", "dummy_secret");
        }
        return new RazorpayClient(keyId, keySecret);
    }
}

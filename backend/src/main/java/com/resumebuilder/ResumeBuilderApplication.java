package com.resumebuilder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main Spring Boot Application for Resume Builder
 * Enables JPA Auditing for automatic timestamp management
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class ResumeBuilderApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResumeBuilderApplication.class, args);
    }
}

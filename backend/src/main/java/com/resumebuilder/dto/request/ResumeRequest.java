package com.resumebuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResumeRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String content;
    private Long templateId;
    private Boolean isDraft;
}

package com.resumebuilder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateResponse {
    private Long id;
    private String name;
    private String description;
    private String previewImageUrl;
    private String category;
    private Boolean isPremium;
    private BigDecimal price;
    private Boolean isActive;
    private Long downloadCount;
    private String configuration;
    private LocalDateTime createdAt;
}

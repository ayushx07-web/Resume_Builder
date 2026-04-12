package com.resumebuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private String previewImageUrl;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotNull(message = "Premium status is required")
    private Boolean isPremium;
    
    private BigDecimal price;
    
    private String configuration;
    
    private Boolean isActive = true;
}

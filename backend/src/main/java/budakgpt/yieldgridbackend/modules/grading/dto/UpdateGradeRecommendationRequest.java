package budakgpt.yieldgridbackend.modules.grading.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateGradeRecommendationRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 500) String description
) {
}

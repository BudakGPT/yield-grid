package budakgpt.yieldgridbackend.modules.grading.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record VlmGradingResult(
        @JsonProperty("detected_produce_type") String detectedProduceType,
        @JsonProperty("matches_declared_produce") boolean matchesDeclaredProduce,
        @JsonProperty("image_usable") boolean imageUsable,
        @JsonProperty("grade_distribution") GradeDistribution gradeDistribution,
        @JsonProperty("est_shelf_life") ShelfLifeEstimate estShelfLife,
        @JsonProperty("defects_observed") List<String> defectsObserved,
        @JsonProperty("model_confidence") String modelConfidence
) {
    public record GradeDistribution(
            @JsonProperty("A") BigDecimal a,
            @JsonProperty("B") BigDecimal b,
            BigDecimal reject
    ) {
    }

    public record ShelfLifeEstimate(
            String band,
            @JsonProperty("approx_days") int approxDays,
            String basis
    ) {
    }
}

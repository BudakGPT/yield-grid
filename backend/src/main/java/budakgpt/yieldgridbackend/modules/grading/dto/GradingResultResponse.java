package budakgpt.yieldgridbackend.modules.grading.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GradingResultResponse(
        @JsonProperty("scan_id") UUID scanId,
        @JsonProperty("produce_type") String produceType,
        @JsonProperty("crate_count") int crateCount,
        @JsonProperty("est_weight_kg") BigDecimal estWeightKg,
        @JsonProperty("grade_distribution") GradeDistribution gradeDistribution,
        @JsonProperty("est_shelf_life") ShelfLifeEstimate estShelfLife,
        @JsonProperty("defects_observed") List<String> defectsObserved,
        @JsonProperty("suggested_unit_price") BigDecimal suggestedUnitPrice,
        @JsonProperty("rubric_version") String rubricVersion,
        @JsonProperty("model_confidence") String modelConfidence,
        @JsonProperty("photo_url") String photoUrl,
        @JsonProperty("ipfs_cid") String ipfsCid,
        String signature
) {
    public record GradeDistribution(
            @JsonProperty("A") BigDecimal a,
            @JsonProperty("B") BigDecimal b,
            BigDecimal reject
    ) {
    }

    public record ShelfLifeEstimate(String band, @JsonProperty("approx_days") int approxDays, String basis) {
    }
}
